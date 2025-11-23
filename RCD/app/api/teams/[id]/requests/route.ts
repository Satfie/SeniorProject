import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import {
  AuthServiceError,
  normalizeAuthServiceError,
  requireAuthUser,
} from "@/lib/auth-service";
import {
  fetchUsersByIds,
  findTeamById,
  normalizeId,
  serializeJoinRequest,
  type JoinRequestDoc,
} from "@/lib/team-service";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const { user } = await requireAuthUser(req);
    const db = await getDb();
    const teamDoc = await findTeamById(db, id);
    if (!teamDoc) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }
    const teamId = normalizeId(teamDoc._id);
    const requests = await db
      .collection<JoinRequestDoc>("teamJoinRequests")
      .find({ teamId })
      .sort({ createdAt: -1 })
      .toArray();
    if (!requests.length) {
      return NextResponse.json([]);
    }
    const userMap = await fetchUsersByIds(
      db,
      requests.map((doc) => doc.userId)
    );
    const managerId = String(teamDoc.managerId || "");
    const captainIds = Array.isArray(teamDoc.captainIds)
      ? teamDoc.captainIds.map(String)
      : [];
    const canViewAll =
      user.id === managerId ||
      captainIds.includes(user.id) ||
      user.role === "admin";
    const visible = canViewAll
      ? requests
      : requests.filter((doc) => doc.userId === user.id);
    const payload = visible.map((doc) => ({
      ...serializeJoinRequest(doc),
      user: userMap.get(doc.userId),
    }));
    return NextResponse.json(payload);
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error);
      return NextResponse.json(payload, { status });
    }
    console.error("[teams.requests] unexpected error", error);
    return NextResponse.json(
      { message: error?.message || "Failed to load requests" },
      { status: 500 }
    );
  }
}
