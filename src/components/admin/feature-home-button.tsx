"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check, Flame } from "lucide-react";

interface FeatureHomeButtonProps {
  eventId: string;
  isFeaturedInitial: boolean;
}

export function FeatureHomeButton({ eventId, isFeaturedInitial }: FeatureHomeButtonProps) {
  const router = useRouter();
  const [isFeatured, setIsFeatured] = useState(isFeaturedInitial);
  const [loading, setLoading] = useState(false);

  const toggleFeature = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/feature`, {
        method: isFeatured ? "DELETE" : "POST",
      });
      if (res.ok) {
        const json = await res.json();
        setIsFeatured(json.isFeatured);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to toggle featured status:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFeature}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
        isFeatured
          ? "bg-purple-600/40 border border-purple-400 text-white shadow-[0_0_20px_rgba(157,94,229,0.4)]"
          : "bg-white/[0.05] border border-white/20 text-white/80 hover:text-white hover:bg-purple-500/20 hover:border-purple-500/40"
      }`}
      title={isFeatured ? "Currently featured on Home Page" : "Click to feature this event on Home Page"}
    >
      {isFeatured ? (
        <>
          <Flame size={13} className="text-amber-400 fill-amber-400 animate-pulse" />
          <span>Featured on Home Page</span>
        </>
      ) : (
        <>
          <Sparkles size={13} className="text-[#C084FC]" />
          <span>{loading ? "Updating..." : "Add to Home Page"}</span>
        </>
      )}
    </button>
  );
}
