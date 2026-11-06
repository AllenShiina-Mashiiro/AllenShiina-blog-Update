import type { Metadata } from "next";
import "./globals.css";
import SakuraPetals from "@/components/SakuraPetals";
import ThemeToggle from "@/components/ThemeToggle";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const values = await prisma.siteSetting.findMany({ where: { key: { in: ["site.title", "site.description"] } } });
  const settings = new Map(values.map(item => [item.key, String(item.value ?? "")]));
  return { title: settings.get("site.title") || "NEXUS — Personal Archive", description: settings.get("site.description") || "A quiet corner for notes, resources, life and articles." };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const background = await prisma.siteSetting.findUnique({ where: { key: "site.background" }, select: { value: true } });
  const backgroundUrl = typeof background?.value === "string" ? background.value : "";
  return (
    <html lang="zh-CN">
      <body style={backgroundUrl ? { "--site-background": `url("${backgroundUrl.replaceAll('"', '%22')}")` } as React.CSSProperties : undefined}>
        <SakuraPetals />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
