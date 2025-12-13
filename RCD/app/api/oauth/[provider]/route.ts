import { NextResponse, type NextRequest } from "next/server";

const SUPPORTED_PROVIDERS = new Set(["discord", "google"]);

function getPublicOrigin(req: NextRequest): string {
  // Get the actual public origin from forwarded headers (set by nginx/proxy)
  const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
  const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
  
  if (forwardedHost && !forwardedHost.includes("localhost") && !forwardedHost.includes("127.0.0.1")) {
    return `${forwardedProto}://${forwardedHost.split(":")[0]}`;
  }
  
  // Fallback: check if host header has a real domain
  const host = req.headers.get("host");
  if (host && host.includes(".") && !host.includes("localhost")) {
    return `${forwardedProto}://${host.split(":")[0]}`;
  }
  
  // Last resort: use the request URL origin
  return req.nextUrl.origin;
}

async function redirectToProvider(req: NextRequest, providerParam: string) {
  const normalized = (providerParam || "").toLowerCase();
  if (!SUPPORTED_PROVIDERS.has(normalized)) {
    return NextResponse.json({ message: "Unsupported provider" }, { status: 404 });
  }

  // For browser redirects, we need to use a URL the browser can reach.
  // Use the public-facing origin from forwarded headers.
  const publicAuthUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
  const baseUrl = publicAuthUrl || getPublicOrigin(req);

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

