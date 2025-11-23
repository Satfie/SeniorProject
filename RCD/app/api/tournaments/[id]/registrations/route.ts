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
} from "@/lib/tournament-service";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuthUser(req);
    if (user.role !== "admin") {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }
    const { id } = await context.params;
    const db = await getDb();
    const tournament = await getTournamentById(db, id);
    if (!tournament) {
      return NextResponse.json({ message: "Tournament not found" }, { status: 404 });
    }
    const regs = await listTournamentRegistrations(db, id);
    return NextResponse.json(regs);
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error);
      return NextResponse.json(payload, { status });
    }
    console.error("[tournaments:registrations] GET failed", error);
    return NextResponse.json(
      { message: error?.message || "Failed to load registrations" },
      { status: 500 }
    );
  }
}
