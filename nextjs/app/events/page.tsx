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

  return (
    <div className="animate-fade-up space-y-12">
      <header className="space-y-4">
        <p className="eyebrow">ログイン履歴</p>
        <div className="flex items-end justify-between gap-6">
          <h1 className="font-display text-4xl leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl">
            認証イベント
          </h1>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            全 {events.length.toString().padStart(3, "0")} 件
          </span>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          新しい順に並んでいます。取得できる件数と保存有無はKeycloakレルムのイベント設定に依存します。
        </p>
        <div className="rule-hr animate-rule-grow" />
      </header>

      {error ? (
        <div className="border border-destructive/40 bg-destructive/5 p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-destructive">
            イベントを取得できません
          </p>
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">{error}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="border border-dashed border-rule bg-card/40 px-6 py-24 text-center">
          <p className="font-display text-2xl text-muted-foreground">
            まだイベントは記録されていません
          </p>
          <p className="mt-3 max-w-md mx-auto text-[12px] leading-relaxed text-muted-foreground">
            Keycloak管理コンソールの「Realm settings → Events → User events settings」で
            <span className="mx-1 font-medium text-ink">Save events</span>
            を有効にしてください。
          </p>
        </div>
      ) : (
        <div className="border border-rule bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 pl-6">#</TableHead>
                <TableHead>日時</TableHead>
                <TableHead>イベント</TableHead>
                <TableHead>ユーザー</TableHead>
                <TableHead>IP</TableHead>
                <TableHead className="pr-6">クライアント</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event, idx) => (
                <TableRow key={`${event.time}-${idx}`}>
                  <TableCell className="pl-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
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
                      <div className="flex flex-col">
                        <span className="text-sm text-ink">
                          {usernameById.get(event.userId) ?? "不明"}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {shortId(event.userId, 10)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {event.ipAddress ?? "—"}
                  </TableCell>
                  <TableCell className="pr-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
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
    return <Badge variant="sienna">{type}</Badge>;
  }
  return <Badge>{type}</Badge>;
}
