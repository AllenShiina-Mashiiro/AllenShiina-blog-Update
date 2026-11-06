import type { Metadata } from "next";
import "./globals.css";
import SakuraPetals from "@/components/SakuraPetals";
import ThemeToggle from "@/components/ThemeToggle";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const values = await prisma.siteSetting.findMany({
    where: { key: { in: ["site.title", "site.description"] } },
  });
  const settings = new Map(values.map((item) => [item.key, String(item.value ?? "")]));
  return {
    title: settings.get("site.title") || "NEXUS - Personal Archive",
    description: settings.get("site.description") || "A quiet corner for notes, resources, life and articles.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const siteSettings = await prisma.siteSetting.findMany({
    where: { key: { in: ["site.background", "site.backgroundSecondary", "site.logo", "site.backgroundOpacity", "site.accentColor", "site.defaultTheme"] } },
    select: { key: true, value: true },
  });
  const settings = new Map(siteSettings.map((item) => [item.key, item.value]));
  const background = settings.get("site.background");
  const backgroundSecondary = settings.get("site.backgroundSecondary");
  const logo = settings.get("site.logo");
  const opacity = settings.get("site.backgroundOpacity");
  const accent = settings.get("site.accentColor");
  const theme = settings.get("site.defaultTheme");
  const backgroundUrl = typeof background === "string" ? background : "";
  const backgroundSecondaryUrl = typeof backgroundSecondary === "string" ? backgroundSecondary : "";
  const logoUrl = typeof logo === "string" ? logo : "";
  const opacityNumber = typeof opacity === "string" || typeof opacity === "number" ? Number(opacity) : 22;
  const opacityValue = Math.min(100, Math.max(0, Number.isFinite(opacityNumber) ? opacityNumber : 22)) / 100;
  const accentValue = typeof accent === "string" && /^#[0-9a-f]{6}$/i.test(accent) ? accent : "#e9b8c9";
  const defaultTheme = theme === "light" ? "light" : "dark";

  return (
    <html lang="zh-CN" data-theme={defaultTheme}>
      <body
        style={
          {
            ...(backgroundUrl ? { "--site-background": "url(" + backgroundUrl + ")" } : {}),
            ...(backgroundSecondaryUrl ? { "--site-background-secondary": "url(" + backgroundSecondaryUrl + ")" } : {}),
            ...(logoUrl ? { "--site-logo": "url(" + logoUrl + ")" } : {}),
            "--site-background-opacity": String(opacityValue),
            "--rose": accentValue,
          } as React.CSSProperties
        }
      >
        <div className="site-background-secondary" aria-hidden="true" />
        <SakuraPetals />
        <ThemeToggle defaultAccent={accentValue} defaultTheme={defaultTheme} />
        {children}
      </body>
    </html>
  );
}
