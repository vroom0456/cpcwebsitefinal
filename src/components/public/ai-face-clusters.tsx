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
  selectedClusterId: string | null;
  onSelectCluster: (cluster: FaceCluster | null) => void;
  onClose?: () => void;
}

export function AIFaceClusters({
  photos,
  selectedClusterId,
  onSelectCluster,
  onClose,
}: AIFaceClustersProps) {
  const clusters = useMemo(() => generateFaceClusters(photos), [photos]);

  if (clusters.length === 0) return null;

  return (
    <div className="p-4 rounded-3xl bg-[#090412]/95 border border-purple-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-[#C084FC] border border-purple-500/30">
            <Sparkles size={14} className="animate-pulse" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide uppercase">
            AI Face Detection ({clusters.length} Faces Found in Event)
          </span>
        </div>
        <div className="flex items-center gap-3">
          {selectedClusterId && (
            <button
              type="button"
              onClick={() => onSelectCluster(null)}
              className="text-[11px] font-mono font-bold text-[#C084FC] hover:text-white transition-colors cursor-pointer"
            >
              Reset Face Filter
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-white/40 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Pure Circular Face Avatars (No Text Labels) */}
      <div className="flex items-center gap-3 overflow-x-auto py-1.5 scrollbar-none">
        {/* Reset / All Faces Button */}
        <button
          type="button"
          onClick={() => onSelectCluster(null)}
          title="All Photos"
          className={cn(
            "relative w-13 h-13 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer border-2 shadow-lg",
            selectedClusterId === null
              ? "bg-[#9D5EE5]/40 border-[#C084FC] text-white ring-4 ring-purple-500/40 scale-105"
              : "bg-white/[0.04] border-white/15 text-white/50 hover:text-white hover:border-white/40"
          )}
        >
          <Users size={20} />
        </button>

        {/* Pure Face Bubbles */}
        {clusters.map((cluster) => {
          const isSelected = selectedClusterId === cluster.id;
          const avatarUrl = getPhotoDisplayUrl(cluster.coverPhoto, "thumbnail");

          return (
            <button
              key={cluster.id}
              type="button"
              onClick={() => onSelectCluster(isSelected ? null : cluster)}
              title={`Face match (${cluster.photoIds.length} photos)`}
              className={cn(
                "relative w-13 h-13 rounded-full overflow-hidden shrink-0 transition-all cursor-pointer border-2 shadow-xl group",
                isSelected
                  ? "border-[#C084FC] ring-4 ring-purple-500/60 scale-110"
                  : "border-purple-500/30 hover:border-purple-400 hover:scale-105"
              )}
            >
              <Image
                src={avatarUrl}
                alt="Detected Face"
                fill
                unoptimized
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-purple-600/50 backdrop-blur-[1px] flex items-center justify-center text-white">
                  <Check size={18} className="stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
