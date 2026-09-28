export function StatCard({ label, value, sublabel }: { label: string; value: string | number; sublabel?: string }) {
  return (
    <div className="rounded-2xl glass-card glass-hover p-6 shadow-xl relative overflow-hidden group border border-purple-500/20">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 30% 0%, rgba(157,94,229,0.12) 0%, transparent 70%)",
        }}
      />
      <p className="text-xs font-bold uppercase tracking-widest text-[#9D5EE5]/80 relative z-10">{label}</p>
      <p className="mt-2 text-3xl font-bold font-display text-white group-hover:text-gradient-purple transition-colors relative z-10">{value}</p>
      {sublabel && <p className="mt-1.5 text-xs text-white/40 relative z-10 font-sans">{sublabel}</p>}
    </div>
  );
}
