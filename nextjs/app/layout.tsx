import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteSidebar } from "@/components/site-sidebar";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const sans = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ID管理コンソール",
  description: "Keycloak + FastAPI で動くID管理ダッシュボード",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <div className="flex min-h-screen bg-canvas">
          <SiteSidebar />
          <div className="flex flex-1 flex-col">
            <main className="flex-1 px-10 py-10">
              <div className="mx-auto w-full max-w-[1180px]">{children}</div>
            </main>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
