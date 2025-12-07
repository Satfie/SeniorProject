import { validateTournamentConfig } from "@/lib/tournament-rules"

describe("validateTournamentConfig", () => {
  test("single elim allows non-power-of-two with byes", () => {
    expect(validateTournamentConfig({ formatType: "single-elimination", participants: 3, rosterSize: 1 }).valid).toBe(true)
    expect(validateTournamentConfig({ formatType: "single-elimination", participants: 2, rosterSize: 1 }).valid).toBe(true)
    expect(validateTournamentConfig({ formatType: "single-elimination", participants: 1, rosterSize: 1 }).valid).toBe(false)
  })

  test("double elim requires power-of-two and minimum 4", () => {
    expect(validateTournamentConfig({ formatType: "double-elimination", participants: 4, rosterSize: 5 }).valid).toBe(true)
    expect(validateTournamentConfig({ formatType: "double-elimination", participants: 8, rosterSize: 5 }).valid).toBe(true)
    expect(validateTournamentConfig({ formatType: "double-elimination", participants: 6, rosterSize: 5 }).valid).toBe(false)
    expect(validateTournamentConfig({ formatType: "double-elimination", participants: 2, rosterSize: 5 }).valid).toBe(false)
  })

  test("roster size constraints", () => {
    expect(validateTournamentConfig({ formatType: "single-elimination", participants: 8, rosterSize: 0 }).valid).toBe(false)
    expect(validateTournamentConfig({ formatType: "single-elimination", participants: 8, rosterSize: 11 }).valid).toBe(false)
    expect(validateTournamentConfig({ formatType: "single-elimination", participants: 8, rosterSize: 5 }).valid).toBe(true)
  })
})
