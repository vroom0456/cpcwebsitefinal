import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C084FC]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050208] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-white hover:bg-neutral-100 text-black font-bold shadow-sm border border-white/80 active:bg-neutral-200",
        primary:
          "bg-[#7032B5] hover:bg-[#8338D2] text-white font-semibold shadow-sm border border-purple-400/30 active:scale-[0.98]",
        secondary:
          "bg-white/10 text-white hover:bg-white/15 border border-white/15 shadow-sm active:bg-white/20",
        outline:
          "border border-white/20 bg-white/[0.03] text-white/90 hover:text-white hover:bg-white/10 hover:border-white/30 shadow-sm",
        ghost:
          "text-white/70 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.12]",
        destructive:
          "bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 hover:text-red-200 hover:border-red-500/50 active:bg-red-500/35",
        subtle:
          "bg-purple-500/10 text-[#C084FC] border border-purple-500/25 hover:bg-purple-500/20 hover:text-white hover:border-purple-400/40 active:bg-purple-500/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-[11px] rounded-lg",
        lg: "h-11 px-6 text-sm font-bold rounded-xl",
        icon: "h-9 w-9 rounded-lg p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
