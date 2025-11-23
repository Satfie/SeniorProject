import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  AuthServiceError,
  normalizeAuthServiceError,
  requireAuthUser,
} from "@/lib/auth-service";
import { getDb } from "@/lib/db";
import { endTournamentAndPayout, getTournamentById } from "@/lib/tournament-service";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const { user } = await requireAuthUser(req);
    if (user.role !== "admin") {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }
    const db = await getDb();
    const payout = await endTournamentAndPayout(db, id);
    return NextResponse.json(payout);
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error);
      return NextResponse.json(payload, { status });
    }
    const status = /tournament|payout|final/i.test(error?.message || "") ? 400 : 500;
    return NextResponse.json(
      { message: error?.message || "Failed to end tournament" },
      { status }
    );
  }
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Read-only view of payout if already done
  const { id } = await context.params;
  const db = await getDb();
  const t = await getTournamentById(db, id);
  if (!t) return NextResponse.json({ message: "Tournament not found" }, { status: 404 });
  if (!t.payout)
    return NextResponse.json({ message: "Payout not completed" }, { status: 404 });
  return NextResponse.json(t.payout);
}
