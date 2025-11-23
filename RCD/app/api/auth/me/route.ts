import { NextRequest, NextResponse } from "next/server";

import { authServiceRequest, normalizeAuthServiceError } from "@/lib/auth-service";
import type { User } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  try {
    const user = await authServiceRequest<User>("/api/auth/me", {
      headers: {
        Authorization: auth,
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    const { status, payload } = normalizeAuthServiceError(error);
    return NextResponse.json(payload, { status });
  }
}
