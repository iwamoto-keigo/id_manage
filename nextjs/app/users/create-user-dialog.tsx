"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createUserAction } from "./actions";

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createUserAction(formData);
      if (result.ok) {
        toast.success("ユーザーを登録しました");
        setOpen(false);
      } else {
        toast.error("登録に失敗しました", { description: result.error });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary">
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          新規ユーザー
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-subtle">
            Create user
          </p>
          <DialogTitle>ユーザーを登録</DialogTitle>
          <DialogDescription>
            Keycloakにユーザーを登録します。パスワードはハッシュ化されて保存されます。
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="ユーザー名"
              name="username"
              required
              autoComplete="off"
              placeholder="alice"
            />
            <Field
              label="メール"
              name="email"
              type="email"
              required
              autoComplete="off"
              placeholder="alice@example.com"
            />
            <Field label="姓" name="last_name" autoComplete="off" placeholder="山田" />
            <Field label="名" name="first_name" autoComplete="off" placeholder="花子" />
          </div>
          <Field
            label="初期パスワード"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
          />
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              キャンセル
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "登録中…" : "登録する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {required && <span className="ml-1 text-clay">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
      />
    </div>
  );
}
