import { Db, ObjectId } from "mongodb"
import type { Bracket, BracketKind, Match, Registration, Tournament } from "@/lib/api"
import { createNotifications } from "@/lib/notification-service"
import { validateTournamentConfig } from "@/lib/tournament-rules"
import { buildIdFilter, looksLikeObjectId, normalizeId, type TeamDoc } from "@/lib/team-service"

const TOURNAMENTS_COLLECTION = "tournaments"
const REGISTRATIONS_COLLECTION = "tournamentRegistrations"
const BRACKETS_COLLECTION = "tournamentBrackets"
const DEFAULT_ROSTER_SIZE = Number(process.env.TOURNAMENT_DEFAULT_ROSTER_SIZE || 5)

function sanitizeRosterSize(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    const whole = Math.floor(value)
    if (whole > 0) return Math.min(whole, 10)
    return undefined
  }
  if (typeof value === "string" && value.trim().length) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return sanitizeRosterSize(parsed)
    }
  }
  return undefined
}

type TournamentStatus = Tournament["status"]

export type TournamentDoc = {
  _id: ObjectId | string
  title: string
  description?: string
  date: string
  type: string
  status: TournamentStatus
  prizePool?: string
  maxParticipants?: number
  currentParticipants?: number
  game?: string
  rosterSize?: number
  payout?: {
    total: number
    awards: Array<{ place: number; teamId: string; amount: number }>
    timestamp: string
  }
  createdAt?: string
  updatedAt?: string
}

export type RegistrationDoc = {
  _id: ObjectId | string
  tournamentId: string
  teamId: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  playerIds?: string[]
}

export type BracketDoc = Bracket & {
  _id?: ObjectId | string
  createdAt: string
  updatedAt: string
}

type MatchUpdateOptions = {
  score1?: number
  score2?: number
  winnerId?: string
  actorId?: string
}

const bracketSubscribers = new Map<string, Set<(bracket: Bracket) => void>>()

function broadcastBracket(bracket: Bracket) {
  const subs = bracketSubscribers.get(bracket.tournamentId)
  if (!subs || !subs.size) return
  subs.forEach((handler) => {
    try {
      handler(bracket)
    } catch (err) {
      console.error("[tournament-service] bracket subscriber error", err)
    }
  })
}

export function subscribeBracketUpdates(
  tournamentId: string,
  handler: (bracket: Bracket) => void
) {
  if (!bracketSubscribers.has(tournamentId)) {
    bracketSubscribers.set(tournamentId, new Set())
  }
  const set = bracketSubscribers.get(tournamentId)!
  set.add(handler)
  return () => {
    const current = bracketSubscribers.get(tournamentId)
    if (!current) return
    current.delete(handler)
    if (!current.size) {
      bracketSubscribers.delete(tournamentId)
    }
  }
}

function nowIso() {
  return new Date().toISOString()
}

function coerceStatus(value: string | undefined): TournamentStatus {
  switch ((value || "").toLowerCase()) {
    case "ongoing":
      return "ongoing"
    case "completed":
      return "completed"
    default:
      return "upcoming"
  }
}

export function serializeTournament(doc: TournamentDoc): Tournament {
  return {
    id: normalizeId(doc._id),
    title: doc.title,
    description: doc.description,
    date: doc.date,
    type: doc.type,
    status: coerceStatus(doc.status),
    prizePool: doc.prizePool,
    maxParticipants: typeof doc.maxParticipants === "number" ? doc.maxParticipants : undefined,
    currentParticipants: typeof doc.currentParticipants === "number" ? doc.currentParticipants : 0,
    game: doc.game,
    rosterSize: typeof doc.rosterSize === "number" ? doc.rosterSize : undefined,
    payout: doc.payout,
  }
}

export function serializeRegistration(doc: RegistrationDoc): Registration {
  return {
    id: normalizeId(doc._id),
    tournamentId: doc.tournamentId,
    teamId: doc.teamId,
    status: doc.status,
    createdAt: doc.createdAt,
    playerIds: Array.isArray(doc.playerIds) ? doc.playerIds.map(String) : undefined,
  }
}

