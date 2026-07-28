"use client";

/**
 * Transactions are shown in a modal dialog rather than a separate route. On a
 * static host (GitHub Pages) App Router soft navigation can't fetch a route's
 * RSC payload, so keeping everything on one page avoids that whole class of
 * bug. A small context lets the header menu and the recent-transactions card
 * open the dialog (optionally pre-filtered to a fund) from anywhere in the tree.
 */

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileInput,
  FileOutput,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionItem } from "@/components/transaction-item";
import { AddTransactionSheet } from "@/components/add-transaction-sheet";
import { HorizontalScroller } from "@/components/horizontal-scroller";
import { useI18n } from "@/lib/i18n";
import { useTransactions, type Transaction } from "@/lib/transactions";
import {
  parseTransactionsText,
  transactionsToCsv,
} from "@/lib/transactions-io";
import { usePortfolio, visibleFunds } from "@/lib/portfolio";
import type { FundData, FundSymbol } from "@/lib/funds";
import { cn, fileStamp, formatBaht } from "@/lib/utils";

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
  const { transactions, removeTransaction, importTransactions } =
    useTransactions();
  const { order, hidden } = usePortfolio();
  const [filter, setFilter] = React.useState<Filter>("all");
  const [editing, setEditing] = React.useState<Transaction | null>(null);
  const [status, setStatus] = React.useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  // Download all transactions as a CSV backup (oldest → newest).
  const handleExport = React.useCallback(() => {
    const csv = transactionsToCsv(
      [...transactions].sort((a, b) => a.date.localeCompare(b.date)),
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fund-watch-transactions-${fileStamp(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions]);

  // Parse a chosen CSV / JSON file and merge it into the list.
  const handleImportFile = React.useCallback(
    async (file: File) => {
      setStatus(null);
      try {
        const parsed = parseTransactionsText(await file.text());
        if (parsed.length === 0) {
          setStatus({ ok: false, msg: t("txImportEmpty") });
          return;
        }
        const { added, skipped } = importTransactions(parsed);
        setStatus({
          ok: true,
          msg: t("txImportResult", { added, skipped }),
        });
      } catch {
        setStatus({ ok: false, msg: t("txImportError") });
      }
    },
    [importTransactions, t],
  );

  // Match the fund tabs: same ordering, and hidden funds filtered out.
  const filterFunds = React.useMemo(
    () => visibleFunds(funds, order, hidden),
    [funds, order, hidden],
  );

  // Seed the filter from the requested fund each time the dialog opens.
  React.useEffect(() => {
    if (open) {
      setFilter(initialFund ?? "all");
      setStatus(null);
    }
  }, [open, initialFund]);

  // Opened from the recent-transactions card (a specific fund was requested):
  // the fund is fixed, so hide the fund filter chip row.
  const hideFilter = initialFund != null;

  const list = React.useMemo(() => {
    const sorted = [...transactions].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
    return filter === "all"
      ? sorted
      : sorted.filter((tx) => tx.symbol === filter);
  }, [transactions, filter]);

  // Group the (newest-first) list by year, with per-year buy / sell totals.
  const years = React.useMemo(() => {
    const map = new Map<
      string,
      { year: string; txs: Transaction[]; buy: number; sell: number }
    >();
    for (const tx of list) {
      const year = tx.date.slice(0, 4);
      let g = map.get(year);
      if (!g) {
        g = { year, txs: [], buy: 0, sell: 0 };
        map.set(year, g);
      }
      g.txs.push(tx);
      if (tx.type === "buy") g.buy += tx.cost;
      else g.sell += tx.cost;
    }
    return Array.from(map.values());
  }, [list]);

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
          {/* Filter row: fund chips on the left, import / export on the right.
              Transactions are file-based (CSV / JSON) rather than QR, since the
              list grows unbounded. On mobile the buttons collapse to icons —
              same pattern as the "Install app" button. */}
          <div className="flex items-center gap-2">
            {/* Fund filter — scrollable chip row. Hidden when the dialog was
                opened from a fund's recent-transactions card. */}
            {!hideFilter ? (
              <HorizontalScroller
                activeKey={filter}
                className="min-w-0 flex-1"
              >
                <div className="flex w-max gap-1.5 pb-1">
                  <Button
                    size="sm"
                    variant={filter === "all" ? "default" : "outline"}
                    data-active={filter === "all" ? "true" : undefined}
                    className="h-8 shrink-0 px-3 text-xs"
                    onClick={() => setFilter("all")}
                  >
                    {t("allFunds")}
                  </Button>
                  {filterFunds.map((f) => (
                    <Button
                      key={f.symbol}
                      size="sm"
                      variant={filter === f.symbol ? "default" : "outline"}
                      data-active={filter === f.symbol ? "true" : undefined}
                      className="h-8 shrink-0 px-3 font-mono text-xs"
                      onClick={() => setFilter(f.symbol)}
                    >
                      {f.symbol}
                    </Button>
                  ))}
                </div>
              </HorizontalScroller>
            ) : (
              <div className="flex-1" />
            )}

            <div className="flex shrink-0 items-center gap-2 pb-1">
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 px-2.5 text-xs"
                disabled={transactions.length === 0}
                onClick={handleExport}
              >
                <FileOutput className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("txExport")}</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 px-2.5 text-xs"
                onClick={() => fileRef.current?.click()}
              >
                <FileInput className="h-3.5 w-3.5" />
                <span>{t("txImport")}</span>
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.json,text/csv,application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImportFile(file);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          {status && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-2 text-xs",
                status.ok
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
              )}
            >
              {status.ok ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              {status.msg}
            </div>
          )}

          {list.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("noTransactions")}
            </p>
          ) : (
            <div className="space-y-1">
              {years.map((g) => (
                <div key={g.year}>
                  {/* Year summary — total buy / sell for the year. */}
                  <div className="flex items-center justify-between gap-3 border-b py-1.5 text-xs">
                    <span className="font-semibold">{g.year}</span>
                    <span className="flex gap-3 tabular-nums">
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {t("txBuy")} ฿{formatBaht(g.buy, 2)}
                      </span>
                      <span className="text-red-600 dark:text-red-400">
                        {t("txSell")} ฿{formatBaht(g.sell, 2)}
                      </span>
                    </span>
                  </div>
                  <div className="divide-y">
                    {g.txs.map((tx) => (
                      <TransactionItem
                        key={tx.id}
                        tx={tx}
                        showFund={filter === "all"}
                        onEdit={setEditing}
                        onDelete={removeTransaction}
                      />
                    ))}
                  </div>
                </div>
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
