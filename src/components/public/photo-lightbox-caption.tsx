import { Camera } from "lucide-react";
import type { Photo } from "@/types/database";

export function PhotoLightboxCaption({ photo }: { photo: Photo }) {
  const hasCameraInfo = photo.camera_make || photo.camera_model || photo.lens;
  if (!hasCameraInfo) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-3 text-sm text-white/70">
      <Camera className="h-3.5 w-3.5" />
      <span>
        {[photo.camera_make, photo.camera_model].filter(Boolean).join(" ")}
        {photo.lens ? ` · ${photo.lens}` : ""}
      </span>
    </div>
  );
}
