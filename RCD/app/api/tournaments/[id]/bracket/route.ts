import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import { getBracket } from "@/lib/tournament-service";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const db = await getDb();
  const bracket = await getBracket(db, id);
  if (!bracket) {
    return NextResponse.json({ message: "Bracket not generated" }, { status: 404 });
  }
  return NextResponse.json(bracket);
}