function serializeBracketDoc(doc: BracketDoc): Bracket {
  return {
    tournamentId: doc.tournamentId,
    kind: doc.kind,
    rounds: doc.rounds,
  }
}

export async function listTournaments(db: Db): Promise<Tournament[]> {
  const docs = await db
    .collection<TournamentDoc>(TOURNAMENTS_COLLECTION)
    .find({})
    .sort({ date: 1 })
    .toArray()
  return docs.map(serializeTournament)
}

export async function getTournamentById(db: Db, id: string) {
  return db.collection<TournamentDoc>(TOURNAMENTS_COLLECTION).findOne(buildIdFilter(id))
}

export async function createTournament(
  db: Db,
  data: Partial<TournamentDoc>
): Promise<Tournament> {
  const now = nowIso()
  const rosterSize = sanitizeRosterSize(data.rosterSize) ?? DEFAULT_ROSTER_SIZE
  const participants = typeof data.maxParticipants === "number" ? data.maxParticipants : (typeof data.currentParticipants === "number" ? data.currentParticipants : undefined)
  const formatType = (data.type || "single-elimination").toLowerCase()
  const { valid, reason } = validateTournamentConfig({
    game: data.game,
    participants,
    teams: participants,
    rosterSize,
    formatType: formatType as any,
    maxParticipants: typeof data.maxParticipants === "number" ? data.maxParticipants : undefined,
  })
  if (!valid) {
    throw new Error(`Invalid tournament configuration: ${reason}`)
  }
  const doc: TournamentDoc = {
    _id: new ObjectId(),
    title: data.title?.trim() || "Untitled Tournament",
    description: data.description,
    date: data.date || now,
    type: data.type || "single-elimination",
    status: coerceStatus(data.status || "upcoming"),
    prizePool: data.prizePool,
    maxParticipants:
      typeof data.maxParticipants === "number" ? data.maxParticipants : undefined,
    currentParticipants:
      typeof data.currentParticipants === "number" ? data.currentParticipants : 0,
    game: data.game,
    rosterSize,
    payout: data.payout,
    createdAt: now,
    updatedAt: now,
  }
  await db.collection<TournamentDoc>(TOURNAMENTS_COLLECTION).insertOne(doc as any)
  return serializeTournament(doc)
}

export async function updateTournament(
  db: Db,
  id: string,
  updates: Partial<TournamentDoc>
): Promise<Tournament | null> {
  const allowed: Partial<TournamentDoc> = {}
  if (typeof updates.title === "string") allowed.title = updates.title
  if (typeof updates.description === "string" || updates.description === null)
    allowed.description = updates.description || undefined
  if (typeof updates.date === "string") allowed.date = updates.date
  if (typeof updates.type === "string") allowed.type = updates.type
  if (typeof updates.status === "string") allowed.status = coerceStatus(updates.status)
  if (typeof updates.prizePool === "string" || updates.prizePool === null)
    allowed.prizePool = updates.prizePool || undefined
  if (typeof updates.maxParticipants === "number")
    allowed.maxParticipants = updates.maxParticipants
  if (typeof updates.currentParticipants === "number")
    allowed.currentParticipants = updates.currentParticipants
  if (typeof updates.game === "string" || updates.game === null) allowed.game = updates.game || undefined
  if (Object.prototype.hasOwnProperty.call(updates, "rosterSize")) {
    const next = sanitizeRosterSize((updates as any).rosterSize)
    allowed.rosterSize = next
  }
  if (updates.payout) allowed.payout = updates.payout
  if (!Object.keys(allowed).length) {
    const existing = await getTournamentById(db, id)
    return existing ? serializeTournament(existing) : null
  }
  allowed.updatedAt = nowIso()
  await db.collection<TournamentDoc>(TOURNAMENTS_COLLECTION).updateOne(buildIdFilter(id), { $set: allowed })
  const doc = await getTournamentById(db, id)
  return doc ? serializeTournament(doc) : null
}

export async function deleteTournament(db: Db, id: string) {
  const res = await db
    .collection<TournamentDoc>(TOURNAMENTS_COLLECTION)
    .deleteOne(buildIdFilter(id))
  return !!res.deletedCount
}

