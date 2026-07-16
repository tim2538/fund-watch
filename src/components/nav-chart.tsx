"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn, formatBaht } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { sliceHistory, type NavPoint, type TimeRange } from "@/lib/funds";

const RANGES: TimeRange[] = ["1M", "3M", "6M", "YTD", "1Y"];

/** Parse YYYY-MM-DD as a local calendar date (timezone-safe). */
function parseLocal(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(iso);
}

function ChartTooltip({ active, payload, locale }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as NavPoint;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="text-muted-foreground">
        {parseLocal(p.date).toLocaleDateString(locale, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </div>
      <div className="mt-0.5 font-semibold tabular-nums">{formatBaht(p.nav)}</div>
    </div>
  );
}

export function NavChart({
  history,
  className,
}: {
  history: NavPoint[];
  className?: string;
}) {
  const { locale } = useI18n();
  const [range, setRange] = React.useState<TimeRange>("1Y");
  const data = React.useMemo(() => sliceHistory(history, range), [history, range]);

  const up = data.length > 1 && data[data.length - 1].nav >= data[0].nav;
  const stroke = up ? "hsl(var(--chart-1))" : "hsl(var(--chart-5))";

  const values = data.map((d) => d.nav);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.08 || 0.1;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-1.5">
        {RANGES.map((r) => (
          <Button
            key={r}
            size="sm"
            variant={range === r ? "default" : "outline"}
            className="h-7 px-3 text-xs"
            onClick={() => setRange(r)}
          >
            {r}
          </Button>
        ))}
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="navFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              minTickGap={40}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) =>
                parseLocal(v).toLocaleDateString(locale, { day: "numeric", month: "short" })
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
            <Tooltip content={<ChartTooltip locale={locale} />} />
            <Area
              type="monotone"
              dataKey="nav"
              stroke={stroke}
              strokeWidth={2}
              fill="url(#navFill)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
