import { createHash, randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const base = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";
process.env.DATABASE_URL = process.env.SMOKE_DATABASE_URL || process.env.DATABASE_URL?.replace("@db:5432", "@127.0.0.1:5433");
const prisma = new PrismaClient();

async function check(name, path, expected, init) {
  const response = await fetch(new URL(path, base), init);
  if (response.status !== expected) throw new Error(name + ": expected HTTP " + expected + ", got " + response.status);
  return response;
}
async function checkJson(name, path, expected, init) {
  const response = await check(name, path, expected, init);
  return response.json();
}

try {
  const health = await checkJson("health", "/api/health", 200);
  if (health.database !== "connected") throw new Error("health: database is not connected");
  const home = await check("homepage", "/", 200);
  if (!(await home.text()).includes("NEXUS")) throw new Error("homepage: NEXUS marker missing");
  const publicContent = await checkJson("public content API", "/api/content", 200);
  if (!Array.isArray(publicContent.entries)) throw new Error("public content API: entries array missing");
  await check("search page", "/search?q=nexus", 200);
  await check("category page", "/category/article", 200);
  await check("public site settings", "/api/site-settings", 200);
  await check("server-side admin page guard", "/admin", 307, { redirect: "manual" });
  await check("unauthenticated content creation", "/api/content", 401, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "smoke", body: "smoke", category: "ARTICLE", status: "DRAFT" }),
  });
  await check("admin API access control", "/api/admin/users", 403);
  await check("admin settings access control", "/api/admin/settings", 403);
  await check("notification access control", "/api/notifications", 401);
  await check("media upload access control", "/api/media", 401, { method: "POST" });

  const suffix = randomBytes(4).toString("hex");
  const username = "smoke_" + suffix;
  const user = await prisma.user.create({
    data: {
      email: "smoke-" + suffix + "@example.invalid",
      username,
      nickname: "Smoke Test",
      role: "ADMIN",
      emailVerifiedAt: new Date(),
    },
    select: { id: true, username: true },
  });
  const smokeSettingKey = "smoke." + suffix;
  try {
    const token = randomBytes(32).toString("base64url");
    await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken: createHash("sha256").update(token).digest("hex"),
        expiresAt: new Date(Date.now() + 5 * 60_000),
      },
    });
    const headers = { "Content-Type": "application/json", Cookie: "nexus_session=" + token };
    const me = await checkJson("authenticated identity", "/api/auth/me", 200, { headers });
    if (me.user?.username !== "@" + username) throw new Error("authenticated identity: public handle mismatch");
    await check("authenticated admin page", "/admin", 200, { headers });
    const adminUsers = await checkJson("admin users API", "/api/admin/users", 200, { headers });
    if (!adminUsers.users?.some((item) => item.username === username)) throw new Error("admin users API: smoke account missing");
    await check("admin content API", "/api/admin/content", 200, { headers });
    const settings = await checkJson("batch site settings API", "/api/admin/settings", 200, {
      method: "PUT",
      headers,
      body: JSON.stringify({ entries: [{ key: smokeSettingKey, value: "ok" }] }),
    });
    if (!settings.settings?.some((item) => item.key === smokeSettingKey)) throw new Error("batch site settings API: setting was not saved");

    const created = await checkJson("create published content", "/api/content", 201, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: "Smoke Test " + suffix,
        excerpt: "Docker integration test",
        body: "# Smoke Test\n\nPublished through the authenticated API.",
        category: "ARTICLE",
        status: "PUBLISHED",
      }),
    });
    const entry = created.entry;
    if (!entry?.id || !entry.slug) throw new Error("create content: missing entry identifier");

    const profile = await checkJson("public profile API", "/api/profile/" + username, 200);
    if (profile.profile?.username !== username) throw new Error("public profile API: wrong user");

    const reaction = await checkJson("like content", "/api/content/" + entry.id + "/reaction", 200, { method: "POST", headers });
    if (!reaction.active) throw new Error("like content: reaction not activated");
    const bookmark = await checkJson("bookmark content", "/api/content/" + entry.id + "/bookmark", 200, { method: "POST", headers });
    if (!bookmark.saved) throw new Error("bookmark content: bookmark not saved");
    const pin = await checkJson("pin content", "/api/content/" + entry.id + "/pin", 200, { method: "POST", headers });
    if (!pin.pinned) throw new Error("pin content: pin not created");
    const pinState = await checkJson("read pin state", "/api/content/" + entry.id + "/pin", 200, { headers });
    if (!pinState.pinned) throw new Error("read pin state: pin not found");

    const comment = await checkJson("create comment", "/api/content/" + entry.id + "/comments", 201, {
      method: "POST",
      headers,
      body: JSON.stringify({ body: "Integration test comment" }),
    });
    if (!comment.comment?.id) throw new Error("create comment: comment missing");
    const comments = await checkJson("read comments", "/api/content/" + entry.id + "/comments", 200);
    if (!comments.comments?.some((item) => item.id === comment.comment.id)) throw new Error("read comments: new comment missing");

    const updated = await checkJson("update content", "/api/content/" + entry.id, 200, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ title: "Updated Smoke Test " + suffix, body: "Updated content", status: "PUBLISHED" }),
    });
    if (!updated.entry?.title?.startsWith("Updated Smoke Test")) throw new Error("update content: title was not updated");

    const deleted = await checkJson("delete content", "/api/content/" + entry.id, 200, { method: "DELETE", headers });
    if (!deleted.ok) throw new Error("delete content: deletion failed");
  } finally {
    await prisma.siteSetting.deleteMany({ where: { key: smokeSettingKey } }).catch(() => {});
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
  }

  console.log("Smoke tests passed: public pages, PostgreSQL, auth, content CRUD, profiles, admin moderation, batch settings, likes, bookmarks, pins, comments and protected APIs.");
} finally {
  await prisma.$disconnect();
}
