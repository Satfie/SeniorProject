import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { getDb } from "@/lib/db"
import {
  AuthServiceError,
  normalizeAuthServiceError,
  requireAuthUser,
} from "@/lib/auth-service"
import { deleteNotification } from "@/lib/notification-service"

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ notificationId: string }> }
) {
  const { notificationId } = await context.params
  try {
    const { user } = await requireAuthUser(req)
    const db = await getDb()
    await deleteNotification(db, user.id, notificationId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error)
      return NextResponse.json(payload, { status })
    }
    console.error("/api/notifications/[id] DELETE error", error)
    return NextResponse.json(
      { message: error?.message || "internal error" },
      { status: 500 }
    )
  }
}