export async function listTournamentRegistrations(db: Db, tournamentId: string) {
  const docs = await db
    .collection<RegistrationDoc>(REGISTRATIONS_COLLECTION)
    .find({ tournamentId })
    .sort({ createdAt: -1 })
    .toArray()
  return docs.map(serializeRegistration)
}

export async function createTournamentRegistration(
  db: Db,
  tournamentId: string,
  teamId: string,
  options?: { playerIds?: string[] }
): Promise<Registration> {
  const tournament = await getTournamentById(db, tournamentId)
  if (!tournament) {
    throw new Error("Tournament not found")
  }
  if (tournament.status !== "upcoming") {
    throw new Error("Registration closed")
  }
  if (
    tournament.maxParticipants &&
    (tournament.currentParticipants || 0) >= tournament.maxParticipants
  ) {
    throw new Error("Tournament is full")
  }
  const existing = await db.collection<RegistrationDoc>(REGISTRATIONS_COLLECTION).findOne({
    tournamentId,
    teamId,
    status: { $ne: "rejected" },
  })
  if (existing) {
    throw new Error("Team already registered")
  }
  const normalizedPlayerIds = Array.isArray(options?.playerIds)
    ? Array.from(new Set(options.playerIds.map((id) => String(id).trim()).filter(Boolean)))
    : undefined

  const doc: RegistrationDoc = {
    _id: new ObjectId(),
    tournamentId,
    teamId,
    status: "approved",
    createdAt: nowIso(),
    playerIds: normalizedPlayerIds && normalizedPlayerIds.length ? normalizedPlayerIds : undefined,
  }
  await db.collection<RegistrationDoc>(REGISTRATIONS_COLLECTION).insertOne(doc as any)
  await db
    .collection<TournamentDoc>(TOURNAMENTS_COLLECTION)
    .updateOne(buildIdFilter(tournamentId), { $inc: { currentParticipants: 1 } })
  return serializeRegistration(doc)
}

async function fetchBracketDoc(db: Db, tournamentId: string): Promise<BracketDoc | null> {
  return db.collection<BracketDoc>(BRACKETS_COLLECTION).findOne({ tournamentId })
}

async function saveBracketDoc(db: Db, bracket: BracketDoc) {
  const col = db.collection<BracketDoc>(BRACKETS_COLLECTION)
  const payload: BracketDoc = {
    ...bracket,
    updatedAt: nowIso(),
  }
  await col.updateOne(
    { tournamentId: bracket.tournamentId },
    { $set: payload },
    { upsert: true }
  )
  broadcastBracket(serializeBracketDoc(payload))
}

