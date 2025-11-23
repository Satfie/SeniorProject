import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  AuthServiceError,
  normalizeAuthServiceError,
  requireAuthUser,
} from "@/lib/auth-service";
import { getDb } from "@/lib/db";
import { resetMatchResult } from "@/lib/tournament-service";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; matchId: string }> }
) {
  const { id, matchId } = await context.params;
  try {
    const { user } = await requireAuthUser(req);
    if (user.role !== "admin") {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }
    await req.json().catch(() => ({}));
    const db = await getDb();
    const match = await resetMatchResult(db, id, matchId);
    return NextResponse.json(match);
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error);
      return NextResponse.json(payload, { status });
    }
    const status = /reset|match/i.test(error?.message || "") ? 400 : 500;
    return NextResponse.json(
      { message: error?.message || "Failed to reset match" },
      { status }
    );
  }
}
