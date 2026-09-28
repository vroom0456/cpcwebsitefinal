import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[#9D5EE5]/90 hover:bg-[#9D5EE5] text-white shadow-lg shadow-purple-500/25 backdrop-blur-md border border-purple-400/30 hover:shadow-purple-500/40",
        outline: "border border-purple-500/30 bg-[#0c0516]/60 backdrop-blur-md text-foreground hover:bg-purple-500/20 hover:border-purple-500/50 shadow-md shadow-purple-500/5",
        ghost: "bg-white/[0.03] backdrop-blur-md border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 hover:border-white/20",
        subtle: "bg-purple-950/40 text-purple-200 border border-purple-500/20 backdrop-blur-md hover:bg-purple-900/50 hover:border-purple-500/40",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8.5 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
);
Button.displayName = "Button";
