import { ObjectId } from "mongodb";
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
  normalizeId,
  serializeJoinRequest,
  type JoinRequestDoc,
} from "@/lib/team-service";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const message = typeof body?.message === "string" ? body.message.slice(0, 500) : undefined;

  try {
    const { user } = await requireAuthUser(req);
    const db = await getDb();
    const team = await findTeamById(db, id);
    if (!team) return NextResponse.json({ message: "Team not found" }, { status: 404 });
    const teamId = normalizeId(team._id);
    const memberIds = new Set<string>([
      ...(Array.isArray(team.members) ? team.members.map(String) : []),
      String(team.managerId),
    ]);
    if (memberIds.has(user.id)) {
      return NextResponse.json({ message: "Already a team member" }, { status: 400 });
    }
    const userFilter = buildIdFilter(user.id);
    const userDoc = await db.collection("users").findOne(userFilter);
    if (!userDoc) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const existingTeamId = userDoc.teamId ? String(userDoc.teamId) : undefined;
    if (existingTeamId === teamId) {
      return NextResponse.json({ message: "Already a team member" }, { status: 400 });
    }
    if (existingTeamId && existingTeamId !== teamId) {
      return NextResponse.json({ message: "Already joined another team" }, { status: 400 });
    }
    const duplicate = await db
      .collection<JoinRequestDoc>("teamJoinRequests")
      .findOne({ teamId, userId: user.id, status: "pending" });
    if (duplicate) {
      return NextResponse.json({ message: "Request already pending" }, { status: 409 });
    }
    const doc: JoinRequestDoc = {
      _id: new ObjectId(),
      teamId,
      userId: user.id,
      status: "pending",
      createdAt: new Date().toISOString(),
      message,
    };
    await db.collection<JoinRequestDoc>("teamJoinRequests").insertOne(doc);
    return NextResponse.json(serializeJoinRequest(doc), { status: 201 });
  } catch (e: any) {
    if (e instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(e);
      return NextResponse.json(payload, { status });
    }
    return NextResponse.json({ message: e?.message || "Failed to request join" }, { status: 400 });
  }
}
