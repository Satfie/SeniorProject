import type { NextRequest } from "next/server"
import type { User } from "@/lib/api"

const AUTH_SERVICE_ENV_KEYS = [
  "AUTH_SERVICE_URL",
  "RCD_AUTH_SERVICE_URL",
  "AUTH_SERVER_URL",
  "AUTH_API_URL",
] as const

let cachedBaseUrl: string | null = null

function resolveBaseUrl(): string {
  if (cachedBaseUrl) {
    return cachedBaseUrl
  }

  for (const key of AUTH_SERVICE_ENV_KEYS) {
    const value = process.env[key]
    if (value && typeof value === "string") {
      cachedBaseUrl = value.replace(/\/$/, "")
      return cachedBaseUrl
    }
  }

  if (process.env.NODE_ENV !== "production") {
    cachedBaseUrl = "http://localhost:3002"
    return cachedBaseUrl
  }

  throw new Error(
    "Authentication service URL is not configured. Set AUTH_SERVICE_URL in the environment."
  )
}

export class AuthServiceError extends Error {
  status: number
  payload?: unknown

  constructor(message: string, status: number, payload?: unknown) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

function parseMaybeJson(text: string) {
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function authServiceRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const baseUrl = resolveBaseUrl()
  const target = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`
  const headers = new Headers(init.headers || undefined)
  headers.set("Accept", "application/json")
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  try {
    const response = await fetch(target, {
      ...init,
      headers,
      cache: "no-store",
    })

    const text = await response.text()
    const payload = parseMaybeJson(text)

    if (!response.ok) {
      throw new AuthServiceError(
        typeof payload === "string"
          ? payload
          : payload?.message || `Auth service responded with ${response.status}`,
        response.status,
        payload
      )
    }

    return (payload as T) ?? ({} as T)
  } catch (error) {
    if (error instanceof AuthServiceError) {
      throw error
    }
    console.error("[auth-service] request failed", error)
    throw new AuthServiceError("Failed to reach authentication service", 502)
  }
}

export function normalizeAuthServiceError(error: unknown) {
  if (error instanceof AuthServiceError) {
    const payload =
      typeof error.payload === "object" && error.payload !== null
        ? error.payload
        : { message: error.message }
    return { status: error.status, payload }
  }
  console.error("[auth-service] unexpected error", error)
  return {
    status: 502,
    payload: { message: "Authentication service unavailable" },
  }
}

function extractBearerToken(headerValue: string | null) {
  if (!headerValue) return null
  const trimmed = headerValue.trim()
  if (!trimmed.toLowerCase().startsWith("bearer ")) return null
  const token = trimmed.slice(7).trim()
  return token || null
}

export function getAuthToken(req: NextRequest): string | null {
  return extractBearerToken(req.headers.get("authorization"))
}

export async function fetchAuthUserForToken(token: string): Promise<User> {
  return authServiceRequest<User>("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function requireAuthUser(req: NextRequest) {
  const token = getAuthToken(req)
  if (!token) {
    throw new AuthServiceError("Unauthorized", 401)
  }
  const user = await fetchAuthUserForToken(token)
  return { token, user }
}
