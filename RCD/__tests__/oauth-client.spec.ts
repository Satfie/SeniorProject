import { buildOAuthStartUrl } from "@/lib/oauth-client";

describe("buildOAuthStartUrl", () => {
  it("builds login url without token", () => {
    expect(buildOAuthStartUrl("discord")).toBe("/api/oauth/discord?mode=login");
  });

  it("appends returnTo when provided", () => {
    expect(buildOAuthStartUrl("discord", { returnTo: "/teams" })).toBe(
      "/api/oauth/discord?mode=login&returnTo=%2Fteams"
    );
  });

  it("includes token for link mode only", () => {
    const url = buildOAuthStartUrl("discord", {
      mode: "link",
      token: "abc123",
    });
    expect(url).toBe("/api/oauth/discord?mode=link&token=abc123");
  });
});

