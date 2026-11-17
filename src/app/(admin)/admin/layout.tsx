import { AdminNavbar } from "@/components/admin/admin-navbar";
import { AdminFooter } from "@/components/admin/admin-footer";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col text-[#F8F5FB] relative w-full overflow-x-hidden bg-[#07040C]">
      {/* ── Subtle Background Grid & Grain ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.14]"
        style={{
          backgroundImage: "radial-gradient(rgba(157, 94, 229, 0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "160px 160px",
        }}
      />

      {/* ── Fixed Admin Header Navbar ── */}
      <AdminNavbar />

      {/* ── Main Centered Content Container ── */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 lg:px-12 pt-20 pb-16 relative z-10">
        {children}
      </main>

      {/* ── System Admin Footer ── */}
      <AdminFooter />
    </div>
  );
}
