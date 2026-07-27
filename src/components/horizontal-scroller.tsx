"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Matches the currently selected item, whichever convention the caller uses. */
const ACTIVE_SELECTOR = '[data-state="active"], [data-active="true"]';

/**
 * A horizontally scrolling strip with fade masks on either edge.
 *
 * The scrollbar is hidden (see `.no-scrollbar` in globals.css) — the fades are
 * the affordance, and they only appear on the side that still has content off
 * screen. When `activeKey` changes the selected child is centered, so the strip
 * stays in sync with selections made elsewhere on the page.
 *
 * The caller supplies the row itself (a flex container), which keeps this
 * usable for both the fund tab strip and the summary card row.
 *
 * The fades inherit the wrapper's `border-radius`, so pass any rounding via
 * `className` rather than to a parent — otherwise the fades square off a
 * rounded container (or round off a square one).
 *
 * @param activeKey  changing this re-centers the active child
 * @param fadeFrom   Tailwind `from-*` color matching the strip's background
 * @param outerRef   handle on the wrapper, e.g. to measure its sticky position
 */
export function HorizontalScroller({
  activeKey,
  fadeFrom = "from-background",
  className,
  outerRef,
  children,
}: {
  activeKey?: string;
  fadeFrom?: string;
  className?: string;
  outerRef?: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [edges, setEdges] = React.useState({ left: false, right: false });

  const syncEdges = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ left: el.scrollLeft > 1, right: el.scrollLeft < max - 1 });
  }, []);

  // Center the active child. Scrolls this strip horizontally only — never the
  // page — so it can't fight with vertical scrolling elsewhere.
  React.useEffect(() => {
    const el = scrollerRef.current;
    const active = el?.querySelector<HTMLElement>(ACTIVE_SELECTOR);
    if (!el || !active) return;
    const strip = el.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    const delta = item.left - strip.left - (strip.width - item.width) / 2;
    el.scrollBy({ left: delta, behavior: "smooth" });
    syncEdges();
  }, [activeKey, syncEdges]);

  // Re-check the edges when the viewport resizes or the row changes width
  // (funds can be hidden/reordered from the portfolio dialog).
  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    syncEdges();
    const observer = new ResizeObserver(syncEdges);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, [syncEdges]);

  return (
    <div ref={outerRef} className={cn("relative", className)}>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-8 rounded-[inherit] bg-gradient-to-r to-transparent transition-opacity",
          fadeFrom,
          edges.left ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-8 rounded-[inherit] bg-gradient-to-l to-transparent transition-opacity",
          fadeFrom,
          edges.right ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={scrollerRef}
        onScroll={syncEdges}
        className="no-scrollbar overflow-x-auto overscroll-x-contain scroll-p-1 scroll-smooth"
      >
        {children}
      </div>
    </div>
  );
}
