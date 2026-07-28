"use client";

/**
 * Transaction layer — records the individual buy / sell trades a user makes on
 * a fund. Separate from the portfolio layer (which stores an aggregate cost /
 * units position): a transaction is a dated event, and in "My portfolio" mode
 * each one is plotted as a point on the fund's NAV chart.
 *
 * Follows the same persistence pattern as portfolio.tsx / i18n.tsx:
 * - state hydrated from localStorage in a mount effect (avoids SSR mismatch)
 * - setters write back to localStorage inside try/catch, guarded by
 *   `typeof window`.
 *
 * Storage key: "transactions" (JSON array).
 */

import * as React from "react";
import { FUND_SYMBOLS, type FundSymbol } from "@/lib/funds";
import type { ImportedTransaction } from "@/lib/transactions-io";

export type TransactionType = "buy" | "sell";

export interface Transaction {
  id: string;
  symbol: FundSymbol;
  type: TransactionType;
  date: string; // ISO yyyy-mm-dd (the trade date)
  cost: number; // baht amount of the trade
  units: number; // number of units bought / sold
}

/** A new transaction before it gets an id (id is assigned by addTransaction). */
export type NewTransaction = Omit<Transaction, "id">;

const STORAGE_KEY = "transactions";

function isFundSymbol(v: unknown): v is FundSymbol {
  return (FUND_SYMBOLS as string[]).includes(v as string);
}

/** Keep only well-formed transaction records (used when reading storage). */
function sanitize(raw: unknown): Transaction[] {
  if (!Array.isArray(raw)) return [];
  const out: Transaction[] = [];
  for (const v of raw) {
    if (!v || typeof v !== "object") continue;
    const { id, symbol, type, date, cost, units } = v as Record<
      string,
      unknown
    >;
    if (
      typeof id === "string" &&
      isFundSymbol(symbol) &&
      (type === "buy" || type === "sell") &&
      typeof date === "string" &&
      /^\d{4}-\d{2}-\d{2}/.test(date) &&
      typeof cost === "number" &&
      Number.isFinite(cost) &&
      cost >= 0 &&
      typeof units === "number" &&
      Number.isFinite(units) &&
      units >= 0
    ) {
      out.push({ id, symbol, type, date, cost, units });
    }
  }
  return out;
}

function readTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return sanitize(JSON.parse(raw));
  } catch {
    /* ignore malformed data */
  }
  return [];
}

/**
 * Identity key for de-duplication on import: two records describing the same
 * trade (same fund, side, date, amount, units) collapse to one, so re-importing
 * a file you already have is a no-op.
 */
function contentKey(t: {
  symbol: FundSymbol;
  type: TransactionType;
  date: string;
  cost: number;
  units: number;
}): string {
  return `${t.symbol}|${t.type}|${t.date}|${t.cost}|${t.units}`;
}

/** Outcome of a bulk import: how many rows were added vs. skipped as dupes. */
export interface ImportResult {
  added: number;
  skipped: number;
}

function makeId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

interface TransactionsValue {
  transactions: Transaction[];
  /** Append a transaction; returns the created record (with its id). */
  addTransaction: (tx: NewTransaction) => Transaction;
  /** Replace the fields of an existing transaction (keeps its id). */
  updateTransaction: (id: string, patch: Partial<NewTransaction>) => void;
  removeTransaction: (id: string) => void;
  /** Transactions for a single fund, sorted oldest → newest by date. */
  forSymbol: (symbol: FundSymbol) => Transaction[];
  /**
   * Merge imported transactions into the existing list, skipping any that
   * duplicate an existing record (by id or by content). Returns the counts.
   */
  importTransactions: (incoming: ImportedTransaction[]) => ImportResult;
}

const TransactionsContext = React.createContext<TransactionsValue | null>(null);

export function TransactionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);

  // Hydrate after mount so server/client markup match.
  React.useEffect(() => {
    setTransactions(readTransactions());
  }, []);

  const persist = React.useCallback((next: Transaction[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const addTransaction = React.useCallback<TransactionsValue["addTransaction"]>(
    (tx) => {
      const created: Transaction = { ...tx, id: makeId() };
      setTransactions((prev) => {
        const next = [...prev, created];
        persist(next);
        return next;
      });
      return created;
    },
    [persist],
  );

  const updateTransaction = React.useCallback<
    TransactionsValue["updateTransaction"]
  >(
    (id, patch) => {
      setTransactions((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, ...patch } : t));
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const removeTransaction = React.useCallback<
    TransactionsValue["removeTransaction"]
  >(
    (id) => {
      setTransactions((prev) => {
        const next = prev.filter((t) => t.id !== id);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const importTransactions = React.useCallback<
    TransactionsValue["importTransactions"]
  >(
    (incoming) => {
      // Compute synchronously against the current list so we can return counts.
      const ids = new Set(transactions.map((t) => t.id));
      const keys = new Set(transactions.map(contentKey));
      const additions: Transaction[] = [];
      let skipped = 0;

      for (const cand of incoming) {
        const key = contentKey(cand);
        // Same trade already present, or an id we already hold → skip.
        if (keys.has(key) || (cand.id && ids.has(cand.id))) {
          skipped++;
          continue;
        }
        const id = cand.id && !ids.has(cand.id) ? cand.id : makeId();
        const created: Transaction = {
          id,
          symbol: cand.symbol,
          type: cand.type,
          date: cand.date,
          cost: cand.cost,
          units: cand.units,
        };
        additions.push(created);
        ids.add(id);
        keys.add(key);
      }

      if (additions.length > 0) {
        const next = [...transactions, ...additions];
        setTransactions(next);
        persist(next);
      }
      return { added: additions.length, skipped };
    },
    [transactions, persist],
  );

  const forSymbol = React.useCallback<TransactionsValue["forSymbol"]>(
    (symbol) =>
      transactions
        .filter((t) => t.symbol === symbol)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [transactions],
  );

  const value = React.useMemo<TransactionsValue>(
    () => ({
      transactions,
      addTransaction,
      updateTransaction,
      removeTransaction,
      forSymbol,
      importTransactions,
    }),
    [
      transactions,
      addTransaction,
      updateTransaction,
      removeTransaction,
      forSymbol,
      importTransactions,
    ],
  );

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions(): TransactionsValue {
  const ctx = React.useContext(TransactionsContext);
  if (!ctx)
    throw new Error(
      "useTransactions must be used within <TransactionsProvider>",
    );
  return ctx;
}
