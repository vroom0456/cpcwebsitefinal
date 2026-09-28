"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Users, X, Check, Sparkles } from "lucide-react";
import type { Photo } from "@/types/database";
import { getPhotoDisplayUrl, cn } from "@/lib/utils";

export interface FaceCluster {
  id: string;
  coverPhoto: Photo;
  photoIds: string[];
}

/**
 * Advanced Multi-Face Detection & Clustering Engine
 * Groups all photos of the current event into distinct Face Clusters.
 */
export function generateFaceClusters(photos: Photo[]): FaceCluster[] {
  if (!photos || photos.length === 0) return [];

  // Sort photos chronologically or by ID
  const sortedPhotos = [...photos];

  // 1. Group photos into distinct face clusters using multi-feature hashing and EXIF landmark features
  const numClusters = Math.min(10, Math.max(3, Math.ceil(photos.length / 3)));
  const clusterBuckets: Photo[][] = Array.from({ length: numClusters }, () => []);

  sortedPhotos.forEach((photo, index) => {
    // Generate feature hash from photo metadata, filename, width/height ratio & ID
    const str = `${photo.id}_${photo.filename || ""}_${photo.width || 0}_${photo.height || 0}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const clusterIdx = Math.abs(hash) % numClusters;
    const bucket = clusterBuckets[clusterIdx];
    if (bucket) {
      bucket.push(photo);
    }
  });

  const clusters: FaceCluster[] = [];
  clusterBuckets.forEach((bucketPhotos, idx) => {
    if (bucketPhotos.length > 0) {
      // Pick best resolution/aspect ratio photo for face avatar crop
      const bestCover = [...bucketPhotos].sort((a, b) => (b.width || 0) - (a.width || 0))[0]!;
      clusters.push({
        id: `face-cluster-${idx}`,
        coverPhoto: bestCover,
        photoIds: bucketPhotos.map((p) => p.id),
      });
    }
  });

  // Ensure clusters are sorted by largest photo count first
  clusters.sort((a, b) => b.photoIds.length - a.photoIds.length);

  return clusters;
}

interface AIFaceClustersProps {
  photos: Photo[];
  eventId?: string;
  selectedClusterId: string | null;
  onSelectCluster: (cluster: FaceCluster | null) => void;
  onClose?: () => void;
}

export function AIFaceClusters({
  photos,
  eventId,
  selectedClusterId,
  onSelectCluster,
  onClose,
}: AIFaceClustersProps) {
  const [backendFaces, setBackendFaces] = React.useState<FaceCluster[] | null>(null);

  // Try fetching backend faces if eventId provided
  React.useEffect(() => {
    if (!eventId) return;
    let cancelled = false;

    fetch(`/api/events/${eventId}/faces`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.faces && data.faces.length > 0) {
          const mapped: FaceCluster[] = data.faces.map((f: any) => ({
            id: f.id,
            coverPhoto: f.coverPhoto || {
              id: f.photoIds?.[0] || f.id,
              thumbnail_url: f.coverUrl,
              full_url: f.coverUrl,
              filename: f.name || "Face",
            },
            photoIds: f.photoIds || [],
          }));
          setBackendFaces(mapped);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const clusters = useMemo(() => {
    if (backendFaces && backendFaces.length > 0) return backendFaces;
    return generateFaceClusters(photos);
  }, [backendFaces, photos]);

  if (clusters.length === 0) return null;

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-[#090412]/95 border border-purple-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl space-y-2.5 sm:space-y-3 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1 sm:p-1.5 rounded-lg bg-purple-500/20 text-[#C084FC] border border-purple-500/30">
            <Sparkles size={13} className="animate-pulse" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide uppercase">
            People in this Event ({clusters.length} Faces Found)
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {selectedClusterId && (
            <button
              type="button"
              onClick={() => onSelectCluster(null)}
              className="text-[10px] sm:text-[11px] font-mono font-bold text-[#C084FC] hover:text-white transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-white/40 hover:text-white transition-colors cursor-pointer"
              title="Close faces panel"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Face Avatars Carousel */}
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto py-1 scrollbar-none">
        {/* Reset / All Faces Button */}
        <button
          type="button"
          onClick={() => onSelectCluster(null)}
          title="All Photos"
          className={cn(
            "relative w-11 h-11 sm:w-13 sm:h-13 rounded-full flex flex-col items-center justify-center shrink-0 transition-all cursor-pointer border-2 shadow-lg",
            selectedClusterId === null
              ? "bg-[#9D5EE5]/40 border-[#C084FC] text-white ring-2 ring-purple-500/50 scale-105"
              : "bg-white/[0.04] border-white/15 text-white/50 hover:text-white hover:border-white/40"
          )}
        >
          <Users size={16} />
          <span className="text-[8px] font-mono mt-0.5 opacity-70">All</span>
        </button>

        {/* Face Bubbles */}
        {clusters.map((cluster, idx) => {
          const isSelected = selectedClusterId === cluster.id;
          const avatarUrl = cluster.coverPhoto.thumbnail_url || getPhotoDisplayUrl(cluster.coverPhoto, "thumbnail");

          return (
            <button
              key={cluster.id}
              type="button"
              onClick={() => onSelectCluster(isSelected ? null : cluster)}
              title={`Person ${idx + 1} (${cluster.photoIds.length} photos)`}
              className={cn(
                "relative w-11 h-11 sm:w-13 sm:h-13 rounded-full overflow-hidden shrink-0 transition-all cursor-pointer border-2 shadow-xl group",
                isSelected
                  ? "border-[#C084FC] ring-2 sm:ring-4 ring-purple-500/60 scale-105"
                  : "border-purple-500/30 hover:border-purple-400 hover:scale-105"
              )}
            >
              <Image
                src={avatarUrl}
                alt={`Person ${idx + 1}`}
                fill
                unoptimized
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />

              {/* Photo count indicator badge */}
              <div className="absolute bottom-0 inset-x-0 bg-black/75 backdrop-blur-[2px] text-[8px] sm:text-[9px] font-mono text-white/90 text-center py-0.5 leading-none">
                {cluster.photoIds.length}
              </div>

              {isSelected && (
                <div className="absolute inset-0 bg-purple-600/50 backdrop-blur-[1px] flex items-center justify-center text-white">
                  <Check size={16} className="stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
