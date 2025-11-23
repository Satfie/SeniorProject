import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import {
  AuthServiceError,
  normalizeAuthServiceError,
  requireAuthUser,
} from "@/lib/auth-service";
import {
  deleteTournament,
  getTournamentById,
  serializeTournament,
  updateTournament,
} from "@/lib/tournament-service";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const db = await getDb();
  const doc = await getTournamentById(db, id);
  if (!doc) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(serializeTournament(doc));
}

async function requireAdmin(req: NextRequest) {
  const auth = await requireAuthUser(req);
  if (auth.user.role !== "admin") {
    throw new AuthServiceError("forbidden", 403);
  }
  return auth;
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  try {
    await requireAdmin(req);
    const db = await getDb();
    const updated = await updateTournament(db, id, body);
    if (!updated) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error);
      return NextResponse.json(payload, { status });
    }
    console.error("[tournaments:id] PUT failed", error);
    return NextResponse.json(
      { message: error?.message || "Failed to update tournament" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  try {
    await requireAdmin(req);
    const db = await getDb();
    const updated = await updateTournament(db, id, body);
    if (!updated) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error);
      return NextResponse.json(payload, { status });
    }
    console.error("[tournaments:id] PATCH failed", error);
    return NextResponse.json(
      { message: error?.message || "Failed to update tournament" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await requireAdmin(req);
    const db = await getDb();
    const removed = await deleteTournament(db, id);
    if (!removed) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error);
      return NextResponse.json(payload, { status });
    }
    console.error("[tournaments:id] DELETE failed", error);
    return NextResponse.json(
      { message: error?.message || "Failed to delete tournament" },
      { status: 500 }
    );
  }
}
