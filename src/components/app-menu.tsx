"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
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
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{t("preference")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">
            {t("themeLight")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            {t("themeDark")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            {t("themeSystem")}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={lang}
          onValueChange={(v) => setLang(v as Lang)}
        >
          <DropdownMenuRadioItem value="en">EN</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="th">TH</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>{t("displayMode")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={displayMode}
          onValueChange={(v) => setDisplayMode(v as DisplayMode)}
        >
          <DropdownMenuRadioItem value="market">
            {t("modeMarket")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="portfolio">
            {t("modePortfolio")}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
