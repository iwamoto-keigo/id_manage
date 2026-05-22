import Link from "next/link";
import {
  ArrowUpRight,
  Users as UsersIcon,
  Radio,
  History,
  AlertTriangle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { listEvents, listSessions, listUsers } from "@/lib/api";
import { formatTimestamp, shortId } from "@/lib/utils";

export const dynamic = "force-dynamic";

type FetchResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

async function safe<T>(p: Promise<T>): Promise<FetchResult<T>> {
  try {
    return { ok: true, value: await p };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export default async function DashboardPage() {
  const [users, sessions, events] = await Promise.all([
    safe(listUsers({ max: 1000 })),
    safe(listSessions()),
    safe(listEvents({ max: 8 })),
  ]);

  const userCount = users.ok ? users.value.length : null;
  const enabledUsers = users.ok
    ? users.value.filter((u) => u.enabled).length
    : null;
  const disabledUsers =
    userCount !== null && enabledUsers !== null
      ? userCount - enabledUsers
      : null;
  const sessionCount = sessions.ok ? sessions.value.length : null;
  const recentEvents = events.ok ? events.value : [];

  const today = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());

  return (
    <div className="animate-fade-up space-y-10">
      {/* Page header */}
      <header className="flex items-start justify-between gap-6">
        <div className="space-y-1.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-subtle">
            Overview
          </p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-ink">
            ダッシュボード
          </h1>
          <p className="max-w-xl text-[13px] leading-relaxed text-ink-muted">
            登録ユーザー数・アクティブセッション・直近の認証イベントをまとめて表示します。
          </p>
        </div>
        <div className="hidden flex-col items-end gap-0.5 text-right md:flex">
          <span className="text-[12px] font-medium text-ink">{today}</span>
          <span className="font-mono text-[11px] text-ink-muted">
            {formatTimestamp(Date.now())}
          </span>
        </div>
      </header>

      {/* KPI cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<UsersIcon className="h-4 w-4" strokeWidth={1.75} />}
          eyebrow="登録ユーザー"
          value={userCount}
          loading={!users.ok}
          error={!users.ok ? users.error : undefined}
          footer={
            users.ok ? (
              <div className="flex items-center gap-3 text-[12px] text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-grove" />
                  有効 <span className="text-ink">{enabledUsers}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
                  無効 <span className="text-ink">{disabledUsers}</span>
                </span>
              </div>
            ) : null
          }
          accent="clay"
        />
        <StatCard
          icon={<Radio className="h-4 w-4" strokeWidth={1.75} />}
          eyebrow="アクティブセッション"
          value={sessionCount}
          loading={!sessions.ok}
          error={!sessions.ok ? sessions.error : undefined}
          footer={
            sessions.ok ? (
              <p className="text-[12px] text-ink-muted">
                {sessionCount === 0
                  ? "現在ログイン中のユーザーはいません"
                  : "全クライアントからの合計値"}
              </p>
            ) : null
          }
          accent="grove"
        />
        <StatCard
          icon={<History className="h-4 w-4" strokeWidth={1.75} />}
          eyebrow="直近のイベント"
          value={recentEvents.length}
          loading={!events.ok}
          error={!events.ok ? events.error : undefined}
          footer={
            events.ok ? (
              recentEvents.length === 0 ? (
                <p className="inline-flex items-center gap-1.5 text-[12px] text-ember-ink">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  イベント保存が無効です
                </p>
              ) : (
                <p className="text-[12px] text-ink-muted">
                  最終{" "}
                  <span className="text-ink">
                    {formatTimestamp(recentEvents[0]?.time)}
                  </span>
                </p>
              )
            ) : null
          }
          accent="azure"
        />
      </section>

      {/* Recent activity */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-6">
          <div className="space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-subtle">
              Recent activity
            </p>
            <h2 className="text-[17px] font-semibold tracking-tight text-ink">
              最新のイベント
            </h2>
          </div>
          <Link
            href="/events"
            className="group inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-ink shadow-soft transition-colors hover:border-line-strong hover:bg-surface-soft"
          >
            すべて見る
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {recentEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-surface-soft px-6 py-14 text-center">
            <p className="text-[14px] font-medium text-ink">
              まだイベントは記録されていません
            </p>
            <p className="mt-1.5 text-[12px] text-ink-subtle">
              Keycloakのレルム設定でイベント保存を有効にしてください
            </p>
          </div>
        ) : (
          <ol className="surface divide-y divide-line/70 overflow-hidden">
            {recentEvents.slice(0, 6).map((event, idx) => (
              <li
                key={`${event.time}-${idx}`}
                className="grid grid-cols-[auto_140px_1fr_auto] items-center gap-5 px-5 py-3.5"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-subtle">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[11px] text-ink">
                  {formatTimestamp(event.time)}
                </span>
                <div className="flex items-center gap-2.5">
                  <EventBadge type={event.type} />
                  <span className="font-mono text-[11px] text-ink-subtle">
                    {event.ipAddress ?? "—"}
                  </span>
                  <span className="font-mono text-[11px] text-ink-subtle">
                    · {shortId(event.userId)}
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-subtle">
                  {event.clientId ?? "—"}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

type AccentColor = "clay" | "grove" | "azure";

function StatCard({
  icon,
  eyebrow,
  value,
  footer,
  error,
  loading,
  accent,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  value: number | null;
  footer?: React.ReactNode;
  error?: string;
  loading?: boolean;
  accent: AccentColor;
}) {
  const accentBg = {
    clay: "bg-clay-soft text-clay-ink",
    grove: "bg-grove-soft text-grove-ink",
    azure: "bg-azure-soft text-azure-ink",
  }[accent];

  return (
    <article className="surface ambient-glow relative overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={`grid h-7 w-7 place-items-center rounded-md ${accentBg}`}
          >
            {icon}
          </span>
          <p className="text-[12px] font-medium text-ink-muted">{eyebrow}</p>
        </div>
      </div>
      <div className="mt-5 flex items-baseline gap-1.5">
        {loading ? (
          <span className="stat-numeral text-[40px] text-ink-subtle">—</span>
        ) : (
          <span className="stat-numeral text-[40px]">{value}</span>
        )}
        {!loading && value !== null && (
          <span className="text-[12px] font-medium text-ink-subtle">件</span>
        )}
      </div>
      <div className="mt-3">
        {error ? (
          <p className="text-[11px] font-medium text-ember-ink">
            {error.length > 80 ? `${error.slice(0, 80)}…` : error}
          </p>
        ) : (
          footer
        )}
      </div>
    </article>
  );
}

function EventBadge({ type }: { type: string }) {
  const upper = type.toUpperCase();
  if (upper.includes("ERROR") || upper.includes("FAIL")) {
    return <Badge variant="danger">{type}</Badge>;
  }
  if (upper.includes("LOGIN")) {
    return <Badge variant="active">{type}</Badge>;
  }
  if (upper.includes("LOGOUT")) {
    return <Badge variant="clay">{type}</Badge>;
  }
  return <Badge>{type}</Badge>;
}
