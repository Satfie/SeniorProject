import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

// NOTE: This route now uses MongoDB instead of the in-memory mock.
// Other API routes still rely on the mock store until migrated.

type TeamDoc = {
  _id: ObjectId;
  name: string;
  tag?: string;
  managerId: string;
  members: string[]; // user _id list
  captainIds?: string[];
  createdAt: string;
};

type UserDoc = {
  _id: string;
  email: string;
  role: string;
  username?: string;
};

export async function GET(_req: NextRequest) {
  try {
    const db = await getDb();
    const list = await db.collection<TeamDoc>("teams").find({}).toArray();
    const mapped = list.map(t => {
      const rawId: any = t._id;
      const id = rawId && typeof rawId === 'object' && 'toHexString' in rawId ? rawId.toHexString() : String(rawId);
      return { ...t, _id: id, id };
    });
    return NextResponse.json(mapped);
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = (body?.name || "").trim();
  const tag = (body?.tag || "").trim() || undefined;
  if (!name) return NextResponse.json({ message: "Name is required" }, { status: 400 });
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const db = await getDb();
    const userQuery: any = (token.length === 24 && /^[0-9a-fA-F]+$/.test(token)) ? { _id: new ObjectId(token) } : { _id: token };
    const user = await db.collection<UserDoc>("users").findOne(userQuery);
    if (!user) return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    const team: TeamDoc = {
      _id: new ObjectId(),
      name,
      tag,
      managerId: user._id,
      members: [user._id],
      captainIds: [],
      createdAt: new Date().toISOString(),
    };
    await db.collection<TeamDoc>("teams").insertOne(team);
    const response = { ...team, _id: team._id.toHexString(), id: team._id.toHexString() };
    return NextResponse.json(response, { status: 201 });
  } catch (e: any) {
    const code = /duplicate key/i.test(e?.message) ? 409 : 500;
    return NextResponse.json({ message: e.message || "Server error" }, { status: code });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ message: "id required" }, { status: 400 });
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const db = await getDb();
    // Support legacy string ids (seed) or ObjectId
    let query: any
    if (id.length === 24 && /^[0-9a-fA-F]+$/.test(id)) {
      try { query = { _id: new ObjectId(id) } } catch { query = { _id: id } }
    } else {
      query = { _id: id }
    }
    const team = await db.collection<TeamDoc>("teams").findOne(query);
    if (!team) return NextResponse.json({ message: "Not found" }, { status: 404 });
    if (team.managerId !== token) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    await db.collection<TeamDoc>("teams").deleteOne(query);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "Server error" }, { status: 500 });
  }
}
