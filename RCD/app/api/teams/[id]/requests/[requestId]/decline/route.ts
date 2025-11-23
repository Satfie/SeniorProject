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
    await joinRequests.updateOne(
      { _id: requestDoc._id },
      { $set: { status: "declined" } }
    );
    const updated = await joinRequests.findOne({ _id: requestDoc._id });
    await createNotification(db, {
      userId: requestDoc.userId,
      type: "info",
      message: `Your request to join ${team.name} was declined`,
      teamId,
      metadata: { teamId, requestId: normalizeId(requestDoc._id) },
    });
    return NextResponse.json(serializeJoinRequest(updated!));
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error);
      return NextResponse.json(payload, { status });
    }
    console.error("[teams.requests.decline] unexpected error", error);
    return NextResponse.json(
      { message: error?.message || "Failed to decline" },
      { status: 500 }
    );
  }
}
