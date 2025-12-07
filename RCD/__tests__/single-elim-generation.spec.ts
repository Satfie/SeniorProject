import type { BracketDoc } from "@/lib/tournament-service"
import { ObjectId } from "mongodb"
import { startTournamentBracket } from "@/lib/tournament-service"

// Minimal memory DB
class MemoryDb {
  store: Record<string, any[]> = {}
  collection(name: string) {
    if (!this.store[name]) this.store[name] = []
    const arr = this.store[name]
    return {
      findOne: async (q: any) => arr.find((d) => d.tournamentId === q.tournamentId) || null,
      updateOne: async (_f: any, u: any, o?: any) => {
        const idx = arr.findIndex((d) => d.tournamentId === _f.tournamentId)
        if (idx === -1) {
          if (o?.upsert) arr.push({ ...u.$set })
        } else {
          arr[idx] = { ...arr[idx], ...(u.$set || {}) }
        }
        return {}
      },
    }
  }
}

function makeTeams(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `T${i + 1}`)
}

describe("single-elimination generation", () => {
  const db = new MemoryDb() as any
  const tid = new ObjectId().toHexString()

  test.each([2, 3, 4, 5, 8, 12])("generates bracket with byes for n=%i", async (n) => {
    const bracket = await startTournamentBracket(db, tid, "single", makeTeams(n))
    expect(bracket.kind).toBe("single")
    const firstRound = bracket.rounds.winners[0]
    expect(firstRound.matches.length).toBeGreaterThan(0)
  })

  test("idempotence: returns existing bracket on second call", async () => {
    const t2 = new ObjectId().toHexString()
    const b1 = await startTournamentBracket(db, t2, "single", makeTeams(4))
    const b2 = await startTournamentBracket(db, t2, "single", makeTeams(4))
    expect(JSON.stringify(b1)).toBe(JSON.stringify(b2))
  })
})
