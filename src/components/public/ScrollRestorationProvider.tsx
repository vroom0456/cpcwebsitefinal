"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Saves the current scroll position for each path visited.
 * When navigating back to the events page from a gallery, it restores exactly.
 */
export function ScrollRestorationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Save scroll before leaving
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem(`scroll:${pathname}`, String(window.scrollY));
    };

    // Save when navigating away (link click or browser nav)
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      // Also save on component unmount (React navigation)
      sessionStorage.setItem(`scroll:${pathname}`, String(window.scrollY));
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname]);

  // Restore scroll when pathname changes
  useEffect(() => {
    const hasTarget = sessionStorage.getItem("timeline-back-target") || sessionStorage.getItem("events-back-target");
    if (hasTarget) {
      return; // Yield to element-specific scroll handlers
    }
    const saved = sessionStorage.getItem(`scroll:${pathname}`);
    if (saved) {
      const y = Number(saved);
      // Use requestAnimationFrame to ensure the page has rendered before scrolling
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, behavior: "instant" });
        });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname]);

  return <>{children}</>;
}
