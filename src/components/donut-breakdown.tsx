"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface DonutItem {
  name: string;
  percent: number;
  color?: string;
  isOthers?: boolean; // excluded from ranking numbers
}

// Fallback palette when the API doesn't supply a color for an item.
const PALETTE = [
  "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899",
  "#14b8a6", "#f43f5e", "#84cc16", "#06b6d4", "#a855f7",
  "#eab308", "#64748b",
];

const colorAt = (it: DonutItem, i: number) => it.color || PALETTE[i % PALETTE.length];

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="max-w-[220px] rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: p.fill }}
        />
        <span className="truncate text-muted-foreground">{p.name}</span>
      </div>
      <div className="mt-0.5 font-semibold tabular-nums">{Number(p.pct).toFixed(2)}%</div>
    </div>
  );
}

export function DonutBreakdown({
  items,
  emptyLabel,
  showRank = false,
  center,
}: {
  items: DonutItem[];
  emptyLabel: string;
  showRank?: boolean;
  center?: { value: string; label: string } | null;
}) {
  if (!items.length) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  // Clamp negative values (e.g. derivatives) to 0 for the chart geometry,
  // but keep the real value in the legend/tooltip.
  const data = items.map((it, i) => ({
    name: it.name,
    pct: it.percent,
    value: Math.max(0, it.percent),
    fill: colorAt(it, i),
  }));

  let rank = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={1}
              stroke="hsl(var(--background))"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} wrapperStyle={{ zIndex: 10 }} />
          </PieChart>
        </ResponsiveContainer>
        {center && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold tabular-nums">{center.value}</span>
            <span className="text-[10px] text-muted-foreground">{center.label}</span>
          </div>
        )}
      </div>

      <ol className="w-full min-w-0 space-y-1.5">
        {items.map((it, i) => {
          const numbered = showRank && !it.isOthers;
          if (numbered) rank += 1;
          return (
            <li key={i} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: colorAt(it, i) }}
                />
                <span className="min-w-0 truncate" title={it.name}>
                  {numbered && (
                    <span className="mr-1 text-muted-foreground tabular-nums">{rank}.</span>
                  )}
                  {it.name}
                </span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums">
                {it.percent.toFixed(2)}%
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
