import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-tight transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-line bg-surface-soft text-ink-muted",
        active:
          "border-grove/30 bg-grove-soft text-grove-ink",
        muted:
          "border-line bg-surface-soft text-ink-subtle",
        danger:
          "border-ember/30 bg-ember-soft text-ember-ink",
        clay:
          "border-clay/30 bg-clay-soft text-clay-ink",
        info:
          "border-azure/30 bg-azure-soft text-azure-ink",
        outline:
          "border-line bg-transparent text-ink-muted",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
