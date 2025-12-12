import { NextRequest, NextResponse } from "next/server";
import { authServiceRequest, normalizeAuthServiceError } from "@/lib/auth-service";
import type { User } from "@/lib/api";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = await authServiceRequest<{ message: string; user: User }>(
      "/api/auth/set-password",
      {
        method: "POST",
        headers: { Authorization: auth },
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    const { status, payload } = normalizeAuthServiceError(error);
    return NextResponse.json(payload, { status });
  }
}
