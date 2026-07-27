"use client";

/**
 * Transactions are shown in a modal dialog rather than a separate route. On a
 * static host (GitHub Pages) App Router soft navigation can't fetch a route's
 * RSC payload, so keeping everything on one page avoids that whole class of
 * bug. A small context lets the header menu and the recent-transactions card
 * open the dialog (optionally pre-filtered to a fund) from anywhere in the tree.
 */

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionItem } from "@/components/transaction-item";
import { AddTransactionSheet } from "@/components/add-transaction-sheet";
import { useI18n } from "@/lib/i18n";
import { useTransactions, type Transaction } from "@/lib/transactions";
import type { FundData, FundSymbol } from "@/lib/funds";

type Filter = FundSymbol | "all";

interface TransactionsDialogValue {
  /** Open the dialog, optionally filtered to a single fund. */
  open: (fund?: FundSymbol) => void;
}

const TransactionsDialogContext =
  React.createContext<TransactionsDialogValue | null>(null);

export function useTransactionsDialog(): TransactionsDialogValue {
  const ctx = React.useContext(TransactionsDialogContext);
  if (!ctx)
    throw new Error(
      "useTransactionsDialog must be used within <TransactionsDialogProvider>",
    );
  return ctx;
}

export function TransactionsDialogProvider({
  funds,
  children,
}: {
  funds: FundData[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [initialFund, setInitialFund] = React.useState<FundSymbol | null>(null);

  const openDialog = React.useCallback((fund?: FundSymbol) => {
    setInitialFund(fund ?? null);
    setOpen(true);
  }, []);

  const value = React.useMemo(() => ({ open: openDialog }), [openDialog]);

  return (
    <TransactionsDialogContext.Provider value={value}>
      {children}
      <TransactionsDialogView
        funds={funds}
        open={open}
        onOpenChange={setOpen}
        initialFund={initialFund}
      />
    </TransactionsDialogContext.Provider>
  );
}

function TransactionsDialogView({
  funds,
  open,
  onOpenChange,
  initialFund,
}: {
  funds: FundData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFund: FundSymbol | null;
}) {
  const { t } = useI18n();
  const { transactions, removeTransaction } = useTransactions();
  const [filter, setFilter] = React.useState<Filter>("all");
  const [editing, setEditing] = React.useState<Transaction | null>(null);

  // Seed the filter from the requested fund each time the dialog opens.
  React.useEffect(() => {
    if (open) setFilter(initialFund ?? "all");
  }, [open, initialFund]);

  const list = React.useMemo(() => {
    const sorted = [...transactions].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
    return filter === "all"
      ? sorted
      : sorted.filter((tx) => tx.symbol === filter);
  }, [transactions, filter]);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        title={t("transactions")}
        closeLabel={t("close")}
        className="sm:max-w-2xl"
      >
        <div className="space-y-3">
          {/* Fund filter — scrollable chip row */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <Button
              size="sm"
              variant={filter === "all" ? "default" : "outline"}
              className="h-8 shrink-0 px-3 text-xs"
              onClick={() => setFilter("all")}
            >
              {t("allFunds")}
            </Button>
            {funds.map((f) => (
              <Button
                key={f.symbol}
                size="sm"
                variant={filter === f.symbol ? "default" : "outline"}
                className="h-8 shrink-0 px-3 font-mono text-xs"
                onClick={() => setFilter(f.symbol)}
              >
                {f.symbol}
              </Button>
            ))}
          </div>

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
                  showFund={filter === "all"}
                  onEdit={setEditing}
                  onDelete={removeTransaction}
                />
              ))}
            </div>
          )}
        </div>
      </Dialog>

      {/* Edit sheet — reuses the create form in edit mode, layered over the
          dialog. */}
      <AddTransactionSheet
        funds={funds}
        open={editing != null}
        onOpenChange={(o) => !o && setEditing(null)}
        defaultSymbol={editing?.symbol ?? funds[0]?.symbol ?? "BKD"}
        transaction={editing ?? undefined}
      />
    </>
  );
}
