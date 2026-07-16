"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, formatBaht, formatPercent, formatSignedBaht } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import {
  computePosition,
  usePortfolio,
  type DisplayMode,
} from "@/lib/portfolio";
import type { FundData } from "@/lib/funds";

/** Parse a numeric input value, treating empty/invalid as 0. */
function parseNum(v: string): number {
  if (v.trim() === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function ModeToggle() {
  const { t } = useI18n();
  const { displayMode, setDisplayMode } = usePortfolio();
  const options: { value: DisplayMode; label: string }[] = [
    { value: "market", label: t("modeMarket") },
    { value: "portfolio", label: t("modePortfolio") },
  ];
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium text-muted-foreground">
        {t("displayMode")}
      </div>
      <div className="inline-flex rounded-md border p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setDisplayMode(o.value)}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              displayMode === o.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FundRow({ fund }: { fund: FundData }) {
  const { t } = useI18n();
  const { entries, setEntry, clearEntry } = usePortfolio();
  const entry = entries[fund.symbol];
  const pos = computePosition(fund, entry);
  const up = pos ? pos.profit >= 0 : false;

  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-mono text-sm font-semibold">{fund.symbol}</div>
          <div className="truncate text-xs text-muted-foreground" title={fund.name}>
            {fund.name}
          </div>
        </div>
        {entry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearEntry(fund.symbol)}
          >
            {t("clear")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">
            {t("costLabel")}
          </span>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            placeholder="0"
            value={entry?.cost ? String(entry.cost) : ""}
            onChange={(e) =>
              setEntry(fund.symbol, { cost: parseNum(e.target.value) })
            }
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">
            {t("unitsLabel")}
          </span>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            placeholder="0"
            value={entry?.units ? String(entry.units) : ""}
            onChange={(e) =>
              setEntry(fund.symbol, { units: parseNum(e.target.value) })
            }
          />
        </label>
      </div>

      {pos && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs tabular-nums">
          <span className="text-muted-foreground">
            {t("currentValue")}:{" "}
            <span className="font-medium text-foreground">
              {formatBaht(pos.currentValue, 2)}
            </span>
          </span>
          <span
            className={cn(
              "font-medium",
              up
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400",
            )}
          >
            {formatSignedBaht(pos.profit)} ({formatPercent(pos.returnPercent)})
          </span>
        </div>
      )}
    </div>
  );
}

export function PortfolioDialog({
  funds,
  open,
  onOpenChange,
}: {
  funds: FundData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("myPortfolio")}
      description={t("portfolioDesc")}
      closeLabel={t("close")}
    >
      <div className="space-y-4">
        <ModeToggle />
        <div className="space-y-2">
          {funds.map((f) => (
            <FundRow key={f.symbol} fund={f} />
          ))}
        </div>
      </div>
    </Dialog>
  );
}
