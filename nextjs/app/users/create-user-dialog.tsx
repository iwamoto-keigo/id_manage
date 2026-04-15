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
        <Button>
          <Plus className="h-3.5 w-3.5" />
          新規ユーザー
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <p className="eyebrow">新規登録</p>
          <DialogTitle>ユーザーを登録</DialogTitle>
          <DialogDescription>
            Keycloakにユーザーを登録します。パスワードはKeycloak側でハッシュ化されて保存されます。
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="ユーザー名" name="username" required autoComplete="off" />
            <Field label="メール" name="email" type="email" required autoComplete="off" />
            <Field label="姓" name="last_name" autoComplete="off" />
            <Field label="名" name="first_name" autoComplete="off" />
          </div>
          <Field
            label="初期パスワード"
            name="password"
            type="password"
            required
            autoComplete="new-password"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "登録中…" : "登録"}
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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {required && <span className="ml-1 text-sienna">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
}
