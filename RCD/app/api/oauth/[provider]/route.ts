import { NextResponse, type NextRequest } from "next/server";

const SUPPORTED_PROVIDERS = new Set(["discord", "google"]);

function resolveAuthBaseUrl() {
  return (
    process.env.AUTH_SERVICE_URL ||
    process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
    "http://localhost:3002"
  );
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  const normalized = (provider || "").toLowerCase();
  if (!SUPPORTED_PROVIDERS.has(normalized)) {
    return NextResponse.json({ message: "Unsupported provider" }, { status: 404 });
  }

  const base = resolveAuthBaseUrl();
  const target = new URL(`/api/auth/${normalized}`, base);
  req.nextUrl.searchParams.forEach((value, key) => {
    if (value) {
      target.searchParams.set(key, value);
    }
  });

  return NextResponse.redirect(target.toString());
}

