"use client";

import * as React from "react";
import {
  Check,
  HandCoins,
  Pencil,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatBaht, formatDate } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import type { Transaction } from "@/lib/transactions";

/**
 * A single transaction row, shared by the recent-transactions card and the
 * full transactions page. Set `showFund` to display the fund symbol (used on
 * the unfiltered page); pass `onDelete` to render a delete button.
 */
export function TransactionItem({
  tx,
  showFund = false,
  onEdit,
  onDelete,
}: {
  tx: Transaction;
  showFund?: boolean;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
}) {
  const { t, locale } = useI18n();
  const buy = tx.type === "buy";
  const Icon = buy ? ShoppingCart : HandCoins;
  const pricePerUnit = tx.units > 0 ? tx.cost / tx.units : 0;

  // Two-step delete: the trash icon arms the action, then confirm (check) /
  // cancel (cross) replace the edit + delete buttons.
  const [confirming, setConfirming] = React.useState(false);

  return (
    <div className="flex items-center gap-3 py-2.5">
      {/* Large icon badge — only from the sm breakpoint up. */}
      <div
        className={cn(
          "hidden h-9 w-9 shrink-0 items-center justify-center rounded-full sm:flex",
          buy
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/15 text-red-600 dark:text-red-400",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {/* Small inline icon in front of the label — only on small screens. */}
          <Icon
            className={cn(
              "h-3.5 w-3.5 shrink-0 sm:hidden",
              buy
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400",
            )}
          />
          <span
            className={cn(
              "text-sm font-medium",
              buy
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400",
            )}
          >
            {buy ? t("txBuy") : t("txSell")}
          </span>
          {showFund && (
            <Badge variant="outline" className="font-mono text-[10px]">
              {tx.symbol}
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDate(tx.date, locale)}
        </div>
      </div>

      <div className="text-right tabular-nums">
        <div className="text-sm font-semibold">฿{formatBaht(tx.cost, 2)}</div>
        <div className="text-xs text-muted-foreground">
          {tx.units.toLocaleString(locale, { maximumFractionDigits: 4 })}{" "}
          {t("unit")} · {formatBaht(pricePerUnit)}
        </div>
      </div>

      <div className="flex items-center">
        {confirming ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              aria-label={t("confirmDelete")}
              onClick={() => {
                setConfirming(false);
                onDelete?.(tx.id);
              }}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              aria-label={t("cancel")}
              onClick={() => setConfirming(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                aria-label={t("editTransaction")}
                onClick={() => onEdit(tx)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                aria-label={t("txDelete")}
                onClick={() => setConfirming(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
