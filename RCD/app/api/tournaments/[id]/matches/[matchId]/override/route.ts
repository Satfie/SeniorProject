import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  AuthServiceError,
  normalizeAuthServiceError,
  requireAuthUser,
} from "@/lib/auth-service";
import { getDb } from "@/lib/db";
import { overrideMatchWinner } from "@/lib/tournament-service";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; matchId: string }> }
) {
  const { id, matchId } = await context.params;
  try {
    const body = await req.json().catch(() => ({}));
    const { user } = await requireAuthUser(req);
    if (user.role !== "admin") {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }
    const winnerId = typeof body.winnerId === "string" ? body.winnerId : undefined;
    const score1 = typeof body.score1 === "number" ? body.score1 : undefined;
    const score2 = typeof body.score2 === "number" ? body.score2 : undefined;
    if (!winnerId) {
      return NextResponse.json(
        { message: "winnerId is required" },
        { status: 400 }
      );
    }
    const db = await getDb();
    const match = await overrideMatchWinner(db, id, matchId, winnerId, score1, score2);
    return NextResponse.json(match);
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error);
      return NextResponse.json(payload, { status });
    }
    const status = /match|winner|override/i.test(error?.message || "") ? 400 : 500;
    return NextResponse.json(
      { message: error?.message || "Failed to override match winner" },
      { status }
    );
  }
}
