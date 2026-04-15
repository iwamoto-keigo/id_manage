import { Badge } from "@/components/ui/badge";
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

export default async function UsersPage() {
  const { users, realmRoles, error } = await getUsersWithRoles();

  return (
    <div className="animate-fade-up space-y-12">
      <header className="space-y-4">
        <p className="eyebrow">ユーザー管理</p>
        <div className="flex items-end justify-between gap-6">
          <h1 className="font-display text-4xl leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl">
            ユーザー一覧
          </h1>
          <CreateUserDialog />
        </div>
        <div className="flex items-center justify-between gap-6 pt-2">
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            レルムに登録されているユーザーの一覧です。トグルで有効/無効を切り替え、ロールボタンから割り当てを管理できます。
          </p>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            全 {users.length.toString().padStart(3, "0")} 件
          </span>
        </div>
        <div className="rule-hr animate-rule-grow" />
      </header>

      {error ? (
        <div className="border border-destructive/40 bg-destructive/5 p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-destructive">
            ユーザー情報を取得できません
          </p>
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="border border-dashed border-rule bg-card/40 px-6 py-20 text-center">
          <p className="font-display text-2xl text-muted-foreground">
            ユーザーが登録されていません
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            「新規ユーザー」から最初のユーザーを作成してください
          </p>
        </div>
      ) : (
        <div className="border border-rule bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 pl-6">#</TableHead>
                <TableHead>名前</TableHead>
                <TableHead>メール</TableHead>
                <TableHead>ロール</TableHead>
                <TableHead>ID</TableHead>
                <TableHead className="text-right pr-6">ステータス / 操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, idx) => (
                <TableRow key={user.id}>
                  <TableCell className="pl-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {String(idx + 1).padStart(3, "0")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-display text-base text-ink">
                        {user.firstName || user.lastName
                          ? `${user.lastName ?? ""} ${user.firstName ?? ""}`.trim()
                          : user.username}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        @{user.username}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-ink">
                        {user.email ?? "—"}
                      </span>
                      {user.emailVerified && (
                        <Badge variant="active" className="px-1 py-0 text-[9px]">
                          ✓
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.roles.length === 0 ? (
                      <span className="text-sm text-muted-foreground">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles.map((r) => (
                          <Badge key={r} variant="muted">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {shortId(user.id, 10)}
                    </span>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-4">
                      {user.enabled ? (
                        <Badge variant="active">有効</Badge>
                      ) : (
                        <Badge variant="muted">無効</Badge>
                      )}
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
