import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

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
  const sessionCount = sessions.ok ? sessions.value.length : null;
  const recentEvents = events.ok ? events.value : [];

  const today = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());

  return (
    <div className="animate-fade-up space-y-20">
      {/* 見出し */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-6">
          <div className="space-y-3">
            <p className="eyebrow">概要</p>
            <h1 className="font-display text-5xl leading-[1.05] tracking-[-0.02em] text-ink sm:text-6xl">
              ダッシュボード
            </h1>
          </div>
          <div className="hidden text-right font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block">
            <div>更新 {formatTimestamp(Date.now())}</div>
            <div className="mt-1">{today}</div>
          </div>
        </div>
        <div className="rule-hr animate-rule-grow" />
      </section>

      {/* 指標カード */}
      <section className="grid gap-px border border-rule bg-rule sm:grid-cols-3">
        <StatCard
          numeral={userCount !== null ? userCount.toString().padStart(2, "0") : "—"}
          label="登録ユーザー"
          detail={
            users.ok
              ? `有効 ${enabledUsers} 件 / 無効 ${userCount! - enabledUsers!} 件`
              : users.error
          }
          error={!users.ok}
        />
        <StatCard
          numeral={sessionCount !== null ? sessionCount.toString().padStart(2, "0") : "—"}
          label="アクティブセッション"
          detail={
            sessions.ok
              ? sessionCount === 0
                ? "現在ログイン中のユーザーはいません"
                : "全クライアント集計"
              : sessions.error
          }
          error={!sessions.ok}
        />
        <StatCard
          numeral={recentEvents.length.toString().padStart(2, "0")}
          label="直近のイベント"
          detail={
            events.ok
              ? events.value.length === 0
                ? "イベント保存が無効です"
                : `最終: ${formatTimestamp(
                    recentEvents[recentEvents.length - 1]?.time,
                  )}`
              : events.error
          }
          error={!events.ok}
        />
      </section>

      {/* 直近イベント */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="eyebrow">直近のアクティビティ</p>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              最新のイベント
            </h2>
          </div>
          <Link
            href="/events"
            className="group flex items-center gap-2 text-[12px] tracking-[0.04em] text-ink"
          >
            ログイン履歴を開く
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="tick-row h-2" />

        {recentEvents.length === 0 ? (
          <div className="border border-dashed border-rule bg-card/40 px-6 py-14 text-center">
            <p className="font-display text-lg text-muted-foreground">
              まだイベントは記録されていません
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Keycloakのレルム設定でイベント保存を有効にしてください
            </p>
          </div>
        ) : (
          <ol className="space-y-0 divide-y divide-rule border-y border-rule">
            {recentEvents.slice(0, 6).map((event, idx) => (
              <li
                key={`${event.time}-${idx}`}
                className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-6 px-2 py-4"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[11px] text-ink">
                  {formatTimestamp(event.time)}
                </span>
                <div className="flex items-baseline gap-3">
                  <EventBadge type={event.type} />
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {event.ipAddress ?? "—"}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {shortId(event.userId)}
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
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

function StatCard({
  numeral,
  label,
  detail,
  error,
}: {
  numeral: string;
  label: string;
  detail: string;
  error?: boolean;
}) {
  return (
    <article className="relative flex flex-col gap-6 bg-card p-8">
      <div className="flex items-start justify-between">
        <p className="eyebrow max-w-[18ch]">{label}</p>
        <span className="font-mono text-[10px] text-muted-foreground">§</span>
      </div>
      <div className="stat-numeral">{numeral}</div>
      <p
        className={
          error
            ? "font-mono text-[10px] uppercase tracking-[0.18em] text-destructive"
            : "font-mono text-[11px] text-muted-foreground"
        }
      >
        {detail}
      </p>
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
    return <Badge variant="sienna">{type}</Badge>;
  }
  return <Badge>{type}</Badge>;
}
