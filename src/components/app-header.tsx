"use client";

import * as React from "react";
import { LineChart } from "lucide-react";
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
    <header className="mb-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LineChart className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-bold leading-tight">Fund Watch</h1>
          <p className="text-xs text-muted-foreground">
            {t("liveData")}
            {time ? ` · ${t("updated", { time })}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
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
