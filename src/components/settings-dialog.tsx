"use client";

import * as React from "react";
import { Monitor, Moon, Sun, TrendingUp, Wallet } from "lucide-react";
import { useTheme } from "next-themes";
import { Dialog } from "@/components/ui/dialog";
import { ButtonGroup } from "@/components/ui/button-group";
import { FlagEN, FlagTH } from "@/components/ui/flag-icons";
import { useI18n, type Lang } from "@/lib/i18n";
import { usePortfolio, type DisplayMode } from "@/lib/portfolio";

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const { displayMode, setDisplayMode } = usePortfolio();

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("settings")}
      description={t("settingsDesc")}
      closeLabel={t("close")}
    >
      <div className="space-y-4">
        <ButtonGroup
          label={t("appearance")}
          value={theme ?? "system"}
          onValueChange={setTheme}
          options={[
            { value: "light", label: t("themeLight"), icon: Sun },
            { value: "dark", label: t("themeDark"), icon: Moon },
            { value: "system", label: t("themeSystem"), icon: Monitor },
          ]}
        />

        <ButtonGroup<Lang>
          label={t("language")}
          value={lang}
          onValueChange={setLang}
          options={[
            { value: "en", label: "EN", icon: FlagEN },
            { value: "th", label: "ไทย", icon: FlagTH },
          ]}
        />

        <ButtonGroup<DisplayMode>
          label={t("viewMode")}
          value={displayMode}
          onValueChange={setDisplayMode}
          options={[
            { value: "market", label: t("modeMarket"), icon: TrendingUp },
            { value: "portfolio", label: t("modePortfolio"), icon: Wallet },
          ]}
        />
      </div>
    </Dialog>
  );
}
