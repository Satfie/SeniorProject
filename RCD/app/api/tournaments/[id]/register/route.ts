import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import {
  AuthServiceError,
  normalizeAuthServiceError,
  requireAuthUser,
} from "@/lib/auth-service";
import { findTeamById, normalizeId } from "@/lib/team-service";
import { createTournamentRegistration, getTournamentById } from "@/lib/tournament-service";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({})) as { teamId?: string; playerIds?: string[] };
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
    const tournament = await getTournamentById(db, id);
    if (!tournament) {
      return NextResponse.json({ message: "Tournament not found" }, { status: 404 });
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
    const eligibleIds: string[] = [];
    const seen = new Set<string>();
    const addEligible = (value: unknown) => {
      if (!value) return;
      const str = String(value);
      if (!str) return;
      if (seen.has(str)) return;
      seen.add(str);
      eligibleIds.push(str);
    };
    if (Array.isArray(team.members)) {
      team.members.forEach((member) => addEligible(member));
    }
    addEligible(team.managerId);
    if (Array.isArray(team.captainIds)) {
      team.captainIds.forEach((cid) => addEligible(cid));
    }

    if (!eligibleIds.length) {
      return NextResponse.json(
        { message: "Team has no eligible members" },
        { status: 400 }
      );
    }

    const targetRosterSize =
      typeof tournament.rosterSize === "number" && tournament.rosterSize > 0
        ? tournament.rosterSize
        : undefined;

    if (targetRosterSize && eligibleIds.length < targetRosterSize) {
      return NextResponse.json(
        {
          message: `Tournament requires ${targetRosterSize} players but the team only has ${eligibleIds.length}`,
        },
        { status: 400 }
      );
    }

    let selectedIds: string[] | undefined = Array.isArray(body.playerIds)
      ? Array.from(new Set(body.playerIds.map((pid) => String(pid).trim()).filter(Boolean)))
      : undefined;

    if (selectedIds?.length) {
      const invalid = selectedIds.find((pid) => !seen.has(pid));
      if (invalid) {
        return NextResponse.json(
          { message: "One or more selected players are not on this team" },
          { status: 400 }
        );
      }
    }

    if (targetRosterSize && eligibleIds.length > targetRosterSize) {
      if (!selectedIds || selectedIds.length !== targetRosterSize) {
        return NextResponse.json(
          {
            message: `Select exactly ${targetRosterSize} players for this tournament`,
          },
          { status: 400 }
        );
      }
    } else if (!selectedIds || !selectedIds.length) {
      selectedIds = eligibleIds.slice(
        0,
        targetRosterSize ? Math.min(targetRosterSize, eligibleIds.length) : eligibleIds.length
      );
    }

    const registration = await createTournamentRegistration(
      db,
      id,
      normalizeId(team._id),
      { playerIds: selectedIds }
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
