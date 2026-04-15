"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "ダッシュボード" },
  { href: "/users", label: "ユーザー" },
  { href: "/events", label: "ログイン履歴" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-rule bg-paper/80 backdrop-blur supports-[backdrop-filter]:bg-paper/60">
      <div className="mx-auto flex w-full max-w-6xl items-end justify-between gap-8 px-8 py-5">
        <Link
          href="/"
          className="group flex items-baseline gap-3 transition-colors"
        >
          <span className="font-display text-[26px] leading-none tracking-tight text-ink">
            ID管理
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground sm:inline">
            / admin console
          </span>
        </Link>

        <nav aria-label="主要メニュー" className="flex items-stretch gap-1">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group relative flex items-baseline px-4 py-2 text-[12px] tracking-[0.08em] transition-colors",
                  active ? "text-ink" : "text-muted-foreground hover:text-ink",
                )}
              >
                <span>{link.label}</span>
                <span
                  className={cn(
                    "absolute inset-x-4 -bottom-[21px] h-px origin-left bg-ink transition-transform duration-500",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                  )}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
