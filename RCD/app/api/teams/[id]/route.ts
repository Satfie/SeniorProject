import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  AuthServiceError,
  normalizeAuthServiceError,
  requireAuthUser,
} from "@/lib/auth-service";
import {
  buildIdFilter,
  findTeamById,
  hydrateTeam,
  normalizeId,
  type TeamDoc,
} from "@/lib/team-service";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const db = await getDb();
  const teamDoc = await findTeamById(db, id);
  if (!teamDoc)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  const team = await hydrateTeam(db, teamDoc);
  return NextResponse.json(team);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name.trim() : undefined;
  const tag = typeof body?.tag === "string" ? body.tag.trim() : undefined;
  if (!name && typeof tag === "undefined") {
    return NextResponse.json({ message: "No changes provided" }, { status: 400 });
  }
  try {
    const { user } = await requireAuthUser(req);
    const db = await getDb();
    const team = await findTeamById(db, id);
    if (!team)
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    const managerId = String(team.managerId);
    const captains = Array.isArray(team.captainIds)
      ? team.captainIds.map(String)
      : [];
    const isManager = managerId === user.id;
    const isCaptain = captains.includes(user.id);
    if (!isManager && !isCaptain) {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }
    const updates: Partial<TeamDoc> = {};
    if (name) updates.name = name;
    if (typeof tag !== "undefined") updates.tag = tag || undefined;
    if (Object.keys(updates).length) {
      await db
        .collection<TeamDoc>("teams")
        .updateOne(buildIdFilter(normalizeId(team._id)), { $set: updates });
    }
    const refreshed = await findTeamById(db, id);
    const payload = await hydrateTeam(db, refreshed);
    return NextResponse.json(payload);
  } catch (e: any) {
    if (e instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(e);
      return NextResponse.json(payload, { status });
    }
    const code = /duplicate key/i.test(e?.message) ? 409 : 500;
    return NextResponse.json({ message: e?.message || "Server error" }, { status: code });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ message: "id required" }, { status: 400 });
  try {
    const { user } = await requireAuthUser(req);
    const db = await getDb();
    const team = await findTeamById(db, id);
    if (!team) return NextResponse.json({ message: "Not found" }, { status: 404 });
    const isManager = String(team.managerId) === user.id;
    const isAdmin = user.role === "admin";
    if (!isManager && !isAdmin) {
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
    return NextResponse.json({ message: e?.message || "Server error" }, { status: 500 });
  }
}
