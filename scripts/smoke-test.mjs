const base = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";
async function check(name, path, expected, init) {
  const response = await fetch(new URL(path, base), init);
  if (response.status !== expected) throw new Error(name + ": expected HTTP " + expected + ", got " + response.status);
  return response;
}
const health = await check("health", "/api/health", 200);
const healthBody = await health.json();
if (healthBody.database !== "connected") throw new Error("health: database is not connected");
const home = await check("homepage", "/", 200);
if (!(await home.text()).includes("NEXUS")) throw new Error("homepage: NEXUS marker missing");
const content = await check("public content API", "/api/content", 200);
if (!Array.isArray((await content.json()).entries)) throw new Error("public content API: entries array missing");
await check("search page", "/search?q=nexus", 200);
await check("category page", "/category/article", 200);
await check("unauthenticated content creation", "/api/content", 401, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "smoke", body: "smoke", category: "ARTICLE", status: "DRAFT" }),
});
await check("admin API access control", "/api/admin/users", 403);
await check("admin settings access control", "/api/admin/settings", 403);
await check("notification access control", "/api/notifications", 401);
await check("media upload access control", "/api/media", 401, { method: "POST" });
console.log("Smoke tests passed: homepage, public content, search, category, DB health and protected APIs.");
