import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUserSession } from "@/lib/session";
import { normalizeHandle } from "@/lib/handles";

type OAuthProfile = { id: string; email: string; name: string; avatarUrl: string | null; handle: string };
async function getGoogleProfile(code: string, callback: string): Promise<OAuthProfile> {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: callback, grant_type: "authorization_code" }) });
  if (!tokenResponse.ok) throw new Error("Google token exchange failed");
  const token = await tokenResponse.json() as { access_token: string };
  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` } });
  if (!profileResponse.ok) throw new Error("Google profile request failed");
  const p = await profileResponse.json() as { sub: string; email?: string; email_verified?: boolean; name?: string; picture?: string };
  if (!p.email || !p.email_verified) throw new Error("Google 未提供已验证邮箱。");
  return { id: p.sub, email: p.email.toLowerCase(), name: p.name || p.email.split("@")[0], avatarUrl: p.picture || null, handle: p.email.split("@")[0] };
}
async function getGithubProfile(code: string, callback: string): Promise<OAuthProfile> {
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ code, client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, redirect_uri: callback }) });
  if (!tokenResponse.ok) throw new Error("GitHub token exchange failed");
  const token = await tokenResponse.json() as { access_token?: string };
  if (!token.access_token) throw new Error("GitHub OAuth token missing");
  const headers = { Authorization: `Bearer ${token.access_token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "NEXUS-Blog" };
  const [userResponse, emailsResponse] = await Promise.all([fetch("https://api.github.com/user", { headers }), fetch("https://api.github.com/user/emails", { headers })]);
  if (!userResponse.ok || !emailsResponse.ok) throw new Error("GitHub profile request failed");
  const user = await userResponse.json() as { id: number; login: string; name?: string | null; avatar_url?: string };
  const emails = await emailsResponse.json() as { email: string; primary: boolean; verified: boolean }[];
  const email = emails.find(x => x.primary && x.verified)?.email || emails.find(x => x.verified)?.email;
  if (!email) throw new Error("GitHub 账号没有可用的已验证邮箱。");
  return { id: String(user.id), email: email.toLowerCase(), name: user.name || user.login, avatarUrl: user.avatar_url || null, handle: user.login };
}
function safeHandle(value: string) {
  const cleaned = normalizeHandle(value).replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "").slice(0, 22);
  return cleaned.length >= 3 ? cleaned : `user_${cleaned}`;
}
async function uniqueHandle(seed: string) {
  const base = safeHandle(seed);
  for (let i = 0; i < 8; i++) {
    const candidate = i === 0 ? base : `${base.slice(0, 22)}_${randomBytes(2).toString("hex")}`;
    if (!await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } })) return candidate;
  }
  throw new Error("无法生成唯一用户 ID，请稍后重试。");
}
export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  const origin = process.env.APP_URL || request.nextUrl.origin;
  const fail = (message: string) => NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, origin));
  if (provider !== "google" && provider !== "github") return fail("不支持的登录方式");
  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  if (!state || !code || state !== request.cookies.get("nexus_oauth_state")?.value || provider !== request.cookies.get("nexus_oauth_provider")?.value) return fail("OAuth 状态校验失败，请重试");
  const callback = `${origin}/api/auth/oauth/${provider}/callback`;
  try {
    const profile = provider === "google" ? await getGoogleProfile(code, callback) : await getGithubProfile(code, callback);
    const existingAccount = await prisma.oAuthAccount.findUnique({ where: { provider_providerAccountId: { provider, providerAccountId: profile.id } }, include: { user: true } });
    let user = existingAccount?.user;
    if (!user) {
      const emailOwner = await prisma.user.findUnique({ where: { email: profile.email }, select: { id: true } });
      if (emailOwner) return fail("该邮箱已存在账号。请先使用邮箱登录，再在账号设置中绑定第三方登录。");
      const username = await uniqueHandle(profile.handle || profile.email.split("@")[0]);
      user = await prisma.$transaction(async tx => {
        const adminEmails=(process.env.ADMIN_EMAILS||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
        const created = await tx.user.create({ data: { email: profile.email, emailVerifiedAt: new Date(), username, nickname: profile.name.slice(0, 60), avatarUrl: profile.avatarUrl, role: adminEmails.includes(profile.email) ? "ADMIN" : "USER" } });
        await tx.oAuthAccount.create({ data: { userId: created.id, provider, providerAccountId: profile.id } });
        return created;
      });
    }
    if (user.isBanned) return fail("该账号已被限制登录。");
    await createUserSession(user.id);
    const response = NextResponse.redirect(new URL("/", origin));
    response.cookies.delete("nexus_oauth_state");
    response.cookies.delete("nexus_oauth_provider");
    return response;
  } catch (error) {
    console.error("OAuth callback failed", error);
    return fail(error instanceof Error ? error.message : "第三方登录失败，请重试");
  }
}
