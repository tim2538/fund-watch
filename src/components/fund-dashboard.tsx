"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ScrollableTabsList,
  STICKY_TOP,
} from "@/components/scrollable-tabs-list";
import { HorizontalScroller } from "@/components/horizontal-scroller";
import { FundSummaryCard } from "@/components/fund-summary-card";
import { FundDetail } from "@/components/fund-detail";
import { PortfolioDialog } from "@/components/portfolio-dialog";
import { TransactionFab } from "@/components/transaction-fab";
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
  const tabsRef = React.useRef<HTMLDivElement>(null);

  /**
   * Select a fund from the overview grid and scroll the page down so the tab
   * strip parks at its sticky position, putting the fund detail in view.
   * Skipped when the strip is already parked (or the user prefers less motion).
   */
  const selectFromCard = React.useCallback((symbol: FundSymbol) => {
    setSelected(symbol);
    const el = tabsRef.current;
    if (!el) return;
    const delta = el.getBoundingClientRect().top - STICKY_TOP;
    if (delta <= 1) return; // already parked or scrolled past
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollBy({ top: delta, behavior: reduced ? "auto" : "smooth" });
  }, []);

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
        {/* Two rows that flow top-to-bottom then scroll sideways, so the
            overview stays a fixed height no matter how many funds are tracked.
            Falls back to a single row when there are too few to fill two.

            The inner padding keeps the active card's border and focus ring off
            the scroll container's clipping edge; the negative margin cancels it
            so the cards still line up with the heading above. */}
        <HorizontalScroller activeKey={effectiveSelected} className="-mx-1">
          <div
            className={cn(
              "grid w-max snap-x snap-mandatory grid-flow-col gap-3 p-1",
              displayFunds.length > 3 ? "grid-rows-2" : "grid-rows-1",
            )}
          >
            {displayFunds.map((f) => (
              <FundSummaryCard
                key={f.symbol}
                fund={f}
                active={f.symbol === effectiveSelected}
                onClick={() => selectFromCard(f.symbol)}
                className="w-[15rem] shrink-0 snap-start sm:w-[18rem]"
              />
            ))}
          </div>
        </HorizontalScroller>
      </section>

      <Tabs
        value={effectiveSelected}
        onValueChange={(v) => setSelected(v as FundSymbol)}
        className="w-full"
      >
        <ScrollableTabsList value={effectiveSelected} containerRef={tabsRef}>
          {displayFunds.map((f) => {
            const pos = computePosition(f, entries[f.symbol]);
            const percent =
              portfolioMode && pos ? pos.returnPercent : f.changePercent;
            const up = percent >= 0;
            return (
              <TabsTrigger
                key={f.symbol}
                value={f.symbol}
                className="shrink-0 flex-col gap-0.5 py-1.5"
              >
                <span className="font-mono text-xs sm:text-sm">{f.symbol}</span>
                {!f.ok ? null : portfolioMode && !pos ? (
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {t("setupPortfolio")}
                  </span>
                ) : (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 rounded-md px-2 text-[10px] font-semibold tabular-nums",
                      up
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/15 text-red-600 dark:text-red-400",
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
        </ScrollableTabsList>
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

      <TransactionFab funds={displayFunds} selectedSymbol={effectiveSelected} />
    </div>
  );
}
