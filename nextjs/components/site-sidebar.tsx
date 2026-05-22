"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  Activity,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

const primaryLinks = [
  { href: "/", label: "ダッシュボード", icon: LayoutGrid, exact: true },
  { href: "/users", label: "ユーザー", icon: Users },
  { href: "/events", label: "ログイン履歴", icon: Activity },
];

export function SiteSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[244px] shrink-0 flex-col border-r border-line bg-sidebar">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-clay text-white shadow-soft">
            <ShieldCheck className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-semibold tracking-tight text-ink">
              ID Console
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-subtle">
              Keycloak Admin
            </span>
          </div>
        </Link>
      </div>

      {/* Workspace tag */}
      <div className="mx-5 mb-5 flex items-center justify-between rounded-md border border-line bg-surface px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-grove/60 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-grove" />
          </span>
          <span className="text-[12px] font-medium text-ink">demo realm</span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-subtle">
          live
        </span>
      </div>

      {/* Primary navigation */}
      <nav aria-label="主要メニュー" className="flex flex-col gap-0.5 px-5">
        <p className="px-3 pb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-subtle">
          メイン
        </p>
        {primaryLinks.map((link) => {
          const Icon = link.icon;
          const active = link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="nav-pill"
              data-active={active}
            >
              <Icon className="h-4 w-4" strokeWidth={active ? 2.25 : 1.75} />
              <span className={active ? "font-medium" : ""}>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Resources */}
      <nav aria-label="リソース" className="mt-6 flex flex-col gap-0.5 px-5">
        <p className="px-3 pb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-subtle">
          リソース
        </p>
        <a
          href="http://localhost:8080"
          target="_blank"
          rel="noreferrer"
          className="nav-pill"
        >
          <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
          <span>Keycloak管理画面</span>
        </a>
        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="nav-pill"
        >
          <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
          <span>FastAPI Docs</span>
        </a>
      </nav>

      {/* Bottom: environment card */}
      <div className="mt-auto p-5">
        <div className="surface px-4 py-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-subtle">
              Environment
            </p>
            <span className="h-1.5 w-1.5 rounded-full bg-grove" />
          </div>
          <p className="mt-2 text-[13px] font-semibold tracking-tight text-ink">
            Local · Development
          </p>
          <div className="mt-3 grid grid-cols-2 gap-y-1 font-mono text-[10px] text-ink-muted">
            <span className="text-ink-subtle">realm</span>
            <span className="text-right text-ink">demo</span>
            <span className="text-ink-subtle">api</span>
            <span className="text-right text-ink">:8000</span>
            <span className="text-ink-subtle">idp</span>
            <span className="text-right text-ink">:8080</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
