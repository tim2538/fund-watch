"use client";

/**
 * User portfolio layer — lets the user enter a cost basis (total baht invested)
 * and number of units per fund, then derives their personal return.
 *
 * Mirrors the i18n layer's persistence pattern:
 * - state hydrated from localStorage in a mount effect (avoids SSR mismatch)
 * - setters write back to localStorage inside try/catch, guarded by `typeof window`
 *
 * Storage keys: "portfolio" (JSON map), "displayMode", "fundOrder" and
 * "fundHidden" (JSON arrays of symbols).
 */

import * as React from "react";
import { FUND_SYMBOLS, type FundData, type FundSymbol } from "@/lib/funds";

/** cost = total amount invested in baht; units = number of investment units held. */
export interface PortfolioEntry {
  cost: number;
  units: number;
}

/** "market" = the daily NAV change (default). "portfolio" = the user's own return. */
export type DisplayMode = "market" | "portfolio";

export type PortfolioEntries = Partial<Record<FundSymbol, PortfolioEntry>>;

export interface Position {
  cost: number; // total invested (baht)
  units: number;
  currentValue: number; // units × nav
  profit: number; // currentValue − cost
  returnPercent: number; // profit / cost × 100
  avgCost: number; // cost / units (per-unit cost basis)
}

/**
 * Derive a user's position for a fund. Returns `null` when there is no valid
 * entry (cost and units must both be positive), so callers can fall back to
 * market data or a "set up your portfolio" hint.
 */
export function computePosition(
  fund: FundData,
  entry?: PortfolioEntry,
): Position | null {
  if (!entry) return null;
  const { cost, units } = entry;
  if (!(cost > 0) || !(units > 0)) return null;
  const currentValue = units * fund.nav;
  const profit = currentValue - cost;
  return {
    cost,
    units,
    currentValue,
    profit,
    returnPercent: (profit / cost) * 100,
    avgCost: cost / units,
  };
}

/**
 * Sort funds by the user's chosen order; symbols missing from `order` sort
 * last (defensive against stale stored data).
 */
export function orderFunds(
  funds: FundData[],
  order: FundSymbol[],
): FundData[] {
  const rank = (s: FundSymbol) => {
    const i = order.indexOf(s);
    return i === -1 ? order.length : i;
  };
  return [...funds].sort((a, b) => rank(a.symbol) - rank(b.symbol));
}

/** Ordered funds with the user-hidden ones filtered out. */
export function visibleFunds(
  funds: FundData[],
  order: FundSymbol[],
  hidden: FundSymbol[],
): FundData[] {
  return orderFunds(funds, order).filter((f) => !hidden.includes(f.symbol));
}

interface PortfolioValue {
  entries: PortfolioEntries;
  setEntry: (symbol: FundSymbol, patch: Partial<PortfolioEntry>) => void;
  clearEntry: (symbol: FundSymbol) => void;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  order: FundSymbol[];
  hidden: FundSymbol[];
  moveFund: (symbol: FundSymbol, direction: "up" | "down") => void;
  toggleHidden: (symbol: FundSymbol) => void;
}

const PortfolioContext = React.createContext<PortfolioValue | null>(null);

const STORAGE_KEY = "portfolio";
const MODE_KEY = "displayMode";
const ORDER_KEY = "fundOrder";
const HIDDEN_KEY = "fundHidden";

function isFundSymbol(v: unknown): v is FundSymbol {
  return (FUND_SYMBOLS as string[]).includes(v as string);
}

/**
 * Normalize a stored order into a full permutation of FUND_SYMBOLS: drop
 * unknown/duplicate symbols, then append any symbols missing from storage
 * (e.g. funds added after the order was saved).
 */
function reconcileOrder(stored: unknown): FundSymbol[] {
  const out: FundSymbol[] = [];
  if (Array.isArray(stored)) {
    for (const v of stored) {
      if (isFundSymbol(v) && !out.includes(v)) out.push(v);
    }
  }
  for (const s of FUND_SYMBOLS) {
    if (!out.includes(s)) out.push(s);
  }
  return out;
}

