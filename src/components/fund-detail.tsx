"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DividendTable } from "@/components/dividend-table";
import { NavChart } from "@/components/nav-chart";
import { TopHoldings } from "@/components/top-holdings";
import { DonutBreakdown } from "@/components/donut-breakdown";
import {
  cn,
  formatBaht,
  formatDate,
  formatPercent,
  formatSignedBaht,
} from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { computePosition, usePortfolio } from "@/lib/portfolio";
import { FINNOMENA_URL, type FundData, type FundSymbol } from "@/lib/funds";

function FinnomenaLink({ symbol }: { symbol: FundSymbol }) {
  const { t } = useI18n();
  return (
    <a
      href={FINNOMENA_URL[symbol]}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:underline"
    >
      {t("viewSource")}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

export function FundDetail({ fund }: { fund: FundData }) {
  const { t, lang, locale } = useI18n();

  if (!fund.ok) {
    return (
      <div className="space-y-4">
        <Card className="border-amber-500/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {t("loadErrorTitle", { symbol: fund.symbol })}
            </CardTitle>
            <CardDescription>{t("loadErrorDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <FinnomenaLink symbol={fund.symbol} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const { displayMode, entries } = usePortfolio();
  const pos = computePosition(fund, entries[fund.symbol]);
  const portfolioMode = displayMode === "portfolio";
  const showPortfolio = portfolioMode && pos != null;
  const up = showPortfolio ? pos.profit >= 0 : fund.changePercent >= 0;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="font-mono text-lg">
                  {fund.symbol}
                </CardTitle>
                <Badge variant="outline">{t("risk", { n: fund.risk })}</Badge>
                <Badge variant="success">{t("live")}</Badge>
              </div>
              <CardDescription className="mt-1">
                {lang === "th" ? fund.name : fund.nameEn}
              </CardDescription>
              <div className="mt-1 text-xs text-muted-foreground">
                {fund.amc} · {fund.category} · {t("dividendLabel")}:{" "}
                {fund.dividendPolicy || "-"}
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold tabular-nums">
                {formatBaht(fund.nav)}
              </div>
              <div
                className={cn(
                  "flex items-center justify-end gap-1 text-sm tabular-nums",
                  up
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {up ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {showPortfolio ? (
                  <>
                    {formatSignedBaht(pos.profit)} (
                    {formatPercent(pos.returnPercent)})
                  </>
                ) : (
                  <>
                    {up ? "+" : ""}
                    {formatBaht(fund.change)} (
                    {formatPercent(fund.changePercent)})
                  </>
                )}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {t("navAsOf", { date: formatDate(fund.navDate, locale) })}
              </div>
            </div>
          </div>

          {showPortfolio && (
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t pt-3 text-xs tabular-nums sm:grid-cols-4">
              <div>
                <div className="text-muted-foreground">{t("currentValue")}</div>
                <div className="font-medium">
                  {formatBaht(pos.currentValue, 2)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">{t("cost")}</div>
                <div className="font-medium">{formatBaht(pos.cost, 2)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">{t("profit")}</div>
                <div
                  className={cn(
                    "font-medium",
                    up
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400",
                  )}
                >
                  {formatSignedBaht(pos.profit)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">{t("avgCost")}</div>
                <div className="font-medium">{formatBaht(pos.avgCost)}</div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base">{t("navHistory")}</CardTitle>
          <CardDescription>{t("navHistoryDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <NavChart history={fund.history} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("dividendHistory")}</CardTitle>
          <CardDescription>{t("dividendHistoryDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <DividendTable dividends={fund.dividends} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("topHoldings")}</CardTitle>
          <CardDescription>
            {t("topHoldingsDesc")}
            {fund.holdingsDate
              ? ` · ${t("asOf", { date: formatDate(fund.holdingsDate, locale) })}`
              : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TopHoldings holdings={fund.topHoldings} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("assetAllocation")}</CardTitle>
          <CardDescription>
            {t("assetAllocationDesc")}
            {fund.assetAllocationDate
              ? ` · ${t("asOf", { date: formatDate(fund.assetAllocationDate, locale) })}`
              : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DonutBreakdown
            items={fund.assetAllocation}
            emptyLabel={t("noData")}
          />
        </CardContent>
      </Card>

      {fund.sectorBreakdown.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("sectorBreakdown")}</CardTitle>
            <CardDescription>
              {t("sectorDesc")}
              {fund.sectorDate
                ? ` · ${t("asOf", { date: formatDate(fund.sectorDate, locale) })}`
                : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DonutBreakdown
              items={fund.sectorBreakdown}
              emptyLabel={t("noData")}
            />
          </CardContent>
        </Card>
      )}

      <div className="text-right">
        <FinnomenaLink symbol={fund.symbol} />
      </div>
    </div>
  );
}
