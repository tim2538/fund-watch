"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TransactionItem } from "@/components/transaction-item";
import { TransactionFab } from "@/components/transaction-fab";
import { AddTransactionSheet } from "@/components/add-transaction-sheet";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useTransactions, type Transaction } from "@/lib/transactions";
import type { FundData, FundSymbol } from "@/lib/funds";

type Filter = FundSymbol | "all";

export function TransactionsView({ funds }: { funds: FundData[] }) {
  const { t } = useI18n();
  const { transactions, removeTransaction } = useTransactions();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [editing, setEditing] = React.useState<Transaction | null>(null);

  // The active fund filter comes from the URL (?fund=SYMBOL) so links can deep
  // link straight to one fund's history. Unknown/missing → show all.
  const fundParam = searchParams.get("fund");
  const active: Filter = funds.some((f) => f.symbol === fundParam)
    ? (fundParam as FundSymbol)
    : "all";

  const setFilter = (val: Filter) => {
    if (val === "all") router.replace(pathname, { scroll: false });
    else router.replace(`${pathname}?fund=${val}`, { scroll: false });
  };

  const list = React.useMemo(() => {
    const sorted = [...transactions].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
    return active === "all"
      ? sorted
      : sorted.filter((tx) => tx.symbol === active);
  }, [transactions, active]);

  const fabSymbol: FundSymbol =
    active !== "all" ? active : (funds[0]?.symbol ?? "BKD");

  return (
    <>
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">
        {t("transactions")}
      </h2>

      {/* Fund filter — scrollable chip row */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        <Button
          size="sm"
          variant={active === "all" ? "default" : "outline"}
          className="h-8 shrink-0 px-3 text-xs"
          onClick={() => setFilter("all")}
        >
          {t("allFunds")}
        </Button>
        {funds.map((f) => (
          <Button
            key={f.symbol}
            size="sm"
            variant={active === f.symbol ? "default" : "outline"}
            className={cn("h-8 shrink-0 px-3 font-mono text-xs")}
            onClick={() => setFilter(f.symbol)}
          >
            {f.symbol}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="px-4 sm:px-6 py-1.5 sm:py-3.5">
          {list.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("noTransactions")}
            </p>
          ) : (
            <div className="divide-y">
              {list.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  tx={tx}
                  showFund={active === "all"}
                  onEdit={setEditing}
                  onDelete={removeTransaction}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionFab funds={funds} selectedSymbol={fabSymbol} />

      {/* Edit sheet — reuses the create form in edit mode. */}
      <AddTransactionSheet
        funds={funds}
        open={editing != null}
        onOpenChange={(o) => !o && setEditing(null)}
        defaultSymbol={editing?.symbol ?? fabSymbol}
        transaction={editing ?? undefined}
      />
    </>
  );
}
