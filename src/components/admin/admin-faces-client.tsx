"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { EyeOff, Eye, Save, UserCircle } from "lucide-react";
import Image from "next/image";

const AdminFaceIndexer = dynamic(
  () => import("@/components/admin/admin-face-indexer").then((m) => m.AdminFaceIndexer),
  { ssr: false }
);

export function AdminFacesClient({ initialFaces }: { initialFaces: any[] }) {
  const [faces, setFaces] = useState(initialFaces);
  const supabase = createClient();

  const handleUpdate = async (id: string, updates: any) => {
    // Optimistic update
    setFaces(faces.map(f => f.id === id ? { ...f, ...updates } : f));
    
    await supabase.from("faces").update(updates).eq("id", id);
  };

  if (faces.length === 0) {
    return (
      <div className="space-y-8">
        <AdminFaceIndexer />
        <div className="bg-[#10081C] border border-white/10 rounded-2xl p-8 text-center text-white/50">
          <UserCircle size={48} className="mx-auto mb-4 opacity-20" />
          <p>No faces indexed yet.</p>
          <p className="text-xs mt-2">Run the indexer above to start finding faces in your gallery.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminFaceIndexer />
      <div className="bg-[#10081C] border border-white/10 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-6">Indexed Faces ({faces.length})</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {faces.map((face) => (
          <div key={face.id} className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-4">
            <div className="relative w-24 h-24 rounded-full bg-white/5 overflow-hidden flex-shrink-0">
              {face.cover_face_url ? (
                <Image src={face.cover_face_url} alt="Face" fill className="object-cover" unoptimized />
              ) : (
                <UserCircle className="w-full h-full text-white/20 p-4" />
              )}
            </div>
            
            <div className="w-full space-y-3">
              <input
                type="text"
                placeholder="Name this person..."
                defaultValue={face.name || ""}
                onBlur={(e) => handleUpdate(face.id, { name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 text-center focus:outline-none focus:border-[#9D5EE5]"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">
                  {face.photo_faces?.[0]?.count || 0} photos
                </span>
                
                <button
                  onClick={() => handleUpdate(face.id, { is_hidden: !face.is_hidden })}
                  className={`p-1.5 rounded-lg transition-colors ${face.is_hidden ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                  title={face.is_hidden ? "Hidden from public" : "Visible to public"}
                >
                  {face.is_hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
}
