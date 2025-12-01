export type OAuthMode = "login" | "link";

export function buildOAuthStartUrl(
  provider: string,
  options: { mode?: OAuthMode; token?: string; returnTo?: string } = {}
) {
  const params = new URLSearchParams();
  const mode = options.mode || "login";
  params.set("mode", mode);
  if (options.returnTo) {
    params.set("returnTo", options.returnTo);
  }
  if (mode === "link" && options.token) {
    params.set("token", options.token);
  }
  const qs = params.toString();
  return `/api/oauth/${provider}${qs ? `?${qs}` : ""}`;
}

