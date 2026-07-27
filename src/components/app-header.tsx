"use client";

import * as React from "react";
import Link from "next/link";
import { AppMenu } from "@/components/app-menu";
import { InstallPrompt } from "@/components/install-prompt";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function AppHeader({ updatedAt }: { updatedAt: string }) {
  const { t, locale } = useI18n();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Show the bottom border only once the page has scrolled away from the top.
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Format the timestamp only after mount so server/client markup match
  // (timezone + locale are client-specific).
  const time = mounted
    ? new Date(updatedAt).toLocaleString(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 -mx-4 mb-3 flex justify-between gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur transition-colors sm:-mx-6 sm:px-6",
        scrolled ? "border-border" : "border-transparent",
      )}
    >
      <Link
        href="/"
        aria-label={t("home")}
        className="flex min-w-0 gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {/* App icon (light) — served from public/icons; basePath-aware for
            GitHub Pages project sub-paths. The SVG carries its own rounded
            background, so no wrapper styling is needed. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icons/icon.svg`}
          alt="Fund Watch"
          width={36}
          height={36}
          className="h-9 w-9"
        />
        <div className="min-w-0">
          <h1 className="text-lg font-bold leading-tight">Fund Watch</h1>
          <p className="truncate text-xs text-muted-foreground">
            {time ? `${t("updated", { time })} · ` : ""}
            {t("liveData")}
          </p>
        </div>
      </Link>
      <div className="flex gap-2">
        <InstallPrompt />
        <AppMenu />
      </div>
    </header>
  );
}

export function AppFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-10 border-t pt-4 text-center text-[11px] text-muted-foreground">
      {t("footer")}
    </footer>
  );
}
