"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FundSummaryCard } from "@/components/fund-summary-card";
import { FundDetail } from "@/components/fund-detail";
import { PortfolioDialog } from "@/components/portfolio-dialog";
import { useI18n } from "@/lib/i18n";
import { cn, formatPercent } from "@/lib/utils";
import { computePosition, usePortfolio, visibleFunds } from "@/lib/portfolio";
import type { FundData, FundSymbol } from "@/lib/funds";

export function FundDashboard({ funds }: { funds: FundData[] }) {
  const { t } = useI18n();
  const { displayMode, entries, order, hidden } = usePortfolio();
  const portfolioMode = displayMode === "portfolio";
  const [selected, setSelected] = React.useState<FundSymbol>(
    funds[0]?.symbol ?? "BKD",
  );
  const [portfolioOpen, setPortfolioOpen] = React.useState(false);

  const displayFunds = React.useMemo(
    () => visibleFunds(funds, order, hidden),
    [funds, order, hidden],
  );
  // Fall back to the first visible fund when the selected one is hidden.
  const effectiveSelected = displayFunds.some((f) => f.symbol === selected)
    ? selected
    : (displayFunds[0]?.symbol ?? funds[0]?.symbol ?? "BKD");

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            {t("overview")}
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 bg-card"
            onClick={() => setPortfolioOpen(true)}
          >
            <Wallet className="h-4 w-4" />
            {t("myPortfolio")}
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {displayFunds.map((f) => (
            <FundSummaryCard
              key={f.symbol}
              fund={f}
              active={f.symbol === effectiveSelected}
              onClick={() => setSelected(f.symbol)}
            />
          ))}
        </div>
      </section>

      <Tabs
        value={effectiveSelected}
        onValueChange={(v) => setSelected(v as FundSymbol)}
        className="w-full"
      >
        <TabsList className="sticky top-3 z-10 flex h-auto w-full justify-start overflow-x-auto bg-muted p-2">
          {displayFunds.map((f) => {
            const pos = computePosition(f, entries[f.symbol]);
            const percent =
              portfolioMode && pos ? pos.returnPercent : f.changePercent;
            const up = percent >= 0;
            return (
              <TabsTrigger
                key={f.symbol}
                value={f.symbol}
                className="shrink-0 min-w-[100px] flex-col gap-0.5 py-1.5 font-mono text-xs sm:text-sm"
              >
                <span>{f.symbol}</span>
                {!f.ok ? null : portfolioMode && !pos ? (
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {t("setupPortfolio")}
                  </span>
                ) : (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-[10px] font-normal tabular-nums",
                      up
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {up ? (
                      <ArrowUpRight className="h-2.5 w-2.5" />
                    ) : (
                      <ArrowDownRight className="h-2.5 w-2.5" />
                    )}
                    {formatPercent(percent)}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {displayFunds.map((f) => (
          <TabsContent key={f.symbol} value={f.symbol} className="mt-4">
            <FundDetail fund={f} />
          </TabsContent>
        ))}
      </Tabs>

      <PortfolioDialog
        funds={funds}
        open={portfolioOpen}
        onOpenChange={setPortfolioOpen}
      />
    </div>
  );
}
