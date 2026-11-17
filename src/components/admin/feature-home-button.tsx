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
          ? "bg-white text-black border border-white shadow-md font-bold"
          : "bg-white/[0.06] border border-white/20 text-white hover:text-black hover:bg-white"
      }`}
      title={isFeatured ? "Currently featured on Home Page" : "Click to feature this event on Home Page"}
    >
      {isFeatured ? (
        <>
          <Flame size={13} className="text-amber-500 fill-amber-500 animate-pulse" />
          <span>Featured on Home Page</span>
        </>
      ) : (
        <>
          <Sparkles size={13} className="text-white/70" />
          <span>{loading ? "Updating..." : "Add to Home Page"}</span>
        </>
      )}
    </button>
  );
}
