import { NextResponse, type NextRequest } from "next/server";

const SUPPORTED_PROVIDERS = new Set(["discord", "google"]);

function isDockerOnlyHostname(host: string) {
  const h = (host || "").toLowerCase();
  return h && !h.includes(".") && h !== "localhost" && h !== "127.0.0.1";
}

async function redirectToProvider(req: NextRequest, providerParam: string) {
  const normalized = (providerParam || "").toLowerCase();
  if (!SUPPORTED_PROVIDERS.has(normalized)) {
    return NextResponse.json({ message: "Unsupported provider" }, { status: 404 });
  }

  // Prefer public URL; fallback to internal auth URL.
  const publicEnv = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
  const internalEnv = process.env.AUTH_SERVICE_URL;

  let baseUrl = publicEnv || internalEnv || "http://localhost:3002";
  try {
    const url = new URL(baseUrl);
    if (!publicEnv && isDockerOnlyHostname(url.hostname)) {
      // Rewrite to request hostname so browser can resolve (avoid docker-only names like rcd-auth)
      url.hostname = req.nextUrl.hostname;
      baseUrl = url.toString();
    }
  } catch {
    baseUrl = "http://localhost:3002";
  }

  const target = new URL(`/api/auth/${normalized}`, baseUrl);
  req.nextUrl.searchParams.forEach((value, key) => {
    if (value) target.searchParams.set(key, value);
  });

  return NextResponse.redirect(target.toString());
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  return redirectToProvider(req, provider);
}

// Although OAuth 2.0 authorization endpoints are typically accessed via GET requests,
// some clients (e.g., certain mobile SDKs, legacy integrations, or tools that do not support GET redirects)
// may initiate the OAuth flow using POST. This handler allows POST requests to behave like GET for compatibility.
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  return redirectToProvider(req, provider);
}

// Allow preflight without error.
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    },
  });
}

