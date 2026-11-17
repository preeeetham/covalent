"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

let lenis: Lenis | null = null;

/**
 * Fluid, inertial scrolling for mouse wheels (Lenis). Touch scrolling stays native
 * (phones already scroll smoothly), and it switches off for people who prefer reduced motion.
 * Dialogs/sheets and nested scroll areas keep native scrolling.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    lenis = new Lenis({
      autoRaf: true,
      lerp: 0.12,
      smoothWheel: true,
      syncTouch: false,
      allowNestedScroll: true,
      anchors: true,
      prevent: (node) => !!node.closest("dialog, [data-lenis-prevent]"),
    });
    const onReduce = () => {
      if (reduce.matches) lenis?.destroy();
    };
    reduce.addEventListener("change", onReduce);
    return () => {
      reduce.removeEventListener("change", onReduce);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  // New page → new content height, and start at the top without animating.
  useEffect(() => {
    lenis?.resize();
    lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
