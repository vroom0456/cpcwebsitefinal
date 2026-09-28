export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import { getPortfolioEvent } from "@/lib/services/events.service";
import { getPhotosForEvent } from "@/lib/services/photos.service";
import { PortfolioClient } from "@/components/public/portfolio-client";
import type { Photo } from "@/types/database";

export const metadata: Metadata = {
  title: "Club Portfolio",
  description: "Explore the visual masterpieces and selected works captured by the CBIT Photo Club.",
};

export default async function PortfolioPage() {
  const event = await getPortfolioEvent();
  let photos: Photo[] = [];
  if (event) {
    photos = await getPhotosForEvent(event.id);
  }

  return (
    <div className="min-h-screen bg-transparent text-[#F8F5FB] pt-24 pb-20 relative">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16 space-y-12">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <p className="text-[11px] font-bold tracking-[0.45em] uppercase text-cpcLight/80">
            Selected Works
          </p>
          <h1 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.03em] font-display bg-gradient-to-r from-white via-white/90 to-white/40 bg-clip-text text-transparent">
            Our Portfolio
          </h1>
          <p className="text-sm sm:text-base text-white/50 leading-relaxed font-light">
            A curated showcase of our best captures, representing technical excellence, storytelling, and visual artistry.
          </p>
        </div>

        {/* Gallery Content */}
        <div className="pt-6">
          <PortfolioClient databasePhotos={photos} />
        </div>
      </div>
    </div>
  );
}
