import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import { listTournamentRegistrations, getTournamentById } from "@/lib/tournament-service";

// Public participants listing (approved registrations only)
// Returns lightweight list of { teamId, name }
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const db = await getDb();
    const tournament = await getTournamentById(db, id);
    if (!tournament) {
      return NextResponse.json({ message: "Tournament not found" }, { status: 404 });
    }
    const regs = await listTournamentRegistrations(db, id);
    const approved = regs.filter(r => r.status === "approved");
    if (!approved.length) return NextResponse.json([]);
    const teamIds = Array.from(new Set(approved.map(r => r.teamId)));
    const teamsCol = db.collection("teams");
    const teamDocs = await teamsCol.find({ _id: { $in: teamIds } }).toArray();
    const nameMap: Record<string,string> = {};
    for (const t of teamDocs) {
      nameMap[String(t._id)] = t.name || String(t._id);
    }
    const payload = approved.map(r => ({ teamId: r.teamId, name: nameMap[r.teamId] || r.teamId }));
    return NextResponse.json(payload);
  } catch (error: any) {
    console.error("[tournaments:participants] GET failed", error);
    return NextResponse.json({ message: error?.message || "Failed to load participants" }, { status: 500 });
  }
}
