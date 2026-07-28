"use client";

import * as React from "react";
import { TabsList } from "@/components/ui/tabs";
import { HorizontalScroller } from "@/components/horizontal-scroller";

/** Height of the sticky app header — the tab strip parks right below it. */
export const STICKY_TOP = 70;

/**
 * The fund tab strip: sticky under the header and horizontally scrollable.
 *
 * With 10+ funds the triggers overflow on narrow screens, so the list scrolls
 * instead of wrapping. Must be rendered inside a `<Tabs>` root — it renders the
 * `TabsList` itself.
 *
 * @param value    the active tab, used to re-center the strip
 * @param children `TabsTrigger` elements
 */
export function ScrollableTabsList({
  value,
  containerRef,
  children,
}: {
  value: string;
  containerRef?: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={containerRef}
      style={{ top: STICKY_TOP }}
      className="sticky z-20 rounded-lg bg-muted"
    >
      <HorizontalScroller
        activeKey={value}
        fadeFrom="from-muted"
        className="rounded-lg"
      >
        <TabsList className="flex h-auto w-max justify-start gap-1 bg-transparent p-2">
          {children}
        </TabsList>
      </HorizontalScroller>
    </div>
  );
}