export async function getBracket(db: Db, tournamentId: string): Promise<Bracket | null> {
  const doc = await fetchBracketDoc(db, tournamentId)
  return doc ? serializeBracketDoc(doc) : null
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function nextPowerOfTwo(n: number) {
  let p = 1
  while (p < n) p <<= 1
  return p
}

function buildSingleElimRounds(tournamentId: string, teamIds: string[]) {
  const shuffled = shuffle(teamIds)
  const size = nextPowerOfTwo(shuffled.length)
  const byes = size - shuffled.length
  const seeds: Array<string | null> = [...shuffled, ...Array(byes).fill(null)]
  const rounds: Array<{ round: number; matches: Match[] }> = []
  let roundIndex = 1
  let current = seeds
  let matchIdCounter = 1
  while (current.length > 1) {
    const matches: Match[] = []
    for (let i = 0; i < current.length; i += 2) {
      const team1Id = current[i]
      const team2Id = current[i + 1]
      const match: Match = {
        id: `m${tournamentId}-${matchIdCounter++}`,
        tournamentId,
        side: "winners",
        round: roundIndex,
        index: i / 2,
        team1Id: team1Id ?? null,
        team2Id: team2Id ?? null,
        status: "pending",
      }
      if (team1Id && !team2Id) {
        match.winnerId = team1Id
        match.status = "completed"
      } else if (!team1Id && team2Id) {
        match.winnerId = team2Id
        match.status = "completed"
      }
      matches.push(match)
    }
    rounds.push({ round: roundIndex, matches })
    const nextSeeds: Array<string | null> = []
    for (const match of matches) {
      nextSeeds.push(match.winnerId || null)
    }
    current = nextSeeds
    roundIndex++
  }
  return rounds
}

function createSingleElimBracket(tournamentId: string, teamIds: string[]): BracketDoc {
  const rounds = buildSingleElimRounds(tournamentId, teamIds)
  return {
    tournamentId,
    kind: "single",
    rounds: {
      winners: rounds,
      losers: [],
      grand: [],
    },
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
}

function createDoubleElimBracket(tournamentId: string, teamIds: string[]): BracketDoc {
  const single = createSingleElimBracket(tournamentId, teamIds)
  const roundsCount = single.rounds.winners.length
  const losers: Array<{ round: number; matches: Match[] }> = []
  let matchIdCounter = 1000
  for (let r = 1; r <= roundsCount; r++) {
    const matchesInRound = Math.max(1, Math.floor(Math.pow(2, Math.max(0, roundsCount - r - 1))))
    const matches: Match[] = Array.from({ length: matchesInRound }, (_, idx) => ({
      id: `lm${tournamentId}-${matchIdCounter++}`,
      tournamentId,
      side: "losers",
      round: r,
      index: idx,
      team1Id: null,
      team2Id: null,
      status: "pending",
    }))
    losers.push({ round: r, matches })
  }
  const grand: Array<{ round: number; matches: Match[] }> = [
    {
      round: 1,
      matches: [
        {
          id: `gm${tournamentId}-1`,
          tournamentId,
          side: "grand",
          round: 1,
          index: 0,
          team1Id: null,
          team2Id: null,
          status: "pending",
        },
      ],
    },
  ]
  return {
    tournamentId,
    kind: "double",
    rounds: {
      winners: single.rounds.winners,
      losers,
      grand,
    },
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
}

async function ensureTournamentStatus(db: Db, tournamentId: string, status: TournamentStatus) {
  await db
    .collection<TournamentDoc>(TOURNAMENTS_COLLECTION)
    .updateOne(buildIdFilter(tournamentId), { $set: { status, updatedAt: nowIso() } })
}

export async function startTournamentBracket(
  db: Db,
  tournamentId: string,
  format: BracketKind,
  teamIds: string[]
): Promise<Bracket> {
  console.info("[tournament-service] startTournamentBracket invoked", { tournamentId, format, teamCount: teamIds.length })
  const existing = await fetchBracketDoc(db, tournamentId)
  if (existing) {
    console.info("[tournament-service] bracket exists, returning existing", { tournamentId })
    return serializeBracketDoc(existing)
  }
  if (teamIds.length < 2) {
    console.warn("[tournament-service] generation failed: not enough teams", { tournamentId, teamCount: teamIds.length })
    throw new Error("Not enough teams to start")
  }
  if (format === "double") {
    const n = teamIds.length
    const isPowerTwo = n > 0 && (n & (n - 1)) === 0
    if (n < 4 || !isPowerTwo) {
      console.warn("[tournament-service] generation failed: double elim requires power-of-two ≥ 4", { tournamentId, teamCount: n })
      throw new Error("Double elimination requires power-of-two teams and at least 4")
    }
  }
  const bracket =
    format === "double"
      ? createDoubleElimBracket(tournamentId, teamIds)
      : createSingleElimBracket(tournamentId, teamIds)
  await saveBracketDoc(db, bracket)
  await ensureTournamentStatus(db, tournamentId, "ongoing")
  return serializeBracketDoc(bracket)
}

function findMatch(bracket: BracketDoc, matchId: string): Match | null {
  const sides: Array<keyof BracketDoc["rounds"]> = ["winners", "losers", "grand"]
  for (const side of sides) {
    for (const round of bracket.rounds[side] || []) {
      const match = round.matches.find((m) => m.id === matchId)
      if (match) return match
    }
  }
  return null
}

function propagateWinnerToNext(bracket: BracketDoc, match: Match) {
  if (match.side !== "winners" || !match.winnerId) return
  const winnersRounds = bracket.rounds.winners
  const currentRound = winnersRounds.find((r) => r.round === match.round)
  if (!currentRound) return
  const isLastRound = match.round === winnersRounds[winnersRounds.length - 1]?.round
  if (isLastRound) {
    if (bracket.kind === "double") {
      const grand = bracket.rounds.grand?.[0]?.matches?.[0]
      if (grand && !grand.team1Id) grand.team1Id = match.winnerId
    }
    return
  }
  const nextRound = winnersRounds.find((r) => r.round === match.round + 1)
  if (!nextRound) return
  const targetIndex = Math.floor(match.index / 2)
  const targetMatch = nextRound.matches[targetIndex]
  if (!targetMatch) return
  if (match.index % 2 === 0) {
    if (!targetMatch.team1Id) targetMatch.team1Id = match.winnerId
  } else {
    if (!targetMatch.team2Id) targetMatch.team2Id = match.winnerId
  }
}

function propagateLoser(bracket: BracketDoc, match: Match) {
  if (bracket.kind !== "double" || match.side !== "winners" || !match.winnerId) return
  if (!match.team1Id || !match.team2Id) return
  const loserId = match.winnerId === match.team1Id ? match.team2Id : match.team1Id
  if (!loserId) return
  for (const round of bracket.rounds.losers) {
    for (const m of round.matches) {
      if (!m.team1Id) {
        m.team1Id = loserId
        return
      }
      if (!m.team2Id) {
        m.team2Id = loserId
        return
      }
    }
  }
}

async function persistBracketUpdate(db: Db, bracket: BracketDoc) {
  await saveBracketDoc(db, bracket)
}

export async function reportMatchResult(
  db: Db,
  tournamentId: string,
  matchId: string,
  options: MatchUpdateOptions
): Promise<Match> {
  const bracket = await fetchBracketDoc(db, tournamentId)
  if (!bracket) throw new Error("Bracket not found")
  const match = findMatch(bracket, matchId)
  if (!match) throw new Error("Match not found")
  if (match.status === "completed") throw new Error("Match already completed")
  if (!match.team1Id && !match.team2Id) throw new Error("Match has no participants")

  const { score1, score2, winnerId, actorId } = options
  if (typeof winnerId === "string") {
    match.winnerId = winnerId
  } else if (typeof score1 === "number" && typeof score2 === "number") {
    match.score1 = score1
    match.score2 = score2
    if (match.team1Id && match.team2Id) {
      match.winnerId = score1 === score2 ? match.team1Id : score1 > score2 ? match.team1Id : match.team2Id
    } else {
      match.winnerId = match.team1Id || match.team2Id || undefined
    }
  } else {
    throw new Error("Provide scores or a winner override")
  }
  match.status = "completed"
  match.completedAt = nowIso()
  propagateWinnerToNext(bracket, match)
  propagateLoser(bracket, match)

  if (bracket.kind === "double" && match.side === "losers") {
    const losersRounds = bracket.rounds.losers
    const lastRound = losersRounds[losersRounds.length - 1]
    if (lastRound && lastRound.round === match.round) {
      const grand = bracket.rounds.grand?.[0]?.matches?.[0]
      if (grand && !grand.team2Id && match.winnerId) grand.team2Id = match.winnerId
    }
  }

  if (match.side === "grand" && match.status === "completed") {
    await ensureTournamentStatus(db, tournamentId, "completed")
  }

  await persistBracketUpdate(db, bracket)
  console.info("[tournament-service] match reported", match.id, actorId || "system")
  return match
}

export async function resetMatchResult(
  db: Db,
  tournamentId: string,
  matchId: string
): Promise<Match> {
  const bracket = await fetchBracketDoc(db, tournamentId)
  if (!bracket) throw new Error("Bracket not found")
  const match = findMatch(bracket, matchId)
  if (!match) throw new Error("Match not found")
  if (match.status === "completed" && match.winnerId) {
    const winnerId = match.winnerId
    const sides: Array<keyof BracketDoc["rounds"]> = ["winners", "losers", "grand"]
    for (const side of sides) {
      for (const round of bracket.rounds[side] || []) {
        for (const child of round.matches) {
          if (child !== match && (child.team1Id === winnerId || child.team2Id === winnerId)) {
            throw new Error("Cannot reset: winner already propagated")
          }
        }
      }
    }
  }
  match.score1 = undefined
  match.score2 = undefined
  match.winnerId = undefined
  match.status = "pending"
  match.completedAt = undefined
  await persistBracketUpdate(db, bracket)
  return match
}

export async function editCompletedMatch(
  db: Db,
  tournamentId: string,
  matchId: string,
  score1: number,
  score2: number
): Promise<Match> {
  const bracket = await fetchBracketDoc(db, tournamentId)
  if (!bracket) throw new Error("Bracket not found")
  const match = findMatch(bracket, matchId)
  if (!match) throw new Error("Match not found")
  if (match.status !== "completed") throw new Error("Match is not completed yet")
  if (!match.team1Id && !match.team2Id) throw new Error("Match has no participants")

  let newWinner = match.winnerId
  if (match.team1Id && match.team2Id) {
    if (score1 !== score2) {
      newWinner = score1 > score2 ? match.team1Id : match.team2Id
    }
  }
  if (newWinner !== match.winnerId) {
    throw new Error("Cannot edit scores to change winner after completion")
  }
  match.score1 = score1
  match.score2 = score2
  await persistBracketUpdate(db, bracket)
  return match
}

export async function overrideMatchWinner(
  db: Db,
  tournamentId: string,
  matchId: string,
  newWinnerId: string,
  score1?: number,
  score2?: number
): Promise<Match> {
  const bracket = await fetchBracketDoc(db, tournamentId)
  if (!bracket) throw new Error("Bracket not found")
  const match = findMatch(bracket, matchId)
  if (!match) throw new Error("Match not found")
  if (match.status !== "completed") throw new Error("Match is not completed yet")
  if (!match.team1Id && !match.team2Id) throw new Error("Match has no participants")
  if (bracket.kind !== "single" || match.side !== "winners") {
    throw new Error("Override allowed only for single-elimination winners bracket")
  }
  if (newWinnerId !== match.team1Id && newWinnerId !== match.team2Id) {
    throw new Error("New winner must be one of the match participants")
  }
  if (match.winnerId === newWinnerId) {
    if (typeof score1 === "number") match.score1 = score1
    if (typeof score2 === "number") match.score2 = score2
    await persistBracketUpdate(db, bracket)
    return match
  }
  const winnersRounds = bracket.rounds.winners
  const currentRound = winnersRounds.find((r) => r.round === match.round)
  if (!currentRound) throw new Error("Round not found")
  const isLastRound = match.round === winnersRounds[winnersRounds.length - 1]?.round
  if (!isLastRound) {
    const nextRound = winnersRounds.find((r) => r.round === match.round + 1)
    if (!nextRound) throw new Error("Next round not found")
    const targetIndex = Math.floor(match.index / 2)
    const targetMatch = nextRound.matches[targetIndex]
    if (!targetMatch) throw new Error("Target match not found")
    if (targetMatch.status === "completed" || targetMatch.winnerId) {
      throw new Error("Cannot override: next match already decided")
    }
    if (match.index % 2 === 0) {
      if (targetMatch.team1Id !== match.winnerId) {
        throw new Error("Cannot override: winner slot mismatch")
      }
      targetMatch.team1Id = newWinnerId
    } else {
      if (targetMatch.team2Id !== match.winnerId) {
        throw new Error("Cannot override: winner slot mismatch")
      }
      targetMatch.team2Id = newWinnerId
    }
  }
  if (typeof score1 === "number") match.score1 = score1
  if (typeof score2 === "number") match.score2 = score2
  match.winnerId = newWinnerId
  await persistBracketUpdate(db, bracket)
  return match
}

function parsePrizePool(value?: string | number): number {
  if (typeof value === "number") return value
  if (!value) return 0
  const cleaned = String(value).replace(/[^0-9.]/g, "")
  const num = parseFloat(cleaned)
  return Number.isFinite(num) ? num : 0
}

function computePlacementsSingle(bracket: BracketDoc) {
  const winners = bracket.rounds.winners
  if (!winners.length) return { first: undefined, second: undefined, thirds: [] as string[] }
  const finalRound = winners[winners.length - 1]
  const finalMatch = finalRound.matches[finalRound.matches.length - 1]
  const first = finalMatch?.winnerId
  const second = first
    ? finalMatch.team1Id === first
      ? finalMatch.team2Id || undefined
      : finalMatch.team1Id || undefined
    : undefined
  const thirds: string[] = []
  if (winners.length >= 2) {
    const semi = winners[winners.length - 2]
    for (const m of semi.matches) {
      if (m.team1Id && m.team2Id && m.winnerId) {
        const loser = m.winnerId === m.team1Id ? m.team2Id : m.team1Id
        if (loser) thirds.push(loser)
      }
    }
  }
  return { first, second, thirds }
}

function computePlacementsDouble(bracket: BracketDoc) {
  const grand = bracket.rounds.grand?.[0]?.matches?.[0]
  const first = grand?.winnerId
  const second = first
    ? grand?.team1Id === first
      ? grand?.team2Id || undefined
      : grand?.team1Id || undefined
    : undefined
  let third: string | undefined
  const losers = bracket.rounds.losers || []
  if (losers.length) {
    const lastRound = losers[losers.length - 1]
    const match = lastRound.matches[lastRound.matches.length - 1]
    if (match && match.team1Id && match.team2Id && match.winnerId) {
      third = match.winnerId === match.team1Id ? match.team2Id : match.team1Id
    }
  }
  return { first, second, third }
}

export async function endTournamentAndPayout(db: Db, tournamentId: string) {
  const tournament = await getTournamentById(db, tournamentId)
  if (!tournament) throw new Error("Tournament not found")
  if (tournament.payout) return tournament.payout
  const bracket = await fetchBracketDoc(db, tournamentId)
  if (!bracket) throw new Error("Bracket not generated")
  const total = parsePrizePool(tournament.prizePool)
  const awards: Array<{ place: number; teamId: string; amount: number }> = []
  if (bracket.kind === "double") {
    const { first, second, third } = computePlacementsDouble(bracket)
    if (!first || !second) throw new Error("Final not completed yet")
    awards.push({ place: 1, teamId: first, amount: +(total * 0.6).toFixed(2) })
    awards.push({ place: 2, teamId: second, amount: +(total * 0.25).toFixed(2) })
    if (third) awards.push({ place: 3, teamId: third, amount: +(total * 0.15).toFixed(2) })
  } else {
    const { first, second, thirds } = computePlacementsSingle(bracket)
    if (!first || !second) throw new Error("Final not completed yet")
    awards.push({ place: 1, teamId: first, amount: +(total * 0.6).toFixed(2) })
    awards.push({ place: 2, teamId: second, amount: +(total * 0.25).toFixed(2) })
    if (thirds.length) {
      const perTeam = thirds.length ? +((total * 0.15) / thirds.length).toFixed(2) : 0
      thirds.forEach((teamId) => awards.push({ place: 3, teamId, amount: perTeam }))
    }
  }

  const teamsCol = db.collection<TeamDoc>("teams")
  for (const award of awards) {
    if (award.amount > 0) {
      const filter = buildIdFilter(award.teamId)
      const teamDoc = await teamsCol.findOne(filter)
      await teamsCol.updateOne(filter, { $inc: { balance: award.amount } })
      const memberIds = teamDoc && Array.isArray(teamDoc.members)
        ? Array.from(new Set(teamDoc.members.map((member) => String(member))))
        : []
      if (memberIds.length) {
        await createNotifications(
          db,
          memberIds.map((memberId) => ({
            userId: memberId,
            type: "success",
            message: `Your team earned $${award.amount.toFixed(2)} for place ${award.place} in ${tournament.title}`,
            teamId: award.teamId,
            metadata: { teamId: award.teamId, place: award.place, tournamentId },
          }))
        )
      }
    }
  }

  const payout = {
    total: +total.toFixed(2),
    awards,
    timestamp: nowIso(),
  }
  await db
    .collection<TournamentDoc>(TOURNAMENTS_COLLECTION)
    .updateOne(buildIdFilter(tournamentId), {
      $set: { payout, status: "completed", updatedAt: nowIso() },
    })
  return payout
}
