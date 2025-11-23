import type { Db } from "mongodb"
import type { BracketDoc, TournamentDoc } from "@/lib/tournament-service"
import { endTournamentAndPayout } from "@/lib/tournament-service"

// Lightweight in-memory Db implementation tailored for unit tests
class MemoryCollection<T extends Record<string, any>> {
  constructor(private readonly store: Record<string, T[]>, private readonly name: string) {}

  private get docs(): T[] {
    if (!this.store[this.name]) this.store[this.name] = [] as T[]
    return this.store[this.name]
  }

  private matches(doc: T, filter: Record<string, any> = {}): boolean {
    return Object.entries(filter).every(([key, value]) => {
      if (value && typeof value === "object" && "$in" in value) {
        return (value.$in as any[]).some((candidate) => this.compare(doc[key as keyof T], candidate))
      }
      return this.compare(doc[key as keyof T], value)
    })
  }

  private compare(a: any, b: any): boolean {
    if (b && typeof b === "object") {
      if (typeof b.toHexString === "function") {
        return String(a) === b.toHexString()
      }
      if ("$ne" in b) {
        return a !== b.$ne
      }
    }
    return a === b
  }

  private normalizeValue(value: any) {
    if (value && typeof value === "object" && typeof value.toHexString === "function") {
      return value.toHexString()
    }
    return value
  }

  async findOne(filter: Record<string, any>): Promise<T | null> {
    const match = this.docs.find((doc) => this.matches(doc, filter))
    return match ? { ...match } : null
  }

  find(filter: Record<string, any> = {}) {
    const items = this.docs.filter((doc) => this.matches(doc, filter)).map((doc) => ({ ...doc }))
    return {
      sort: (_order: Record<string, 1 | -1>) => ({
        toArray: async () => items,
      }),
      toArray: async () => items,
    }
  }

  async updateOne(filter: Record<string, any>, update: Record<string, any>, options?: { upsert?: boolean }) {
    const target = this.docs.find((doc) => this.matches(doc, filter))
    if (!target) {
      if (options?.upsert) {
        const next = { ...(update.$set ? update.$set : {}), ...Object.fromEntries(Object.entries(filter).map(([k, v]) => [k, this.normalizeValue(v)])) } as T
        this.docs.push(next)
        return { matchedCount: 0, modifiedCount: 0, upsertedCount: 1 }
      }
      return { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 }
    }
    if (update.$set) {
      Object.assign(target, update.$set)
    }
    if (update.$inc) {
      for (const [key, value] of Object.entries(update.$inc)) {
        const current = Number(target[key as keyof T] || 0)
        target[key as keyof T] = (current + (value as number)) as any
      }
    }
    return { matchedCount: 1, modifiedCount: 1, upsertedCount: 0 }
  }

  async insertOne(doc: T) {
    this.docs.push(doc)
    return { insertedId: doc._id }
  }
}

function createMemoryDb(seed: Record<string, any[]>): { db: Db; data: Record<string, any[]> } {
  const store: Record<string, any[]> = {}
  for (const [name, docs] of Object.entries(seed)) {
    store[name] = docs.map((doc) => ({ ...doc }))
  }
  const collections = new Map<string, MemoryCollection<any>>()
  const db = {
    collection(name: string) {
      if (!collections.has(name)) {
        collections.set(name, new MemoryCollection(store, name))
      }
      return collections.get(name)!
    },
  } as unknown as Db
  return { db, data: store }
}

