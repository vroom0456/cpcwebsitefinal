"use client";

import { useState } from "react";
import { Folder, FolderOpen, ChevronRight, Grid, LayoutGrid, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Event } from "@/types/database";
import { EventCard } from "@/components/public/event-card";

interface EventsFolderBrowserProps {
  events: Event[];
}

export function EventsFolderBrowser({ events }: EventsFolderBrowserProps) {
  // Path state: e.g. [] (root), [year], [year, category]
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  // Unique Academic Years
  const academicYears = Array.from(
    new Set(events.map((e) => e.academic_year || "General"))
  ).sort((a, b) => {
    if (a === "General") return 1;
    if (b === "General") return -1;
    return b.localeCompare(a); // Descending order
  });

  // Unique Categories for a selected Year
  const getCategoriesForYear = (year: string) => {
    const yearEvents = events.filter(
      (e) => (e.academic_year || "General") === year
    );
    return Array.from(
      new Set(yearEvents.map((e) => e.category || "General"))
    ).sort();
  };

  // Events for selected Year and Category
  const getEventsForCategory = (year: string, category: string) => {
    return events.filter(
      (e) =>
        (e.academic_year || "General") === year &&
        (e.category || "General") === category
    );
  };

  // Counts of events under a year
  const getEventCountForYear = (year: string) => {
    return events.filter((e) => (e.academic_year || "General") === year).length;
  };

  // Counts of events under a year + category
  const getEventCountForCategory = (year: string, category: string) => {
    return events.filter(
      (e) =>
        (e.academic_year || "General") === year &&
        (e.category || "General") === category
    ).length;
  };

  const isRoot = currentPath.length === 0;
  const isYearLevel = currentPath.length === 1;
  const isCategoryLevel = currentPath.length === 2;

  const currentYear = currentPath[0] || "";
  const currentCategory = currentPath[1] || "";

  return (
    <div className="mt-8 space-y-6">
      {/* Folder Breadcrumbs */}
      <div className="flex items-center gap-2 flex-wrap rounded-2xl glass px-4 py-3 text-xs border border-purple-500/20 shadow-xl">
        <button
          onClick={() => setCurrentPath([])}
          className="flex items-center gap-1.5 font-bold hover:text-white transition-colors text-purple-300"
        >
          <Folder className="h-4 w-4 text-[#9D5EE5]" />
          Archive Root
        </button>

        {currentPath.map((segment, index) => {
          const isLast = index === currentPath.length - 1;
          const targetPath = currentPath.slice(0, index + 1);

          return (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="h-3.5 w-3.5 text-white/30" />
              <button
                disabled={isLast}
                onClick={() => setCurrentPath(targetPath)}
                className={`font-semibold hover:text-white transition-colors ${
                  isLast ? "text-white cursor-default font-bold" : "text-white/50"
                }`}
              >
                {segment}
              </button>
            </div>
          );
        })}
      </div>

      {/* Directory Contents */}
      <div className="min-h-[250px]">
        <AnimatePresence mode="wait">
          {/* Root Level: Academic Years */}
          {isRoot && (
            <motion.div
              key="root"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
            >
              {academicYears.map((year) => {
                const count = getEventCountForYear(year);
                return (
                  <button
                    key={year}
                    onClick={() => setCurrentPath([year])}
                    className="group flex items-center gap-4 rounded-2xl glass-card glass-hover p-6 text-left border border-purple-500/20 shadow-xl cursor-pointer"
                  >
                    <div className="rounded-xl glass-purple p-3 text-[#C084FC] group-hover:scale-110 transition-transform shrink-0">
                      <Folder className="h-6 w-6 fill-[#9D5EE5]/30" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white group-hover:text-[#C084FC] transition-colors">
                        {year}
                      </h4>
                      <p className="text-xs text-white/40 mt-0.5 font-sans">
                        {count} {count === 1 ? "gallery" : "galleries"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* Year Level: Categories */}
          {isYearLevel && (
            <motion.div
              key={currentYear}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
            >
              {getCategoriesForYear(currentYear).map((cat) => {
                const count = getEventCountForCategory(currentYear, cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setCurrentPath([currentYear, cat])}
                    className="group flex items-center gap-4 rounded-2xl glass-card glass-hover p-6 text-left border border-purple-500/20 shadow-xl cursor-pointer"
                  >
                    <div className="rounded-xl glass-purple p-3 text-[#C084FC] group-hover:scale-110 transition-transform shrink-0">
                      <FolderOpen className="h-6 w-6 fill-[#9D5EE5]/30" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white group-hover:text-[#C084FC] transition-colors">
                        {cat}
                      </h4>
                      <p className="text-xs text-white/40 mt-0.5 font-sans">
                        {count} {count === 1 ? "gallery" : "galleries"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* Category Level: Events */}
          {isCategoryLevel && (
            <motion.div
              key={`${currentYear}-${currentCategory}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {getEventsForCategory(currentYear, currentCategory).map((event, i) => (
                <EventCard key={event.id} event={event} priority={i < 3} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
