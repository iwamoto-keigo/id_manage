"use client";

import { useState, useTransition } from "react";
import { Settings2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import {
  assignRoleAction,
  revokeRoleAction,
  toggleUserAction,
} from "./actions";

export function ToggleUserSwitch({
  userId,
  initial,
}: {
  userId: string;
  initial: boolean;
}) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={on}
      disabled={pending}
      onCheckedChange={(next) => {
        setOn(next);
        startTransition(async () => {
          const res = await toggleUserAction(userId);
          if (!res.ok) {
            setOn(!next);
            toast.error("切り替えに失敗しました", { description: res.error });
          } else {
            toast.success(
              next ? "ユーザーを有効にしました" : "ユーザーを無効にしました",
            );
          }
        });
      }}
      aria-label="ユーザーの有効/無効を切り替え"
    />
  );
}

export function RoleAssignDialog({
  userId,
  username,
  currentRoles,
  availableRoles,
}: {
  userId: string;
  username: string;
  currentRoles: string[];
  availableRoles: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const [pending, startTransition] = useTransition();

  const assignable = availableRoles.filter((r) => !currentRoles.includes(r));

  function handleAssign() {
    if (!selected) return;
    startTransition(async () => {
      const res = await assignRoleAction(userId, selected);
      if (res.ok) {
        toast.success(`ロール「${selected}」を割り当てました`);
        setSelected("");
      } else {
        toast.error("割り当てに失敗しました", { description: res.error });
      }
    });
  }

  function handleRevoke(role: string) {
    startTransition(async () => {
      const res = await revokeRoleAction(userId, role);
      if (res.ok) {
        toast.success(`ロール「${role}」を外しました`);
      } else {
        toast.error("解除に失敗しました", { description: res.error });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          ロール
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-subtle">
            Role management · @{username}
          </p>
          <DialogTitle>ロール管理</DialogTitle>
          <DialogDescription>
            このユーザーのレルムロールを割り当て・解除します。
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-2.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-subtle">
            割り当て済み
          </p>
          {currentRoles.length === 0 ? (
            <p className="rounded-md border border-dashed border-line bg-surface-soft px-3 py-3 text-[12px] text-ink-muted">
              まだロールが割り当てられていません
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {currentRoles.map((role) => (
                <li
                  key={role}
                  className="group inline-flex items-center gap-2 rounded-md border border-line bg-clay-soft px-2.5 py-1"
                >
                  <span className="text-[12px] font-medium text-clay-ink">
                    {role}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRevoke(role)}
                    disabled={pending}
                    className="grid h-4 w-4 place-items-center rounded text-clay-ink/60 transition-colors hover:bg-clay/15 hover:text-ember-ink disabled:opacity-40"
                    aria-label={`${role} を外す`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-2.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-subtle">
            追加で割り当て
          </p>
          {assignable.length === 0 ? (
            <p className="rounded-md border border-dashed border-line bg-surface-soft px-3 py-3 text-[12px] text-ink-muted">
              追加できるロールはありません
            </p>
          ) : (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Select value={selected} onValueChange={setSelected}>
                  <SelectTrigger>
                    <SelectValue placeholder="ロールを選択…" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignable.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAssign}
                disabled={!selected || pending}
                variant="primary"
                size="sm"
              >
                {pending ? "処理中…" : "割り当て"}
              </Button>
            </div>
          )}
        </section>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
