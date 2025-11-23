import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import {
  AuthServiceError,
  normalizeAuthServiceError,
  requireAuthUser,
} from "@/lib/auth-service";
import { createTournament, listTournaments } from "@/lib/tournament-service";

export async function GET() {
  const db = await getDb();
  const tournaments = await listTournaments(db);
  return NextResponse.json(tournaments);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body?.title || !body?.date) {
    return NextResponse.json(
      { message: "title and date are required" },
      { status: 400 }
    );
  }
  try {
    const { user } = await requireAuthUser(req);
    if (user.role !== "admin") {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }
    const db = await getDb();
    const tournament = await createTournament(db, body);
    return NextResponse.json(tournament, { status: 201 });
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error);
      return NextResponse.json(payload, { status });
    }
    console.error("[tournaments] POST failed", error);
    return NextResponse.json(
      { message: error?.message || "Failed to create tournament" },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  return NextResponse.json(
    { message: "Unsupported operation" },
    { status: 400 }
  );
}
