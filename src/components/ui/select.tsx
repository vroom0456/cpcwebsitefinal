import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-white/10 bg-[#0E071A] px-3.5 text-xs sm:text-sm text-white transition-all duration-150 focus-visible:outline-none focus-visible:border-[#C084FC]/60 focus-visible:ring-2 focus-visible:ring-[#C084FC]/20 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
