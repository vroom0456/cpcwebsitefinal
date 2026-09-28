import { createClient } from "@/lib/supabase/server";
import { AdminFacesClient } from "@/components/admin/admin-faces-client";

export const dynamic = "force-dynamic";

export default async function AdminFacesPage() {
  const supabase = await createClient();

  // Try fetching faces to see if the table exists
  const { data: faces, error } = await supabase
    .from("faces")
    .select("*, photo_faces(count)")
    .order("created_at", { ascending: false });

  const tableExists = !error;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-display font-bold text-white">AI Faces Dashboard</h1>
        <p className="text-[#F8F5FB]/60 text-sm">
          Run local AI to index faces from your gallery, then name or hide them.
        </p>
      </div>

      {!tableExists ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-200">
          <h2 className="text-lg font-bold mb-2">Database Setup Required</h2>
          <p className="text-sm opacity-80 mb-4">
            The AI Faces tables do not exist in your Supabase database yet. Please run the provided `supabase_ai_faces.sql` script in your Supabase SQL Editor.
          </p>
        </div>
      ) : (
        <AdminFacesClient initialFaces={faces || []} />
      )}
    </div>
  );
}
