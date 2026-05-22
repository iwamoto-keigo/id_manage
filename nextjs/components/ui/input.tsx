import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink shadow-soft transition-colors placeholder:text-ink-subtle file:border-0 file:bg-transparent file:text-sm file:font-medium hover:border-line-strong focus-visible:border-clay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/20 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
