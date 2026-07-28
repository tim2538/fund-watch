"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { HorizontalScroller } from "@/components/horizontal-scroller";
import { cn, formatBaht } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { sliceHistory, type NavPoint, type TimeRange } from "@/lib/funds";
import type { Transaction } from "@/lib/transactions";

const RANGES: TimeRange[] = [
  "1M",
  "3M",
  "6M",
  "YTD",
  "1Y",
  "3Y",
  "5Y",
  "10Y",
  "MAX",
];

const RANGE_STORAGE_KEY = "fund-watch.nav-range";

/**
 * Remembered across fund switches so the chart keeps the user's last range.
 * `null` = localStorage not read yet (first mount after page load).
 */
let lastRange: TimeRange | null = null;

/** Parse YYYY-MM-DD as a local calendar date (timezone-safe). */
function parseLocal(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(iso);
}

function ChartTooltip({ active, payload, locale, t, txByDate }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as NavPoint;
  const txs: Marker[] = txByDate?.[p.date] ?? [];
  return (
    <div className="max-w-[70vw] break-words rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="text-muted-foreground">
        {parseLocal(p.date).toLocaleDateString(locale, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </div>
      <div className="mt-0.5 font-semibold tabular-nums">
        {formatBaht(p.nav)}
      </div>
      {txs.length > 0 && (
        <div className="mt-1.5 space-y-1 border-t pt-1.5">
          {txs.map((tx) => {
            const buy = tx.type === "buy";
            return (
              <div key={tx.id} className="flex items-baseline gap-1.5">
                <span
                  className={cn(
                    "font-medium",
                    buy
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400",
                  )}
                >
                  {buy ? t("txBuy") : t("txSell")}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  ฿{formatBaht(tx.cost, 2)} ·{" "}
                  {tx.units.toLocaleString(locale, {
                    maximumFractionDigits: 4,
                  })}{" "}
                  {t("unit")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** A transaction snapped onto a NAV history point, for chart plotting. */
interface Marker {
  id: string;
  date: string; // matched history date (x on the category axis)
  nav: number; // NAV at that date (y)
  type: Transaction["type"];
  cost: number; // baht amount of the trade
  units: number; // units bought / sold
}

/**
 * Snap each transaction to the nearest NAV point within the visible range so it
 * can be plotted as a ReferenceDot. Trades outside the range are dropped.
 */
function buildMarkers(data: NavPoint[], txs: Transaction[]): Marker[] {
  if (!data.length || !txs.length) return [];
  const first = data[0].date;
  const last = data[data.length - 1].date;
  const out: Marker[] = [];
  for (const tx of txs) {
    if (tx.date < first || tx.date > last) continue;
    let best = data[0];
    let bestDiff = Infinity;
    for (const p of data) {
      const diff = Math.abs(
        parseLocal(p.date).getTime() - parseLocal(tx.date).getTime(),
      );
      if (diff < bestDiff) {
        bestDiff = diff;
        best = p;
      }
    }
    out.push({
      id: tx.id,
      date: best.date,
      nav: best.nav,
      type: tx.type,
      cost: tx.cost,
      units: tx.units,
    });
  }
  return out;
}

export function NavChart({
  history,
  transactions = [],
  className,
}: {
  history: NavPoint[];
  transactions?: Transaction[];
  className?: string;
}) {
  const { locale, t } = useI18n();
  const [range, setRange] = React.useState<TimeRange>(lastRange ?? "1Y");

  // Restore the saved range once per page load (after hydration, to avoid
  // a server/client HTML mismatch).
  React.useEffect(() => {
    if (lastRange !== null) return;
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(RANGE_STORAGE_KEY);
    } catch {
      /* localStorage unavailable (private mode etc.) */
    }
    lastRange = RANGES.includes(saved as TimeRange)
      ? (saved as TimeRange)
      : "1Y";
    setRange(lastRange);
  }, []);

  const selectRange = (r: TimeRange) => {
    lastRange = r;
    setRange(r);
    try {
      window.localStorage.setItem(RANGE_STORAGE_KEY, r);
    } catch {
      /* ignore */
    }
  };
  const data = React.useMemo(
    () => sliceHistory(history, range),
    [history, range],
  );

  const markers = React.useMemo(
    () => buildMarkers(data, transactions),
    [data, transactions],
  );

  // Group markers by their snapped history date so the tooltip can list every
  // trade that lands on the hovered point.
  const txByDate = React.useMemo(() => {
    const m: Record<string, Marker[]> = {};
    for (const mk of markers) (m[mk.date] ??= []).push(mk);
    return m;
  }, [markers]);

  const up = data.length > 1 && data[data.length - 1].nav >= data[0].nav;
  const stroke = up ? "hsl(var(--chart-up))" : "hsl(var(--chart-down))";

  const values = data.map((d) => d.nav);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.08 || 0.1;

  return (
    <div className={cn("space-y-3", className)}>
      <HorizontalScroller activeKey={range}>
        <div className="flex w-max gap-1.5">
          {RANGES.map((r) => (
            <Button
              key={r}
              size="sm"
              variant={range === r ? "default" : "outline"}
              data-active={range === r ? "true" : undefined}
              className="h-7 shrink-0 px-3 text-xs"
              onClick={() => selectRange(r)}
            >
              {r}
            </Button>
          ))}
        </div>
      </HorizontalScroller>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="navFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              minTickGap={40}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) =>
                parseLocal(v).toLocaleDateString(
                  locale,
                  ["3Y", "5Y", "10Y", "MAX"].includes(range)
                    ? { month: "short", year: "numeric" }
                    : { day: "numeric", month: "short" },
                )
              }
            />
            <YAxis
              domain={[min - pad, max + pad]}
              width={52}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => Number(v).toFixed(2)}
            />
            <Tooltip
              content={
                <ChartTooltip locale={locale} t={t} txByDate={txByDate} />
              }
            />
            <Area
              type="monotone"
              dataKey="nav"
              stroke={stroke}
              strokeWidth={2}
              fill="url(#navFill)"
              dot={false}
              activeDot={{ r: 4 }}
            />
            {markers.map((m) => {
              const color =
                m.type === "buy"
                  ? "hsl(var(--chart-up))"
                  : "hsl(var(--chart-down))";
              return (
                <ReferenceDot
                  key={m.id}
                  x={m.date}
                  y={m.nav}
                  r={6}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={2}
                  isFront
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
