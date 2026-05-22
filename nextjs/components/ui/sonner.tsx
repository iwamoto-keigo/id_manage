"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        style: {
          background: "hsl(var(--surface))",
          color: "hsl(var(--ink))",
          border: "1px solid hsl(var(--line))",
          borderRadius: "10px",
          boxShadow:
            "0 1px 2px hsl(var(--ink) / 0.04), 0 12px 32px -12px hsl(var(--ink) / 0.18)",
          fontFamily: "var(--font-body), sans-serif",
          fontSize: "13px",
          padding: "12px 14px",
        },
      }}
      {...props}
    />
  );
}
