import { NextRequest, NextResponse } from "next/server";

import { authServiceRequest, normalizeAuthServiceError } from "@/lib/auth-service";
import type { User } from "@/lib/api";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  if (!provider) {
    return NextResponse.json({ message: "Provider required" }, { status: 400 });
  }
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  try {
    const user = await authServiceRequest<User>(`/api/auth/providers/${provider.toLowerCase()}`, {
      method: "DELETE",
      headers: { Authorization: auth },
    });
    return NextResponse.json(user);
  } catch (error) {
    const { status, payload } = normalizeAuthServiceError(error);
    return NextResponse.json(payload, { status });
  }
}

