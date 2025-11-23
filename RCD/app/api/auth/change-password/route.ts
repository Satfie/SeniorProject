import { NextRequest, NextResponse } from "next/server";

import { authServiceRequest, normalizeAuthServiceError } from "@/lib/auth-service";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "invalid payload" }, { status: 400 });
  }

  try {
    const payload = await authServiceRequest<{ message: string }>(
      "/api/auth/change-password",
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          Authorization: authHeader,
        },
      }
    );
    return NextResponse.json(payload);
  } catch (error) {
    const { status, payload } = normalizeAuthServiceError(error);
    return NextResponse.json(payload, { status });
  }
}
