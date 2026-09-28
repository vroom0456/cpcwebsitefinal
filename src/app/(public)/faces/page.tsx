import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { UserCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PublicFacesPage() {
  const supabase = await createClient();

  const { data: faces } = await supabase
    .from("faces")
    .select("*, photo_faces(count)")
    .eq("is_hidden", false)
    .not("name", "is", null)
    .order("name", { ascending: true });

  return (
    <div className="relative w-full min-h-screen pt-32 pb-24 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">People</h1>
        <p className="text-[#F8F5FB]/60 max-w-2xl">
          Browse the gallery by familiar faces. These faces have been automatically identified across our events.
        </p>
      </div>

      {!faces || faces.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
          <UserCircle size={48} className="mx-auto mb-4 text-white/20" />
          <p className="text-white/50">No named faces available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
          {faces.map((face: any) => (
            <Link key={face.id} href={`/faces/${face.id}`} className="group flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-white/5 border border-white/10 transition-transform duration-300 group-hover:scale-105 group-hover:border-[#9D5EE5]/50 group-hover:shadow-[0_0_30px_rgba(157,94,229,0.3)]">
                {face.cover_face_url ? (
                  <Image src={face.cover_face_url} alt={face.name || "Face"} fill className="object-cover" unoptimized />
                ) : (
                  <UserCircle className="w-full h-full text-white/20 p-6" />
                )}
              </div>
              <div className="text-center">
                <h3 className="text-white font-semibold text-sm md:text-base group-hover:text-[#C084FC] transition-colors">{face.name}</h3>
                <p className="text-[11px] text-white/40 uppercase tracking-wider mt-1">{face.photo_faces?.[0]?.count || 0} Photos</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
