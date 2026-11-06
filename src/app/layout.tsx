import type { Metadata } from "next";
import "./globals.css";
import SakuraPetals from "@/components/SakuraPetals";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "NEXUS — Personal Archive",
  description: "A quiet corner for notes, resources, life and articles.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <SakuraPetals />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
