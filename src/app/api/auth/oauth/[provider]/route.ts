import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  if (provider !== "google" && provider !== "github") return NextResponse.json({ error: "Unsupported provider" }, { status: 404 });
  const clientId = provider === "google" ? process.env.GOOGLE_CLIENT_ID : process.env.GITHUB_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: `${provider} OAuth 尚未配置。` }, { status: 503 });
  const state = randomBytes(32).toString("hex");
  const callback = `${process.env.APP_URL || request.nextUrl.origin}/api/auth/oauth/${provider}/callback`;
  const url = provider === "google"
    ? new URL("https://accounts.google.com/o/oauth2/v2/auth")
    : new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", callback);
  url.searchParams.set("state", state);
  if (provider === "google") {
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("prompt", "select_account");
  } else {
    url.searchParams.set("scope", "read:user user:email");
  }
  const response = NextResponse.redirect(url);
  response.cookies.set("nexus_oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  response.cookies.set("nexus_oauth_provider", provider, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  return response;
}
