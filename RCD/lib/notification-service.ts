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
  return serializeNotification(doc)
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
