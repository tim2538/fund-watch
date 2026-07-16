"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FundSummaryCard } from "@/components/fund-summary-card";
import { FundDetail } from "@/components/fund-detail";
import { useI18n } from "@/lib/i18n";
import type { FundData, FundSymbol } from "@/lib/funds";

export function FundDashboard({ funds }: { funds: FundData[] }) {
  const { t } = useI18n();
  const [selected, setSelected] = React.useState<FundSymbol>(
    funds[0]?.symbol ?? "BKD",
  );

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          {t("overview")}
        </h2>
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
    </div>
  );
}
