import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { getDb } from "@/lib/db"
import {
  AuthServiceError,
  normalizeAuthServiceError,
  requireAuthUser,
} from "@/lib/auth-service"
import {
  clearNotifications,
  listUserNotifications,
} from "@/lib/notification-service"

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuthUser(req)
    const db = await getDb()
    const notes = await listUserNotifications(db, user.id)
    return NextResponse.json(notes)
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error)
      return NextResponse.json(payload, { status })
    }
    console.error("/api/notifications GET error", error)
    return NextResponse.json(
      { message: error?.message || "internal error" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user } = await requireAuthUser(req)
    const db = await getDb()
    await clearNotifications(db, user.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error)
      return NextResponse.json(payload, { status })
    }
    console.error("/api/notifications DELETE error", error)
    return NextResponse.json(
      { message: error?.message || "internal error" },
      { status: 500 }
    )
  }
}
