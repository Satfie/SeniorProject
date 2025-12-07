export type TournamentFormat = "single-elimination" | "double-elimination" | "round-robin" | "swiss-round" | "battle-royal" | "custom"

export type TournamentConfig = {
  game?: string
  participants?: number
  teams?: number
  rosterSize?: number
  formatType?: TournamentFormat
  groups?: number
  qualifiers?: number
  maxParticipants?: number
}

function isPositiveInt(n: any): n is number {
  return typeof n === "number" && Number.isInteger(n) && n > 0
}

function isPowerOfTwo(n: number) {
  return n > 0 && (n & (n - 1)) === 0
}

export const GAME_PRESETS: Record<string, Array<Required<Pick<TournamentConfig, "formatType" | "rosterSize" | "teams">> & Partial<TournamentConfig>>> = {
  "rocket-league": [
    { formatType: "single-elimination", rosterSize: 1, teams: 8 },
    { formatType: "single-elimination", rosterSize: 2, teams: 8 },
    { formatType: "single-elimination", rosterSize: 3, teams: 8 },
    { formatType: "double-elimination", rosterSize: 3, teams: 8 },
  ],
  "valorant": [{ formatType: "double-elimination", rosterSize: 5, teams: 8 }],
  "fifa": [{ formatType: "single-elimination", rosterSize: 1, teams: 16 }],
}

export function validateTournamentConfig(cfg: TournamentConfig): { valid: boolean; reason?: string } {
  const format = cfg.formatType || "single-elimination"
  const participants = cfg.participants ?? cfg.teams
  const roster = cfg.rosterSize ?? 1

  if (!isPositiveInt(roster) || roster > 10) {
    return { valid: false, reason: "Invalid roster size" }
  }
  if (!isPositiveInt(participants)) {
    return { valid: false, reason: "Participants must be a positive integer" }
  }
  if (cfg.maxParticipants && (!isPositiveInt(cfg.maxParticipants) || cfg.maxParticipants < participants)) {
    return { valid: false, reason: "maxParticipants must be >= participants" }
  }
  switch (format) {
    case "single-elimination":
      // Allow non-power-of-two; byes will be added.
      if (participants < 2) return { valid: false, reason: "Single-elimination requires at least 2 teams" }
      return { valid: true }
    case "double-elimination":
      // Require power of two and minimum 4.
      if (participants < 4) return { valid: false, reason: "Double-elimination requires at least 4 teams" }
      if (!isPowerOfTwo(participants)) return { valid: false, reason: "Double-elimination requires power-of-two teams" }
      return { valid: true }
    case "round-robin":
      if (participants < 2) return { valid: false, reason: "Round-robin requires at least 2 teams" }
      return { valid: true }
    case "swiss-round":
      if (participants < 4) return { valid: false, reason: "Swiss requires at least 4 teams" }
      return { valid: true }
    case "battle-royal":
      // Typically FFA; allow large participants.
      if (participants < 2) return { valid: false, reason: "Battle Royal requires at least 2 participants" }
      return { valid: true }
    case "custom":
      // Custom must be validated elsewhere; reject by default unless explicitly allowed.
      return { valid: false, reason: "Custom format not allowed without explicit rules" }
  }
}
