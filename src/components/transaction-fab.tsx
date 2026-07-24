"use client";

/**
 * Floating action button (bottom-right) that opens the add-transaction bottom
 * sheet. Fixed to the viewport so it stays reachable while scrolling; sits
 * above the sheet's own z-index only when closed.
 */

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddTransactionSheet } from "@/components/add-transaction-sheet";
import { useI18n } from "@/lib/i18n";
import type { FundData, FundSymbol } from "@/lib/funds";

export function TransactionFab({
  funds,
  selectedSymbol,
}: {
  funds: FundData[];
  selectedSymbol: FundSymbol;
}) {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label={t("addTransaction")}
        title={t("addTransaction")}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 [&_svg]:size-6"
      >
        <Plus />
      </Button>

      <AddTransactionSheet
        funds={funds}
        open={open}
        onOpenChange={setOpen}
        defaultSymbol={selectedSymbol}
      />
    </>
  );
}
