import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import {
  AuthServiceError,
  normalizeAuthServiceError,
  requireAuthUser,
} from "@/lib/auth-service";
import {
  getTournamentById,
  listTournamentRegistrations,
  startTournamentBracket,
} from "@/lib/tournament-service";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({})) as { format?: "single" | "double" };
  try {
    const { user } = await requireAuthUser(req);
    if (user.role !== "admin") {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }
    const db = await getDb();
    const tournament = await getTournamentById(db, id);
    if (!tournament) {
      return NextResponse.json({ message: "Tournament not found" }, { status: 404 });
    }
    const registrations = await listTournamentRegistrations(db, id);
    const teamIds = registrations
      .filter((reg) => reg.status === "approved")
      .map((reg) => reg.teamId);
    if (teamIds.length < 2) {
      return NextResponse.json({ message: "Not enough teams to start" }, { status: 400 });
    }
    const inferredFormat = body?.format
      ? body.format
      : tournament.type?.toLowerCase().includes("double")
      ? "double"
      : "single";
    const bracket = await startTournamentBracket(db, id, inferredFormat, teamIds);
    return NextResponse.json(bracket);
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error);
      return NextResponse.json(payload, { status });
    }
    const status = /not enough/i.test(error?.message || "") ? 400 : 500;
    return NextResponse.json(
      { message: error?.message || "Failed to start tournament" },
      { status }
    );
  }
}
