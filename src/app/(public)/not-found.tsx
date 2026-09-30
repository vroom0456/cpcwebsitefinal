import Link from "next/link";
import { ArrowLeft, Camera } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 flex min-h-[65vh] flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[#C084FC] flex items-center justify-center mb-4">
        <Camera size={24} />
      </div>
      <p className="font-mono text-xs tracking-widest text-[#C084FC] uppercase font-bold">404 · OUT OF FRAME</p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-bold font-display text-white">This frame wandered out of focus</h1>
      <p className="mt-2 max-w-sm text-sm text-white/50 leading-relaxed">
        The event or photo story you are looking for has either been moved or hasn&apos;t been published yet.
      </p>
      <Link
        href="/events"
        className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-[#E8D1FF] transition-all"
      >
        <ArrowLeft size={13} />
        <span>Return to Archive</span>
      </Link>
    </div>
  );
}
