import type { Metadata } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";

import { SiteNav } from "@/components/site-nav";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ID管理コンソール",
  description: "Keycloak + FastAPI で動くID管理デモアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className={`${fraunces.variable} ${manrope.variable} ${mono.variable}`}
    >
      <body className="font-sans">
        <SiteNav />
        <main className="mx-auto w-full max-w-6xl px-8 py-12">{children}</main>
        <footer className="mx-auto w-full max-w-6xl px-8 pb-10">
          <div className="tick-row h-2 w-full" />
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            ID管理 · Keycloak + FastAPI + Next.js
          </p>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
