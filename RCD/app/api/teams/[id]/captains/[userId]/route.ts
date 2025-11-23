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
  hydrateTeam,
  normalizeId,
  type TeamDoc,
} from "@/lib/team-service";

async function toggleCaptain(
  req: NextRequest,
  params: { id: string; userId: string },
  enable: boolean
) {
  const { id, userId } = params;
  const db = await getDb();
  const { user } = await requireAuthUser(req);
  const team = await findTeamById(db, id);
  if (!team) {
    return NextResponse.json({ message: "Team not found" }, { status: 404 });
  }
  const managerId = String(team.managerId || "");
  if (user.id !== managerId && user.role !== "admin") {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }
  const memberIds = Array.isArray(team.members)
    ? team.members.map((m) => String(m))
    : [];
  if (!memberIds.includes(userId)) {
    return NextResponse.json({ message: "Member not found" }, { status: 404 });
  }
  const teamId = normalizeId(team._id);
  const update = enable
    ? { $addToSet: { captainIds: userId } }
    : { $pull: { captainIds: userId } };
  await db.collection<TeamDoc>("teams").updateOne(buildIdFilter(teamId), update);
  const refreshed = await findTeamById(db, id);
  const payload = await hydrateTeam(db, refreshed);
  if (!payload) {
    return NextResponse.json({ message: "Team not found" }, { status: 404 });
  }
  return NextResponse.json(payload);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const params = await context.params;
    return await toggleCaptain(req, params, true);
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error);
      return NextResponse.json(payload, { status });
    }
    console.error("[teams.captains.add] unexpected error", error);
    return NextResponse.json(
      { message: error?.message || "Failed to add captain" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const params = await context.params;
    return await toggleCaptain(req, params, false);
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error);
      return NextResponse.json(payload, { status });
    }
    console.error("[teams.captains.remove] unexpected error", error);
    return NextResponse.json(
      { message: error?.message || "Failed to remove captain" },
      { status: 500 }
    );
  }
}
