import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import {
  AuthServiceError,
  normalizeAuthServiceError,
  requireAuthUser,
} from "@/lib/auth-service";
import {
  buildIdFilter,
  findTeamById,
  hydrateTeam,
  hydrateTeams,
  normalizeId,
  type TeamDoc,
} from "@/lib/team-service";

export async function GET(_req: NextRequest) {
  try {
    const db = await getDb();
    const list = await db.collection<TeamDoc>("teams").find({}).toArray();
    const hydrated = await hydrateTeams(db, list);
    return NextResponse.json(hydrated);
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = (body?.name || "").trim();
  const tag = (body?.tag || "").trim() || undefined;
  if (!name) return NextResponse.json({ message: "Name is required" }, { status: 400 });
  try {
    const { user } = await requireAuthUser(req);
    const db = await getDb();
    const team: TeamDoc = {
      _id: new ObjectId(),
      name,
      tag,
      managerId: user.id,
      members: [user.id],
      captainIds: [],
      createdAt: new Date().toISOString(),
    };
    await db.collection<TeamDoc>("teams").insertOne(team);
    const teamId = normalizeId(team._id);
    await db
      .collection("users")
      .updateOne(buildIdFilter(user.id), { $set: { teamId } });
    const response = await hydrateTeam(db, team);
    return NextResponse.json(response, { status: 201 });
  } catch (e: any) {
    if (e instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(e);
      return NextResponse.json(payload, { status });
    }
    const code = /duplicate key/i.test(e?.message) ? 409 : 500;
    return NextResponse.json({ message: e.message || "Server error" }, { status: code });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ message: "id required" }, { status: 400 });
  try {
    const { user } = await requireAuthUser(req);
    const db = await getDb();
    const team = await findTeamById(db, id);
    if (!team) return NextResponse.json({ message: "Not found" }, { status: 404 });
    if (String(team.managerId) !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const teamId = normalizeId(team._id);
    await db.collection<TeamDoc>("teams").deleteOne(buildIdFilter(teamId));
    await db.collection("users").updateMany({ teamId }, { $unset: { teamId: "" } });
    await db.collection("teamJoinRequests").deleteMany({ teamId });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(e);
      return NextResponse.json(payload, { status });
    }
    return NextResponse.json({ message: e.message || "Server error" }, { status: 500 });
  }
}
