"use client";

import * as React from "react";
import { Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FundSummaryCard } from "@/components/fund-summary-card";
import { FundDetail } from "@/components/fund-detail";
import { PortfolioDialog } from "@/components/portfolio-dialog";
import { useI18n } from "@/lib/i18n";
import type { FundData, FundSymbol } from "@/lib/funds";

export function FundDashboard({ funds }: { funds: FundData[] }) {
  const { t } = useI18n();
  const [selected, setSelected] = React.useState<FundSymbol>(
    funds[0]?.symbol ?? "BKD",
  );
  const [portfolioOpen, setPortfolioOpen] = React.useState(false);

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
            className="gap-1.5"
            onClick={() => setPortfolioOpen(true)}
          >
            <Wallet className="h-4 w-4" />
            {t("myPortfolio")}
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {funds.map((f) => (
            <FundSummaryCard
              key={f.symbol}
              fund={f}
              active={f.symbol === selected}
              onClick={() => setSelected(f.symbol)}
            />
          ))}
        </div>
      </section>

      <Tabs
        value={selected}
        onValueChange={(v) => setSelected(v as FundSymbol)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          {funds.map((f) => (
            <TabsTrigger key={f.symbol} value={f.symbol} className="font-mono text-xs sm:text-sm">
              {f.symbol}
            </TabsTrigger>
          ))}
        </TabsList>
        {funds.map((f) => (
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
