import { NextRequest, NextResponse } from "next/server";

import { authServiceRequest, normalizeAuthServiceError } from "@/lib/auth-service";
import type { User } from "@/lib/api";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email as string | undefined;
  const password = body?.password as string | undefined;

  if (!email || !password) {
    return NextResponse.json(
      { message: "email and password required" },
      { status: 400 }
    );
  }

  try {
    const payload = await authServiceRequest<{ token: string; user: User }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
    return NextResponse.json(payload);
  } catch (error) {
    const { status, payload } = normalizeAuthServiceError(error);
    return NextResponse.json(payload, { status });
  }
}
