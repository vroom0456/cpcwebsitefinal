import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-xs sm:text-sm text-white placeholder:text-white/30 transition-all duration-150 focus-visible:outline-none focus-visible:border-[#C084FC]/60 focus-visible:ring-2 focus-visible:ring-[#C084FC]/20 focus-visible:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
