"use client";

import * as React from "react";
import { AppMenu } from "@/components/app-menu";
import { InstallPrompt } from "@/components/install-prompt";
import { useI18n } from "@/lib/i18n";

export function AppHeader({ updatedAt }: { updatedAt: string }) {
  const { t, locale } = useI18n();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Format the timestamp only after mount so server/client markup match
  // (timezone + locale are client-specific).
  const time = mounted
    ? new Date(updatedAt).toLocaleString(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return (
    <header className="mb-6 flex justify-between gap-3">
      <div className="flex gap-2.5">
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
        <div>
          <h1 className="text-lg font-bold leading-tight">Fund Watch</h1>
          <p className="text-xs text-muted-foreground">
            {t("liveData")}
            {time ? ` · ${t("updated", { time })}` : ""}
          </p>
        </div>
      </div>
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
