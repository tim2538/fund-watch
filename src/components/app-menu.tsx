"use client";

import * as React from "react";
import { ArrowLeftRight, Database, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SettingsDialog } from "@/components/settings-dialog";
import { ManageDataDialog } from "@/components/manage-data-dialog";
import { useTransactionsDialog } from "@/components/transactions-dialog";
import { useI18n } from "@/lib/i18n";

export function AppMenu() {
  const { t } = useI18n();
  const { open: openTransactions } = useTransactionsDialog();
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [dataOpen, setDataOpen] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="bg-card"
            aria-label={t("menu")}
          >
            <Menu className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => openTransactions()}>
            <ArrowLeftRight className="h-4 w-4" />
            {t("transactions")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setDataOpen(true)}>
            <Database className="h-4 w-4" />
            {t("manageData")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4" />
            {t("settings")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ManageDataDialog open={dataOpen} onOpenChange={setDataOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
