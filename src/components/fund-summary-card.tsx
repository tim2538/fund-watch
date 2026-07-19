"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  cn,
  formatBaht,
  formatDate,
  formatPercent,
  formatSignedBaht,
} from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { computePosition, usePortfolio } from "@/lib/portfolio";
import type { FundData } from "@/lib/funds";

export function FundSummaryCard({
  fund,
  active = false,
  onClick,
}: {
  fund: FundData;
  active?: boolean;
  onClick?: () => void;
}) {
  const { t, lang, locale } = useI18n();
  const { displayMode, entries } = usePortfolio();
  const pos = computePosition(fund, entries[fund.symbol]);
  const portfolioMode = displayMode === "portfolio";
  const up = portfolioMode && pos ? pos.profit >= 0 : fund.changePercent >= 0;
  return (
    <Card
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "min-w-0 transition-all",
        onClick && "cursor-pointer hover:border-primary/40 hover:shadow-md",
        active && "border-primary ring-1 ring-primary",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-mono text-sm font-semibold">{fund.symbol}</div>
            <div
              className="truncate text-xs text-muted-foreground"
              title={lang === "th" ? fund.name : fund.nameEn}
            >
              {lang === "th" ? fund.name : fund.nameEn}
            </div>
          </div>
          {!fund.ok ? (
            <Badge variant="secondary" className="shrink-0">
              {t("na")}
            </Badge>
          ) : portfolioMode && !pos ? (
            <Badge variant="secondary" className="shrink-0 font-normal">
              {t("setupPortfolio")}
            </Badge>
          ) : (
            <Badge
              variant={up ? "success" : "danger"}
              className="gap-1 shrink-0"
            >
              {up ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {portfolioMode && pos
                ? formatPercent(pos.returnPercent)
                : formatPercent(fund.changePercent)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {fund.ok ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">
                {formatBaht(fund.nav)}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("perUnit")}
              </span>
            </div>
            {portfolioMode && pos ? (
              <>
                <div
                  className={cn(
                    "mt-1 text-xs tabular-nums",
                    up
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400",
                  )}
                >
                  {formatSignedBaht(pos.profit)} {t("profit")}
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground tabular-nums">
                  {t("currentValue")}: {formatBaht(pos.currentValue, 2)}
                </div>
              </>
            ) : (
              <>
                <div
                  className={cn(
                    "mt-1 text-xs tabular-nums",
                    up
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400",
                  )}
                >
                  {up ? "+" : ""}
                  {formatBaht(fund.change)} {t("perUnit")}
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground">
                  {t("asOf", { date: formatDate(fund.navDate, locale) })}
                </div>
              </>
            )}
          </>
        ) : (
          <p className="py-2 text-sm text-muted-foreground">
            {t("loadFailed")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
