import { NextResponse } from "next/server"
import { authServiceRequest, normalizeAuthServiceError } from "@/lib/auth-service"

export async function GET() {
  try {
    const data = await authServiceRequest<{ discord: boolean; google: boolean }>(
      "/api/auth/providers/status",
      { method: "GET" }
    )
    return NextResponse.json(data)
  } catch (error) {
    const { status, payload } = normalizeAuthServiceError(error)
    return NextResponse.json(payload, { status })
  }
}
