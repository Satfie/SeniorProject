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
  hydrateTeams,
  normalizeId,
  serializeJoinRequest,
  type JoinRequestDoc,
  type TeamDoc,
} from "@/lib/team-service";

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuthUser(req);
    const isManager = user.role === "team_manager";
    const isAdmin = user.role === "admin";
    if (!isManager && !isAdmin) {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }
    const db = await getDb();
    const managedTeams = await db
      .collection<TeamDoc>("teams")
      .find(isAdmin ? {} : { managerId: user.id })
      .toArray();
    if (!managedTeams.length) {
      return NextResponse.json([]);
    }
    const teamIds = managedTeams.map((doc) => normalizeId(doc._id));
    const joinRequests = await db
      .collection<JoinRequestDoc>("teamJoinRequests")
      .find({ teamId: { $in: teamIds }, status: "pending" })
      .sort({ createdAt: -1 })
      .toArray();
    if (!joinRequests.length) {
      return NextResponse.json([]);
    }
    const [userMap, hydratedTeams] = await Promise.all([
      fetchUsersByIds(
        db,
        joinRequests.map((doc) => doc.userId)
      ),
      hydrateTeams(db, managedTeams),
    ]);
    const teamMap = new Map(hydratedTeams.map((team) => [team.id, team]));
    const payload = joinRequests.map((doc) => ({
      ...serializeJoinRequest(doc),
      user: userMap.get(doc.userId),
      team: teamMap.get(doc.teamId),
    }));
    return NextResponse.json(payload);
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error);
      return NextResponse.json(payload, { status });
    }
    console.error("[teams.manager.requests] unexpected error", error);
    return NextResponse.json(
      { message: error?.message || "Failed to load manager requests" },
      { status: 500 }
    );
  }
}
