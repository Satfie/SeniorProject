import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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
  type TeamDoc,
  type UserDoc,
} from "@/lib/team-service";
import { createNotification } from "@/lib/notification-service";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; requestId: string }> }
) {
  const { id, requestId } = await context.params;
  try {
    const { user } = await requireAuthUser(req);
    const db = await getDb();
    const team = await findTeamById(db, id);
    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }
    const managerId = String(team.managerId || "");
    if (user.id !== managerId && user.role !== "admin") {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }
    const teamId = normalizeId(team._id);
    const joinRequests = db.collection<JoinRequestDoc>("teamJoinRequests");
    const requestDoc = await joinRequests.findOne({
      ...buildIdFilter(requestId),
      teamId,
    });
    if (!requestDoc) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }
    if (requestDoc.status !== "pending") {
      return NextResponse.json(
        { message: "Request already processed" },
        { status: 400 }
      );
    }
    const usersCol = db.collection<UserDoc>("users");
    const targetUser = await usersCol.findOne(buildIdFilter(requestDoc.userId));
    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const existingTeamId = targetUser.teamId ? String(targetUser.teamId) : undefined;
    if (existingTeamId && existingTeamId !== teamId) {
      return NextResponse.json({ message: "User already joined another team" }, { status: 400 });
    }
    await Promise.all([
      joinRequests.updateOne(
        { _id: requestDoc._id },
        { $set: { status: "approved" } }
      ),
      db
        .collection<TeamDoc>("teams")
        .updateOne(buildIdFilter(teamId), {
          $addToSet: { members: requestDoc.userId },
        }),
      usersCol.updateOne(buildIdFilter(requestDoc.userId), {
        $set: { teamId },
      }),
    ]);
    await joinRequests.updateMany(
      {
        teamId,
        userId: requestDoc.userId,
        status: "pending",
        _id: { $ne: requestDoc._id },
      },
      { $set: { status: "declined" } }
    );
    const updated = await joinRequests.findOne({ _id: requestDoc._id });
    await createNotification(db, {
      userId: requestDoc.userId,
      type: "success",
      message: `You were approved to join team ${team.name}`,
      teamId,
      metadata: { teamId, requestId: normalizeId(requestDoc._id) },
    });
    return NextResponse.json(serializeJoinRequest(updated!));
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error);
      return NextResponse.json(payload, { status });
    }
    console.error("[teams.requests.approve] unexpected error", error);
    return NextResponse.json(
      { message: error?.message || "Failed to approve" },
      { status: 500 }
    );
  }
}
