"use client";

import React, { useState } from "react";
import { Crop } from "lucide-react";
import { useRouter } from "next/navigation";
import { CoverCropperModal } from "@/components/admin/cover-cropper-modal";

interface AdminCoverCropTriggerProps {
  eventId: string;
  coverPhotoUrl?: string | null;
}

export function AdminCoverCropTrigger({ eventId, coverPhotoUrl }: AdminCoverCropTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  if (!coverPhotoUrl) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        title="Crop & Re-align Cover Photo"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-white text-white/90 hover:text-black backdrop-blur-md border border-white/20 hover:border-white/80 text-xs font-mono font-medium shadow-xl transition-all"
      >
        <Crop size={13} className="text-white/70 group-hover:text-black" />
        <span>Crop Cover</span>
      </button>

      {isOpen && (
        <CoverCropperModal
          isOpen={isOpen}
          eventId={eventId}
          photoUrl={coverPhotoUrl}
          onClose={() => setIsOpen(false)}
          onSaveSuccess={() => {
            setIsOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
