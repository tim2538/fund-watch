"use client";

import { AlertTriangle, ArrowDownRight, ArrowUpRight, ExternalLink } from "lucide-react";
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
import { cn, formatBaht, formatDate } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
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
  const { t, locale } = useI18n();

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

  const up = fund.changePercent >= 0;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="font-mono text-lg">{fund.symbol}</CardTitle>
                <Badge variant="outline">{t("risk", { n: fund.risk })}</Badge>
                <Badge variant="success">{t("live")}</Badge>
              </div>
              <CardDescription className="mt-1">
                {fund.name} · {fund.nameEn}
              </CardDescription>
              <div className="mt-1 text-xs text-muted-foreground">
                {fund.amc} · {fund.category} · {t("dividendLabel")}: {fund.dividendPolicy || "-"}
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold tabular-nums">{formatBaht(fund.nav)}</div>
              <div
                className={cn(
                  "flex items-center justify-end gap-1 text-sm tabular-nums",
                  up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
                )}
              >
                {up ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {up ? "+" : ""}
                {formatBaht(fund.change)} ({up ? "+" : ""}
                {fund.changePercent.toFixed(2)}%)
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {t("navAsOf", { date: formatDate(fund.navDate, locale) })}
              </div>
            </div>
          </div>
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

      <FinnomenaLink symbol={fund.symbol} />
    </div>
  );
}
