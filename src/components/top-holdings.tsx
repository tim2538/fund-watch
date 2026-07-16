"use client";

import { DonutBreakdown, type DonutItem } from "@/components/donut-breakdown";
import { useI18n } from "@/lib/i18n";
import type { Holding } from "@/lib/funds";

const OTHERS_COLOR = "#94a3b8"; // grey for the remaining proportion

export function TopHoldings({ holdings }: { holdings: Holding[] }) {
  const { t } = useI18n();

  const top = holdings.reduce((s, h) => s + h.percent, 0);
  const others = Math.max(0, 100 - top);

  const items: DonutItem[] = holdings.map((h) => ({
    name: h.name,
    percent: h.percent,
    color: h.color,
  }));
  if (holdings.length && others > 0.05) {
    items.push({
      name: t("holdingsOthers"),
      percent: Number(others.toFixed(2)),
      color: OTHERS_COLOR,
      isOthers: true,
    });
  }

  return (
    <DonutBreakdown
      items={items}
      emptyLabel={t("noHoldings")}
      showRank
      center={{ value: `${top.toFixed(1)}%`, label: t("top5") }}
    />
  );
}
