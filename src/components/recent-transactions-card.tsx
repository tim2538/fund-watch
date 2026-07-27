"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionItem } from "@/components/transaction-item";
import { useTransactionsDialog } from "@/components/transactions-dialog";
import { useI18n } from "@/lib/i18n";
import { useTransactions } from "@/lib/transactions";
import type { FundSymbol } from "@/lib/funds";

const RECENT_LIMIT = 3;

/** Latest trades for one fund, with a link to the full (filtered) list. */
export function RecentTransactionsCard({ symbol }: { symbol: FundSymbol }) {
  const { t } = useI18n();
  const { forSymbol } = useTransactions();
  const { open: openTransactions } = useTransactionsDialog();

  // forSymbol returns oldest → newest; show the most recent first.
  const recent = React.useMemo(
    () => forSymbol(symbol).slice(-RECENT_LIMIT).reverse(),
    [forSymbol, symbol],
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">{t("recentTransactions")}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-0.5 px-2 text-xs text-muted-foreground"
          onClick={() => openTransactions(symbol)}
        >
          {t("viewAll")}
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">
            {t("noTransactions")}
          </p>
        ) : (
          <div className="divide-y">
            {recent.map((tx) => (
              <TransactionItem key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
