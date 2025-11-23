import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";

type Role = "guest" | "player" | "team_manager" | "admin";

type UserDoc = {
  _id: any;
  email: string;
  username?: string;
  role: Role;
  password?: string;
};

async function getAuthUser(req: NextRequest): Promise<UserDoc | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const db = await getDb();
  const user = await db.collection<UserDoc>("users").findOne({ _id: token });
  if (!user) return null;
  return user;
}

export async function GET(_req: NextRequest) {
  const db = await getDb();
  const docs = await db.collection<UserDoc>("users").find({}).toArray();
  const list = docs.map((u) => ({
    id: String(u._id),
    email: u.email,
    username: u.username,
    role: u.role,
  }));
  return NextResponse.json(list);
}

export async function DELETE(req: NextRequest) {
  const me = await getAuthUser(req);
  if (!me || me.role !== "admin") {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json({ message: "id required" }, { status: 400 });
  const db = await getDb();
  // prevent deleting self or last admin
  const toDelete = await db.collection<UserDoc>("users").findOne({ _id: id });
  if (!toDelete) return NextResponse.json({ message: "not found" }, { status: 404 });
  if (String(toDelete._id) === String(me._id)) {
    return NextResponse.json({ message: "cannot delete self" }, { status: 400 });
  }
  if (toDelete.role === "admin") {
    const adminCount = await db.collection<UserDoc>("users").countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return NextResponse.json({ message: "cannot delete last admin" }, { status: 400 });
    }
  }
  await db.collection<UserDoc>("users").deleteOne({ _id: id });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const me = await getAuthUser(req);
  if (!me || me.role !== "admin") {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const id = body?.id as string | undefined;
  const role = body?.role as Role | undefined;
  if (!id || !role)
    return NextResponse.json(
      { message: "id and role required" },
      { status: 400 }
    );
  const db = await getDb();
  const user = await db.collection<UserDoc>("users").findOne({ _id: id });
  if (!user) return NextResponse.json({ message: "not found" }, { status: 404 });
  await db.collection<UserDoc>("users").updateOne({ _id: id }, { $set: { role } });
  return NextResponse.json({ success: true });
}
