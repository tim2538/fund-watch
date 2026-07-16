"use client";

/**
 * User portfolio layer — lets the user enter a cost basis (total baht invested)
 * and number of units per fund, then derives their personal return.
 *
 * Mirrors the i18n layer's persistence pattern:
 * - state hydrated from localStorage in a mount effect (avoids SSR mismatch)
 * - setters write back to localStorage inside try/catch, guarded by `typeof window`
 *
 * Storage keys: "portfolio" (JSON map) and "displayMode".
 */

import * as React from "react";
import type { FundData, FundSymbol } from "@/lib/funds";

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

interface PortfolioValue {
  entries: PortfolioEntries;
  setEntry: (symbol: FundSymbol, patch: Partial<PortfolioEntry>) => void;
  clearEntry: (symbol: FundSymbol) => void;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
}

const PortfolioContext = React.createContext<PortfolioValue | null>(null);

const STORAGE_KEY = "portfolio";
const MODE_KEY = "displayMode";

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

  // Hydrate from localStorage after mount so server/client markup match.
  React.useEffect(() => {
    setEntries(readEntries());
    const savedMode = window.localStorage.getItem(MODE_KEY);
    if (savedMode === "market" || savedMode === "portfolio") {
      setDisplayModeState(savedMode);
    }
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

  const value = React.useMemo<PortfolioValue>(
    () => ({ entries, setEntry, clearEntry, displayMode, setDisplayMode }),
    [entries, setEntry, clearEntry, displayMode, setDisplayMode],
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
