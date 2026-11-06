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
  const [background, logo, opacity, accent, theme] = await Promise.all([prisma.siteSetting.findUnique({ where: { key: "site.background" }, select: { value: true } }), prisma.siteSetting.findUnique({ where: { key: "site.logo" }, select: { value: true } }), prisma.siteSetting.findUnique({ where: { key: "site.backgroundOpacity" }, select: { value: true } }), prisma.siteSetting.findUnique({ where: { key: "site.accentColor" }, select: { value: true } }), prisma.siteSetting.findUnique({ where: { key: "site.defaultTheme" }, select: { value: true } })]);
  const backgroundUrl = typeof background?.value === "string" ? background.value : "";
  const logoUrl = typeof logo?.value === "string" ? logo.value : "";
  const opacityValue = typeof opacity?.value === "string" ? Math.min(100, Math.max(0, Number(opacity.value))) / 100 : 0.22;
  const accentValue = typeof accent?.value === "string" && /^#[0-9a-f]{6}$/i.test(accent.value) ? accent.value : "#e9b8c9";
  const defaultTheme = theme?.value === "light" ? "light" : "dark";
  return (
    <html lang="zh-CN">
      <body style={{ ...(backgroundUrl ? { "--site-background": "url(" + backgroundUrl + ")" } : {}), ...(logoUrl ? { "--site-logo": "url(" + logoUrl + ")" } : {}), "--site-background-opacity": String(opacityValue), "--rose": accentValue } as React.CSSProperties}>
        <SakuraPetals />
        <ThemeToggle defaultAccent={accentValue} defaultTheme={defaultTheme} />
        {children}
      </body>
    </html>
  );
}
