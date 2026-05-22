import { AlertCircle, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listEvents, listUsers } from "@/lib/api";
import { formatTimestamp, shortId } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  let error: string | null = null;
  let events: Awaited<ReturnType<typeof listEvents>> = [];
  let usernameById = new Map<string, string>();

  try {
    const [evts, users] = await Promise.all([
      listEvents({ max: 100 }),
      listUsers({ max: 500 }).catch(() => []),
    ]);
    events = evts;
    usernameById = new Map(users.map((u) => [u.id, u.username]));
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const loginCount = events.filter((e) => e.type.toUpperCase() === "LOGIN").length;
  const errorCount = events.filter((e) => {
    const t = e.type.toUpperCase();
    return t.includes("ERROR") || t.includes("FAIL");
  }).length;
  const logoutCount = events.filter((e) =>
    e.type.toUpperCase().includes("LOGOUT"),
  ).length;

  return (
    <div className="animate-fade-up space-y-8">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-end justify-between gap-6">
          <div className="space-y-1.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-subtle">
              Activity · Login history
            </p>
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-ink">
              ログイン履歴
            </h1>
            <p className="max-w-2xl text-[13px] leading-relaxed text-ink-muted">
              新しい順に並んでいます。取得できる件数と保存有無はKeycloakレルムのイベント設定に依存します。
            </p>
          </div>
        </div>

        {/* meta row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant="muted">
            合計 <span className="ml-1 text-ink">{events.length}</span>
          </Badge>
          <Badge variant="active">
            ログイン <span className="ml-1">{loginCount}</span>
          </Badge>
          <Badge variant="clay">
            ログアウト <span className="ml-1">{logoutCount}</span>
          </Badge>
          <Badge variant="danger">
            エラー <span className="ml-1">{errorCount}</span>
          </Badge>
        </div>
      </header>

      {error ? (
        <div className="surface flex items-start gap-3 border-ember/40 bg-ember-soft p-5">
          <AlertCircle className="mt-0.5 h-4 w-4 text-ember-ink" />
          <div className="space-y-1">
            <p className="text-[13px] font-medium text-ember-ink">
              イベントを取得できません
            </p>
            <p className="font-mono text-[11px] text-ember-ink/80">{error}</p>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="surface flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-azure-soft">
            <Info className="h-5 w-5 text-azure-ink" strokeWidth={1.5} />
          </div>
          <p className="mt-4 text-[15px] font-semibold tracking-tight text-ink">
            まだイベントは記録されていません
          </p>
          <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-ink-muted">
            Keycloak管理コンソールの
            <span className="font-mono text-ink">
              {" "}
              Realm settings → Events → User events settings{" "}
            </span>
            で
            <span className="mx-1 font-medium text-ink">Save events</span>
            を有効にしてください。
          </p>
        </div>
      ) : (
        <div className="surface overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14 pl-5">#</TableHead>
                <TableHead>日時</TableHead>
                <TableHead>イベント</TableHead>
                <TableHead>ユーザー</TableHead>
                <TableHead>IP</TableHead>
                <TableHead className="pr-5">クライアント</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event, idx) => (
                <TableRow key={`${event.time}-${idx}`}>
                  <TableCell className="pl-5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-subtle">
                    {String(idx + 1).padStart(3, "0")}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-ink">
                    {formatTimestamp(event.time)}
                  </TableCell>
                  <TableCell>
                    <EventBadge type={event.type} />
                  </TableCell>
                  <TableCell>
                    {event.userId ? (
                      <div className="flex flex-col leading-tight">
                        <span className="text-[12px] text-ink">
                          {usernameById.get(event.userId) ?? "不明"}
                        </span>
                        <span className="font-mono text-[10px] text-ink-subtle">
                          {shortId(event.userId, 10)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-ink-subtle">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-ink-muted">
                    {event.ipAddress ?? "—"}
                  </TableCell>
                  <TableCell className="pr-5 font-mono text-[11px] text-ink-muted">
                    {event.clientId ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function EventBadge({ type }: { type: string }) {
  const upper = type.toUpperCase();
  if (upper.includes("ERROR") || upper.includes("FAIL")) {
    return <Badge variant="danger">{type}</Badge>;
  }
  if (upper === "LOGIN") {
    return <Badge variant="active">{type}</Badge>;
  }
  if (upper.includes("LOGOUT")) {
    return <Badge variant="clay">{type}</Badge>;
  }
  return <Badge>{type}</Badge>;
}
