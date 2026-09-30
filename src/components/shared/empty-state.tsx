import { ImageOff } from "lucide-react";

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] py-16 px-4 text-center">
      <ImageOff className="mb-4 h-8 w-8 text-[#C084FC]/60" />
      <p className="font-display font-bold text-white tracking-wide uppercase text-sm">{title}</p>
      <p className="mt-1.5 text-xs text-white/50 max-w-sm">{description}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
