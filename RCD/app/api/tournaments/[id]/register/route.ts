import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import {
  AuthServiceError,
  normalizeAuthServiceError,
  requireAuthUser,
} from "@/lib/auth-service";
import { findTeamById, normalizeId } from "@/lib/team-service";
import { createTournamentRegistration } from "@/lib/tournament-service";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({})) as { teamId?: string };
  try {
    const { user } = await requireAuthUser(req);
    const db = await getDb();
    let teamId = typeof body?.teamId === "string" ? body.teamId : undefined;
    if (!teamId && user.teamId) {
      teamId = user.teamId;
    }
    if (!teamId) {
      return NextResponse.json({ message: "teamId is required" }, { status: 400 });
    }
    const team = await findTeamById(db, teamId);
    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }
    const managerId = String(team.managerId || "");
    const captainIds = Array.isArray(team.captainIds)
      ? team.captainIds.map(String)
      : [];
    const isAuthorized =
      user.id === managerId || captainIds.includes(user.id) || user.role === "admin";
    if (!isAuthorized) {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }
    const registration = await createTournamentRegistration(
      db,
      id,
      normalizeId(team._id)
    );
    return NextResponse.json(registration, { status: 201 });
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error);
      return NextResponse.json(payload, { status });
    }
    const status = /not found|closed|full|already/.test(error?.message || "")
      ? 400
      : 500;
    return NextResponse.json(
      { message: error?.message || "Unable to register" },
      { status }
    );
  }
}
