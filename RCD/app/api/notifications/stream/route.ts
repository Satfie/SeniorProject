import { NextResponse } from "next/server"

import { getDb } from "@/lib/db"
import {
  AuthServiceError,
  normalizeAuthServiceError,
  fetchAuthUserForToken,
} from "@/lib/auth-service"
import {
  listUserNotifications,
  subscribeToNotifications,
} from "@/lib/notification-service"

function extractBearer(value: string | null) {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed.toLowerCase().startsWith("bearer ")) return null
  const token = trimmed.slice(7).trim()
  return token || null
}

function formatEvent(eventName: string, payload: unknown) {
  return `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const tokenParam = url.searchParams.get("token")
    const headerToken = extractBearer(request.headers.get("authorization"))
    const token = tokenParam || headerToken
    if (!token) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 })
    }
    const user = await fetchAuthUserForToken(token)
    const db = await getDb()
    const seed = await listUserNotifications(db, user.id)

    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        let active = true
        const safeSend = (payload: string) => {
          if (!active) return
          try {
            controller.enqueue(encoder.encode(payload))
          } catch (error) {
            active = false
            cleanup()
          }
        }

        const cleanup = () => {
          if (!active) return
          active = false
          if (unsubscribe) unsubscribe()
          if (interval) clearInterval(interval)
        }

        seed.forEach((note) => {
          safeSend(formatEvent("notification", note))
        })

        const unsubscribe = subscribeToNotifications(user.id, (event) => {
          if (event.kind === "created") {
            safeSend(formatEvent("notification", event.notification))
          }
        })

        const interval = setInterval(() => {
          safeSend(": ping\n\n")
        }, 15000)

        ;(controller as any).cleanup = cleanup
      },
      cancel() {
        const cleanup = (this as any).cleanup
        if (cleanup) cleanup()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  } catch (error: any) {
    if (error instanceof AuthServiceError) {
      const { status, payload } = normalizeAuthServiceError(error)
      return NextResponse.json(payload, { status })
    }
    console.error("/api/notifications/stream error", error)
    return NextResponse.json({ message: error?.message || "internal error" }, { status: 500 })
  }
}
