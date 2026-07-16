"use client";

import * as React from "react";
import { Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __deferredInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export function InstallPrompt() {
  const { t } = useI18n();
  const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);

  React.useEffect(() => {
    // 1) Pick up an event that fired before hydration (captured in layout).
    if (window.__deferredInstallPrompt) setDeferred(window.__deferredInstallPrompt);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onCaptured = () => {
      if (window.__deferredInstallPrompt) setDeferred(window.__deferredInstallPrompt);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      window.__deferredInstallPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("pwa-installable", onCaptured);
    window.addEventListener("appinstalled", onInstalled);

    // 2) iOS Safari never fires beforeinstallprompt — offer manual instructions.
    const ua = window.navigator.userAgent;
    const iOS =
      /iphone|ipad|ipod/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) setInstalled(true);
    else if (iOS) setIsIOS(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("pwa-installable", onCaptured);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  // Chromium: native install prompt is available.
  if (deferred) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={async () => {
          await deferred.prompt();
          await deferred.userChoice;
          setDeferred(null);
          window.__deferredInstallPrompt = null;
        }}
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">{t("installApp")}</span>
      </Button>
    );
  }

  // iOS: show manual "Add to Home Screen" hint.
  if (isIOS) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setShowHint((v) => !v)}
        >
          <Share className="h-4 w-4" />
          <span className="hidden sm:inline">{t("installApp")}</span>
        </Button>
        {showHint && (
          <div
            className="absolute right-0 z-50 mt-2 w-60 rounded-md border bg-popover p-3 text-xs text-popover-foreground shadow-md"
            role="tooltip"
          >
            {t("iosInstallHint")}
          </div>
        )}
      </div>
    );
  }

  return null;
}
