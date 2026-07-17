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

/** Number input that shows thousand separators while not focused. */
function ThousandsInput({
  value,
  onChange,
  placeholder = "0",
}: {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = React.useState(false);
  const [text, setText] = React.useState("");

  const display = focused
    ? text
    : value
      ? value.toLocaleString("en-US", { maximumFractionDigits: 8 })
      : "";

  return (
    <Input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={display}
      onFocus={() => {
        setFocused(true);
        setText(value ? String(value) : "");
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(/,/g, "");
        if (!/^\d*\.?\d*$/.test(raw)) return;
        setText(raw);
        onChange(parseNum(raw));
      }}
      onBlur={() => setFocused(false)}
    />
  );
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
  const { t, lang } = useI18n();
  const { entries, setEntry, clearEntry } = usePortfolio();
  const entry = entries[fund.symbol];
  const pos = computePosition(fund, entry);
  const up = pos ? pos.profit >= 0 : false;
  const displayName = lang === "th" ? fund.name : fund.nameEn;

  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-mono text-sm font-semibold">{fund.symbol}</div>
          <div className="truncate text-xs text-muted-foreground" title={displayName}>
            {displayName}
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
          <ThousandsInput
            value={entry?.cost ?? 0}
            onChange={(n) => setEntry(fund.symbol, { cost: n })}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">
            {t("unitsLabel")}
          </span>
          <ThousandsInput
            value={entry?.units ?? 0}
            onChange={(n) => setEntry(fund.symbol, { units: n })}
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
