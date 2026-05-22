import { AlertCircle, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listRoles, listUserRoles, listUsers } from "@/lib/api";
import type { User } from "@/lib/types";
import { shortId } from "@/lib/utils";

import { CreateUserDialog } from "./create-user-dialog";
import { RoleAssignDialog, ToggleUserSwitch } from "./user-row-actions";

export const dynamic = "force-dynamic";

async function getUsersWithRoles(): Promise<{
  users: (User & { roles: string[] })[];
  realmRoles: string[];
  error: string | null;
}> {
  try {
    const [users, rolesRes] = await Promise.all([
      listUsers({ max: 200 }),
      listRoles(),
    ]);

    const userRoleLists = await Promise.all(
      users.map((u) =>
        listUserRoles(u.id)
          .then((rs) => rs.map((r) => r.name))
          .catch(() => [] as string[]),
      ),
    );

    const enriched = users.map((u, i) => ({ ...u, roles: userRoleLists[i] }));

    const realmRoleNames = rolesRes
      .filter((r) => !r.name.startsWith("default-") && !r.name.includes("offline_"))
      .map((r) => r.name);

    return { users: enriched, realmRoles: realmRoleNames, error: null };
  } catch (err) {
    return {
      users: [],
      realmRoles: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function initials(user: User): string {
  const a = (user.firstName ?? "").trim();
  const b = (user.lastName ?? "").trim();
  if (a || b) {
    return `${b.slice(0, 1)}${a.slice(0, 1)}`.toUpperCase() || user.username.slice(0, 2).toUpperCase();
  }
  return user.username.slice(0, 2).toUpperCase();
}

export default async function UsersPage() {
  const { users, realmRoles, error } = await getUsersWithRoles();
  const enabledCount = users.filter((u) => u.enabled).length;

  return (
    <div className="animate-fade-up space-y-8">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-end justify-between gap-6">
          <div className="space-y-1.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-subtle">
              Identity · Users
            </p>
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-ink">
              ユーザー管理
            </h1>
            <p className="max-w-2xl text-[13px] leading-relaxed text-ink-muted">
              レルムに登録されているユーザーの一覧です。トグルで有効/無効を切り替え、ロール管理から権限を割り当てます。
            </p>
          </div>
          <CreateUserDialog />
        </div>

        {/* meta row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant="muted">
            合計 <span className="ml-1 text-ink">{users.length}</span>
          </Badge>
          <Badge variant="active">
            有効 <span className="ml-1">{enabledCount}</span>
          </Badge>
          <Badge variant="muted">
            無効 <span className="ml-1">{users.length - enabledCount}</span>
          </Badge>
        </div>
      </header>

      {/* Toolbar — placeholder search (visual, not wired) */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
            strokeWidth={1.75}
          />
          <Input
            type="search"
            placeholder="ユーザー名・メールで絞り込み（UI用）"
            className="pl-9"
            disabled
          />
        </div>
      </div>

      {error ? (
        <div className="surface flex items-start gap-3 border-ember/40 bg-ember-soft p-5">
          <AlertCircle className="mt-0.5 h-4 w-4 text-ember-ink" />
          <div className="space-y-1">
            <p className="text-[13px] font-medium text-ember-ink">
              ユーザー情報を取得できません
            </p>
            <p className="font-mono text-[11px] text-ember-ink/80">{error}</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="surface flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-clay-soft">
            <Search className="h-5 w-5 text-clay-ink" strokeWidth={1.5} />
          </div>
          <p className="mt-4 text-[15px] font-semibold tracking-tight text-ink">
            ユーザーが登録されていません
          </p>
          <p className="mt-1 text-[12px] text-ink-muted">
            右上の「新規ユーザー」から最初のユーザーを作成してください。
          </p>
        </div>
      ) : (
        <div className="surface overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 pl-5">#</TableHead>
                <TableHead>名前</TableHead>
                <TableHead>メール</TableHead>
                <TableHead>ロール</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="pr-5 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, idx) => {
                const displayName =
                  user.firstName || user.lastName
                    ? `${user.lastName ?? ""} ${user.firstName ?? ""}`.trim()
                    : user.username;
                return (
                  <TableRow key={user.id}>
                    <TableCell className="pl-5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-subtle">
                      {String(idx + 1).padStart(3, "0")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid h-8 w-8 place-items-center rounded-full text-[11px] font-medium ${
                            user.enabled
                              ? "bg-clay-soft text-clay-ink"
                              : "bg-line/60 text-ink-subtle"
                          }`}
                        >
                          {initials(user)}
                        </span>
                        <div className="flex flex-col leading-tight">
                          <span className="text-[13px] font-medium text-ink">
                            {displayName}
                          </span>
                          <span className="font-mono text-[11px] text-ink-subtle">
                            @{user.username}
                            <span className="ml-2 opacity-60">
                              {shortId(user.id, 8)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-ink">
                          {user.email ?? "—"}
                        </span>
                        {user.emailVerified && (
                          <Badge variant="active" className="px-1.5 py-0 text-[10px]">
                            verified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.roles.length === 0 ? (
                        <span className="text-[12px] text-ink-subtle">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {user.roles.map((r) => (
                            <Badge key={r} variant="clay">
                              {r}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.enabled ? (
                        <Badge variant="active">有効</Badge>
                      ) : (
                        <Badge variant="muted">無効</Badge>
                      )}
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <ToggleUserSwitch
                          userId={user.id}
                          initial={user.enabled}
                        />
                        <RoleAssignDialog
                          userId={user.id}
                          username={user.username}
                          currentRoles={user.roles}
                          availableRoles={realmRoles}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
