import { Db, ObjectId } from "mongodb"
import type { User } from "@/lib/api"

export type TeamDoc = {
  _id: ObjectId | string
  name: string
  tag?: string
  managerId: string
  members: string[]
  captainIds?: string[]
  createdAt?: string
  gamesPlayed?: number
  wins?: number
  balance?: number
}

export type JoinRequestDoc = {
  _id: ObjectId | string
  teamId: string
  userId: string
  status: "pending" | "approved" | "declined"
  createdAt: string
  message?: string
}

export type UserDoc = {
  _id: ObjectId | string
  email: string
  username?: string
  role?: User["role"]
  teamId?: string
  avatarUrl?: string
  createdAt?: string
  country?: string
  region?: string
  timezone?: string
  social?: Record<string, any>
  gameIds?: Record<string, any>
}

export type TeamResponse = {
  id: string
  _id: string
  name: string
  tag?: string
  managerId: string
  members: User[]
  captainIds: string[]
  createdAt?: string
  gamesPlayed?: number
  wins?: number
  balance?: number
}

const objectIdPattern = /^[0-9a-fA-F]{24}$/

export function looksLikeObjectId(value: string | undefined | null): value is string {
  return !!value && objectIdPattern.test(value)
}

export function normalizeId(value: unknown): string {
  if (!value) return ""
  if (typeof value === "string") return value
  if (value instanceof ObjectId) return value.toHexString()
  if (typeof (value as any)?.toHexString === "function") {
    try {
      return (value as any).toHexString()
    } catch {
      return String(value)
    }
  }
  return String(value)
}

export function buildIdFilter(id: string): Record<string, unknown> {
  if (!looksLikeObjectId(id)) {
    return { _id: id }
  }
  try {
    const objectId = new ObjectId(id)
    // Match both ObjectId and string forms to handle mixed seeds/legacy data.
    return { $or: [{ _id: objectId }, { _id: id }] }
  } catch {
    return { _id: id }
  }
}

function placeholderUser(id: string): User {
  return {
    id,
    email: `user-${id}@unknown`,
    role: "player",
  }
}

export function mapUserDoc(doc: UserDoc): User {
  return {
    id: normalizeId(doc._id),
    email: doc.email,
    username: doc.username,
    role: doc.role || "player",
    teamId: doc.teamId ? String(doc.teamId) : undefined,
    avatarUrl: doc.avatarUrl,
    createdAt: doc.createdAt,
    country: doc.country,
    region: doc.region,
    timezone: doc.timezone,
    social: doc.social,
    gameIds: doc.gameIds,
  }
}

export async function fetchUsersByIds(db: Db, ids: string[]): Promise<Map<string, User>> {
  const unique = Array.from(new Set(ids.filter(Boolean).map(String)))
  if (!unique.length) return new Map()
  const stringIds = unique.filter((id) => !looksLikeObjectId(id))
  const objectIds = unique.filter((id) => looksLikeObjectId(id)).map((id) => new ObjectId(id))
  const clauses: Record<string, any>[] = []
  if (stringIds.length) clauses.push({ _id: { $in: stringIds } })
  if (objectIds.length) clauses.push({ _id: { $in: objectIds } })
  const filter = clauses.length === 0 ? { _id: { $in: [] } } : clauses.length === 1 ? clauses[0] : { $or: clauses }
  const docs = await db.collection<UserDoc>("users").find(filter).toArray()
  const map = new Map<string, User>()
  for (const doc of docs) {
    map.set(normalizeId(doc._id), mapUserDoc(doc))
  }
  return map
}

function collectMemberIds(doc: TeamDoc): string[] {
  const ids = new Set<string>()
  if (Array.isArray(doc.members)) {
    for (const member of doc.members) ids.add(String(member))
  }
  if (doc.managerId) ids.add(String(doc.managerId))
  return Array.from(ids)
}

export function formatTeamResponse(doc: TeamDoc, userMap: Map<string, User>): TeamResponse {
  const id = normalizeId(doc._id)
  const memberIds = collectMemberIds(doc)
  const members = memberIds.map((mid) => userMap.get(mid) || placeholderUser(mid))
  return {
    id,
    _id: id,
    name: doc.name,
    tag: doc.tag,
    managerId: doc.managerId ? String(doc.managerId) : "",
    members,
    captainIds: Array.isArray(doc.captainIds) ? doc.captainIds.map((cid) => String(cid)) : [],
    createdAt: doc.createdAt,
    gamesPlayed: doc.gamesPlayed,
    wins: doc.wins,
    balance: doc.balance,
  }
}

export async function hydrateTeam(db: Db, doc: TeamDoc | null): Promise<TeamResponse | null> {
  if (!doc) return null
  const ids = collectMemberIds(doc)
  const userMap = await fetchUsersByIds(db, ids)
  return formatTeamResponse(doc, userMap)
}

export async function hydrateTeams(db: Db, docs: TeamDoc[]): Promise<TeamResponse[]> {
  if (!docs.length) return []
  const idSet = new Set<string>()
  docs.forEach((doc) => collectMemberIds(doc).forEach((id) => idSet.add(id)))
  const userMap = await fetchUsersByIds(db, Array.from(idSet))
  return docs.map((doc) => formatTeamResponse(doc, userMap))
}

export async function findTeamById(db: Db, id: string) {
  return db.collection<TeamDoc>("teams").findOne(buildIdFilter(id))
}

export function serializeJoinRequest(doc: JoinRequestDoc) {
  return {
    id: normalizeId(doc._id),
    teamId: doc.teamId,
    userId: doc.userId,
    status: doc.status,
    createdAt: doc.createdAt,
    message: doc.message,
  }
}
