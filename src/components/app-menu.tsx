"use client";

import * as React from "react";
import { Menu, Monitor, Moon, Sun, TrendingUp, Wallet } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { FlagEN, FlagTH } from "@/components/ui/flag-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n, type Lang } from "@/lib/i18n";
import { usePortfolio, type DisplayMode } from "@/lib/portfolio";

export function AppMenu() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const { displayMode, setDisplayMode } = usePortfolio();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-card"
          aria-label={t("menu")}
        >
          <Menu className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 space-y-3 p-3">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
