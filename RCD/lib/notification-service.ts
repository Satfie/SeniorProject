import { Db, ObjectId } from "mongodb"
import { buildIdFilter, normalizeId } from "@/lib/team-service"

type NotificationType = "info" | "warning" | "success" | "action"

export type NotificationDoc = {
  _id: ObjectId | string
  userId: string
  type: NotificationType
  message: string
  createdAt: string
  read?: boolean
  teamId?: string
  requestId?: string
  metadata?: Record<string, unknown>
}

const COLLECTION = "notifications"

function nowIso() {
  return new Date().toISOString()
}

export type Notification = ReturnType<typeof serializeNotification>

type NotificationEvent = {
  kind: "created"
  notification: Notification
}

const subscribers = new Map<string, Set<(event: NotificationEvent) => void>>()

function broadcast(userId: string, event: NotificationEvent) {
  const set = subscribers.get(userId)
  if (!set || !set.size) return
  set.forEach((handler) => {
    try {
      handler(event)
    } catch (error) {
      console.error("[notification-service] subscriber error", error)
    }
  })
}

export function subscribeToNotifications(
  userId: string,
  handler: (event: NotificationEvent) => void
) {
  if (!subscribers.has(userId)) {
    subscribers.set(userId, new Set())
  }
  const set = subscribers.get(userId)!
  set.add(handler)
  return () => {
    const current = subscribers.get(userId)
    if (!current) return
    current.delete(handler)
    if (!current.size) {
      subscribers.delete(userId)
    }
  }
}

export type NotificationPayload = {
  userId: string
  type?: NotificationType
  message: string
  createdAt?: string
  read?: boolean
  teamId?: string
  requestId?: string
  metadata?: Record<string, unknown>
}

export function serializeNotification(doc: NotificationDoc) {
  const baseMetadata: Record<string, unknown> | undefined = doc.metadata
    ? { ...doc.metadata }
    : undefined
  if (doc.teamId || doc.requestId) {
    if (baseMetadata) {
      if (doc.teamId && !baseMetadata.teamId) baseMetadata.teamId = doc.teamId
      if (doc.requestId && !baseMetadata.requestId) baseMetadata.requestId = doc.requestId
    } else {
      const next: Record<string, unknown> = {}
      if (doc.teamId) next.teamId = doc.teamId
      if (doc.requestId) next.requestId = doc.requestId
      return {
        id: normalizeId(doc._id),
        userId: doc.userId,
        type: doc.type || "info",
        message: doc.message,
        createdAt: doc.createdAt,
        read: !!doc.read,
        metadata: next,
        teamId: doc.teamId,
        requestId: doc.requestId,
      }
    }
  }
  return {
    id: normalizeId(doc._id),
    userId: doc.userId,
    type: doc.type || "info",
    message: doc.message,
    createdAt: doc.createdAt,
    read: !!doc.read,
    metadata: baseMetadata,
    teamId: doc.teamId,
    requestId: doc.requestId,
  }
}

export async function listUserNotifications(db: Db, userId: string, limit = 50) {
  const docs = await db
    .collection<NotificationDoc>(COLLECTION)
    .find({ userId })
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit)
    .toArray()
  return docs.map(serializeNotification)
}

export async function createNotification(db: Db, payload: NotificationPayload) {
  const doc: NotificationDoc = {
    _id: new ObjectId(),
    userId: payload.userId,
    type: payload.type || "info",
    message: payload.message,
    createdAt: payload.createdAt ? new Date(payload.createdAt).toISOString() : nowIso(),
    read: payload.read ?? false,
    teamId: payload.teamId,
    requestId: payload.requestId,
    metadata: payload.metadata,
  }
  await db.collection<NotificationDoc>(COLLECTION).insertOne(doc as any)
  const serialized = serializeNotification(doc)
  broadcast(doc.userId, { kind: "created", notification: serialized })
  return serialized
}

export async function createNotifications(db: Db, payloads: NotificationPayload[]) {
  if (!payloads.length) return
  const docs: NotificationDoc[] = payloads.map((payload) => ({
    _id: new ObjectId(),
    userId: payload.userId,
    type: payload.type || "info",
    message: payload.message,
    createdAt: payload.createdAt ? new Date(payload.createdAt).toISOString() : nowIso(),
    read: payload.read ?? false,
    teamId: payload.teamId,
    requestId: payload.requestId,
    metadata: payload.metadata,
  }))
  await db.collection<NotificationDoc>(COLLECTION).insertMany(docs as any)
  docs.forEach((doc) => {
    const serialized = serializeNotification(doc)
    broadcast(doc.userId, { kind: "created", notification: serialized })
  })
}

export async function clearNotifications(db: Db, userId: string) {
  await db.collection<NotificationDoc>(COLLECTION).deleteMany({ userId })
}

export async function markNotificationsRead(db: Db, userId: string) {
  const res = await db
    .collection<NotificationDoc>(COLLECTION)
    .updateMany({ userId, read: { $ne: true } }, { $set: { read: true } })
  return res.modifiedCount || 0
}

export async function deleteNotification(db: Db, userId: string, notificationId: string) {
  await db
    .collection<NotificationDoc>(COLLECTION)
    .deleteOne({ userId, ...buildIdFilter(notificationId) })
}
