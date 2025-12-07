import { NextResponse } from "next/server"
import { GAME_PRESETS } from "@/lib/tournament-rules"

export async function GET() {
  return NextResponse.json(GAME_PRESETS)
}
