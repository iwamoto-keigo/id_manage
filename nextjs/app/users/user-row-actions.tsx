"use client";

import { useState, useTransition } from "react";
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
            toast.success(next ? "ユーザーを有効にしました" : "ユーザーを無効にしました");
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
          ロール
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <p className="eyebrow">対象: @{username}</p>
          <DialogTitle>ロール管理</DialogTitle>
          <DialogDescription>
            このユーザーのレルムロールを割り当て・解除します。
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-3">
          <p className="eyebrow">割り当て済み</p>
          {currentRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              まだロールが割り当てられていません
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {currentRoles.map((role) => (
                <li
                  key={role}
                  className="group flex items-center gap-2 border border-rule px-2 py-1"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink">
                    {role}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRevoke(role)}
                    disabled={pending}
                    className="text-[11px] text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
                  >
                    外す
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <p className="eyebrow">追加で割り当て</p>
          {assignable.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              追加できるロールはありません
            </p>
          ) : (
            <div className="flex items-end gap-4">
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
                size="sm"
              >
                割り当て
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
