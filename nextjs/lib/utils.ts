import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(ms: number | undefined | null): string {
  if (!ms) return "—";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(ms));
}

export function shortId(id: string | undefined | null, head = 8): string {
  if (!id) return "—";
  return id.length <= head + 2 ? id : `${id.slice(0, head)}…`;
}