describe("tournament-service payouts", () => {
  test("single elimination payouts split third place evenly", async () => {
    const bracket: BracketDoc = {
      tournamentId: "t1",
      kind: "single",
      rounds: {
        winners: [
          {
            round: 1,
            matches: [
              {
                id: "m1",
                tournamentId: "t1",
                side: "winners",
                round: 1,
                index: 0,
                team1Id: "T1",
                team2Id: "T2",
                status: "completed",
                winnerId: "T1",
                score1: 5,
                score2: 3,
              },
              {
                id: "m2",
                tournamentId: "t1",
                side: "winners",
                round: 1,
                index: 1,
                team1Id: "T3",
                team2Id: "T4",
                status: "completed",
                winnerId: "T3",
                score1: 6,
                score2: 4,
              },
            ],
          },
          {
            round: 2,
            matches: [
              {
                id: "m-final",
                tournamentId: "t1",
                side: "winners",
                round: 2,
                index: 0,
                team1Id: "T1",
                team2Id: "T3",
                status: "completed",
                winnerId: "T1",
                score1: 7,
                score2: 2,
              },
            ],
          },
        ],
        losers: [],
        grand: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const tournament: TournamentDoc = {
      _id: "t1",
      title: "Championship",
      date: new Date().toISOString(),
      type: "single",
      status: "ongoing",
      prizePool: "$1000",
    }

    const { db, data } = createMemoryDb({
      tournaments: [tournament],
      tournamentBrackets: [bracket],
      teams: [
        { _id: "T1", balance: 0 },
        { _id: "T2", balance: 0 },
        { _id: "T3", balance: 0 },
        { _id: "T4", balance: 0 },
      ],
    })

    const payout = await endTournamentAndPayout(db, "t1")

    expect(payout.total).toBe(1000)
    expect(payout.awards).toEqual([
      { place: 1, teamId: "T1", amount: 600 },
      { place: 2, teamId: "T3", amount: 250 },
      { place: 3, teamId: "T2", amount: 75 },
      { place: 3, teamId: "T4", amount: 75 },
    ])

    const teams = data.teams
    expect(teams.find((t: any) => t._id === "T1")?.balance).toBe(600)
    expect(teams.find((t: any) => t._id === "T3")?.balance).toBe(250)
    expect(teams.find((t: any) => t._id === "T2")?.balance).toBe(75)
    expect(teams.find((t: any) => t._id === "T4")?.balance).toBe(75)
  })

  test("double elimination pays third-place loser", async () => {
    const bracket: BracketDoc = {
      tournamentId: "td",
      kind: "double",
      rounds: {
        winners: [
          {
            round: 1,
            matches: [
              {
                id: "wm1",
                tournamentId: "td",
                side: "winners",
                round: 1,
                index: 0,
                team1Id: "WX",
                team2Id: "WY",
                status: "completed",
                winnerId: "WX",
              },
            ],
          },
        ],
        losers: [
          {
            round: 1,
            matches: [
              {
                id: "lm-final",
                tournamentId: "td",
                side: "losers",
                round: 1,
                index: 0,
                team1Id: "L1",
                team2Id: "L2",
                status: "completed",
                winnerId: "L1",
              },
            ],
          },
        ],
        grand: [
          {
            round: 1,
            matches: [
              {
                id: "gm1",
                tournamentId: "td",
                side: "grand",
                round: 1,
                index: 0,
                team1Id: "WX",
                team2Id: "L1",
                status: "completed",
                winnerId: "WX",
              },
            ],
          },
        ],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const tournament: TournamentDoc = {
      _id: "td",
      title: "Double Trouble",
      date: new Date().toISOString(),
      type: "double",
      status: "ongoing",
      prizePool: 500,
    }

    const { db, data } = createMemoryDb({
      tournaments: [tournament],
      tournamentBrackets: [bracket],
      teams: [
        { _id: "WX", balance: 0 },
        { _id: "L1", balance: 0 },
        { _id: "L2", balance: 0 },
      ],
    })

    const payout = await endTournamentAndPayout(db, "td")

    expect(payout.total).toBe(500)
    expect(payout.awards).toEqual([
      { place: 1, teamId: "WX", amount: 300 },
      { place: 2, teamId: "L1", amount: 125 },
      { place: 3, teamId: "L2", amount: 75 },
    ])

    expect(data.teams.find((t: any) => t._id === "WX")?.balance).toBe(300)
    expect(data.teams.find((t: any) => t._id === "L1")?.balance).toBe(125)
    expect(data.teams.find((t: any) => t._id === "L2")?.balance).toBe(75)
  })
})
