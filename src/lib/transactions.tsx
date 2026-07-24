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
  removeTransaction: (id: string) => void;
  /** Transactions for a single fund, sorted oldest → newest by date. */
  forSymbol: (symbol: FundSymbol) => Transaction[];
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

  const forSymbol = React.useCallback<TransactionsValue["forSymbol"]>(
    (symbol) =>
      transactions
        .filter((t) => t.symbol === symbol)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [transactions],
  );

  const value = React.useMemo<TransactionsValue>(
    () => ({ transactions, addTransaction, removeTransaction, forSymbol }),
    [transactions, addTransaction, removeTransaction, forSymbol],
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
