"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        style: {
          background: "hsl(var(--card))",
          color: "hsl(var(--ink))",
          border: "1px solid hsl(var(--rule))",
          borderRadius: "0",
          fontFamily: "var(--font-body), sans-serif",
          fontSize: "13px",
        },
      }}
      {...props}
    />
  );
}
