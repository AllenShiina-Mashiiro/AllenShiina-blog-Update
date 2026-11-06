import type { Metadata } from "next";
import "./globals.css";
import SakuraPetals from "@/components/SakuraPetals";
import ThemeToggle from "@/components/ThemeToggle";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const values = await prisma.siteSetting.findMany({ where: { key: { in: ["site.title", "site.description"] } } });
  const settings = new Map(values.map(item => [item.key, String(item.value ?? "")]));
  return { title: settings.get("site.title") || "NEXUS — Personal Archive", description: settings.get("site.description") || "A quiet corner for notes, resources, life and articles." };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [background, logo, opacity] = await Promise.all([prisma.siteSetting.findUnique({ where: { key: "site.background" }, select: { value: true } }), prisma.siteSetting.findUnique({ where: { key: "site.logo" }, select: { value: true } }), prisma.siteSetting.findUnique({ where: { key: "site.backgroundOpacity" }, select: { value: true } })]);
  const backgroundUrl = typeof background?.value === "string" ? background.value : "";
  const logoUrl = typeof logo?.value === "string" ? logo.value : "";
  const opacityValue = typeof opacity?.value === "string" ? Math.min(100, Math.max(0, Number(opacity.value))) / 100 : 0.22;
  return (
    <html lang="zh-CN">
      <body style={{ ...(backgroundUrl ? { "--site-background": "url(" + backgroundUrl + ")" } : {}), ...(logoUrl ? { "--site-logo": "url(" + logoUrl + ")" } : {}), "--site-background-opacity": String(opacityValue) } as React.CSSProperties}>
        <SakuraPetals />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