function readOrder(): FundSymbol[] {
  if (typeof window === "undefined") return FUND_SYMBOLS;
  try {
    const raw = window.localStorage.getItem(ORDER_KEY);
    if (raw) return reconcileOrder(JSON.parse(raw));
  } catch {
    /* ignore malformed data */
  }
  return FUND_SYMBOLS;
}

function readHidden(): FundSymbol[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HIDDEN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed.filter(isFundSymbol);
    }
  } catch {
    /* ignore malformed data */
  }
  return [];
}

function readEntries(): PortfolioEntries {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") return parsed as PortfolioEntries;
  } catch {
    /* ignore malformed data */
  }
  return {};
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = React.useState<PortfolioEntries>({});
  const [displayMode, setDisplayModeState] =
    React.useState<DisplayMode>("market");
  const [order, setOrder] = React.useState<FundSymbol[]>(FUND_SYMBOLS);
  const [hidden, setHidden] = React.useState<FundSymbol[]>([]);

  // Hydrate from localStorage after mount so server/client markup match.
  React.useEffect(() => {
    setEntries(readEntries());
    const savedMode = window.localStorage.getItem(MODE_KEY);
    if (savedMode === "market" || savedMode === "portfolio") {
      setDisplayModeState(savedMode);
    }
    setOrder(readOrder());
    setHidden(readHidden());
  }, []);

  const setEntry = React.useCallback<PortfolioValue["setEntry"]>(
    (symbol, patch) => {
      setEntries((prev) => {
        const merged: PortfolioEntry = {
          cost: prev[symbol]?.cost ?? 0,
          units: prev[symbol]?.units ?? 0,
          ...patch,
        };
        const next = { ...prev, [symbol]: merged };
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const clearEntry = React.useCallback<PortfolioValue["clearEntry"]>(
    (symbol) => {
      setEntries((prev) => {
        const next = { ...prev };
        delete next[symbol];
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const setDisplayMode = React.useCallback<PortfolioValue["setDisplayMode"]>(
    (mode) => {
      setDisplayModeState(mode);
      try {
        window.localStorage.setItem(MODE_KEY, mode);
      } catch {
        /* ignore */
      }
    },
    [],
  );

  const moveFund = React.useCallback<PortfolioValue["moveFund"]>(
    (symbol, direction) => {
      setOrder((prev) => {
        const from = prev.indexOf(symbol);
        const to = direction === "up" ? from - 1 : from + 1;
        if (from === -1 || to < 0 || to >= prev.length) return prev;
        const next = [...prev];
        [next[from], next[to]] = [next[to], next[from]];
        try {
          window.localStorage.setItem(ORDER_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const toggleHidden = React.useCallback<PortfolioValue["toggleHidden"]>(
    (symbol) => {
      setHidden((prev) => {
        let next: FundSymbol[];
        if (prev.includes(symbol)) {
          next = prev.filter((s) => s !== symbol);
        } else {
          // Never allow hiding the last visible fund.
          if (prev.length >= FUND_SYMBOLS.length - 1) return prev;
          next = [...prev, symbol];
        }
        try {
          window.localStorage.setItem(HIDDEN_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const value = React.useMemo<PortfolioValue>(
    () => ({
      entries,
      setEntry,
      clearEntry,
      displayMode,
      setDisplayMode,
      order,
      hidden,
      moveFund,
      toggleHidden,
    }),
    [
      entries,
      setEntry,
      clearEntry,
      displayMode,
      setDisplayMode,
      order,
      hidden,
      moveFund,
      toggleHidden,
    ],
  );

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio(): PortfolioValue {
  const ctx = React.useContext(PortfolioContext);
  if (!ctx)
    throw new Error("usePortfolio must be used within <PortfolioProvider>");
  return ctx;
}
