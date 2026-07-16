"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBaht, formatDate } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { Dividend } from "@/lib/funds";

const PAGE = 5;

export function DividendTable({ dividends }: { dividends: Dividend[] }) {
  const { t, locale } = useI18n();
  const [visible, setVisible] = React.useState(PAGE);

  if (!dividends.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">{t("noDividend")}</p>
    );
  }

  const total = dividends.reduce((s, d) => s + d.amount, 0);
  const rows = dividends.slice(0, visible); // newest -> oldest (already sorted)
  const hasMore = visible < dividends.length;
  const expanded = visible > PAGE;

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("colXd")}</TableHead>
            <TableHead>{t("colPay")}</TableHead>
            <TableHead className="text-right">{t("colAmount")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Total row pinned to the top */}
          <TableRow className="bg-muted/50 font-semibold hover:bg-muted/50">
            <TableCell colSpan={2}>{t("total")}</TableCell>
            <TableCell className="text-right tabular-nums">{formatBaht(total, 2)}</TableCell>
          </TableRow>
          {rows.map((d) => (
            <TableRow key={d.xdDate}>
              <TableCell className="font-medium">{formatDate(d.xdDate, locale)}</TableCell>
              <TableCell className="text-muted-foreground">
                {d.payDate ? formatDate(d.payDate, locale) : "-"}
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatBaht(d.amount, 2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {(hasMore || expanded) && (
        <div className="flex justify-center">
          {hasMore ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setVisible((v) => Math.min(v + PAGE, dividends.length))}
            >
              {t("loadMore")}
              <ChevronDown className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={() => setVisible(PAGE)}
            >
              {t("showLess")}
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
