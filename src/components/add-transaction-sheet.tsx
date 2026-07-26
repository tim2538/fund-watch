"use client";

/**
 * Bottom sheet for logging a buy / sell transaction. Built on the shadcn Sheet
 * (side="bottom"), which slides up from the bottom edge and handles the
 * backdrop, Escape, focus trap and scroll lock.
 *
 * On submit it always records the transaction (so it can be plotted on the NAV
 * chart in "My portfolio" mode). If "update portfolio" is checked, it also
 * folds the trade into the aggregate portfolio position: a buy adds cost +
 * units, a sell subtracts them (clamped at zero).
 *
 * The form lives in an inner <SheetForm>. Radix unmounts closed Dialog content,
 * so it re-mounts on every open and its state — including the initial fund — is
 * initialised fresh from `defaultSymbol` each time. It is rendered unconditionally
 * (not gated on `open`) so it stays mounted through the slide-out animation.
 */

import * as React from "react";
import { CalendarIcon, HandCoins, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { th as thLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { usePortfolio } from "@/lib/portfolio";
import { useTransactions, type TransactionType } from "@/lib/transactions";
import type { FundData, FundSymbol } from "@/lib/funds";

/** A Date as a local yyyy-mm-dd string (timezone-safe, for storage). */
function toISODate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

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
  id,
}: {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  id?: string;
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
      id={id}
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

/** The actual form — remounted on each open, so state starts fresh. */
function SheetForm({
  funds,
  defaultSymbol,
  onClose,
}: {
  funds: FundData[];
  defaultSymbol: FundSymbol;
  onClose: () => void;
}) {
  const { t, lang, locale } = useI18n();
  const { entries, setEntry } = usePortfolio();
  const { addTransaction } = useTransactions();

  const [symbol, setSymbol] = React.useState<FundSymbol>(defaultSymbol);
  const [type, setType] = React.useState<TransactionType>("buy");
  const [date, setDate] = React.useState<Date>(() => new Date());
  const [dateOpen, setDateOpen] = React.useState(false);
  const [cost, setCost] = React.useState(0);
  const [units, setUnits] = React.useState(0);
  const [updatePortfolio, setUpdatePortfolio] = React.useState(false);

  const valid = cost > 0 && units > 0 && !!date;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;

    addTransaction({ symbol, type, date: toISODate(date), cost, units });

    if (updatePortfolio) {
      const cur = entries[symbol] ?? { cost: 0, units: 0 };
      const sign = type === "buy" ? 1 : -1;
      setEntry(symbol, {
        cost: Math.max(0, cur.cost + sign * cost),
        units: Math.max(0, cur.units + sign * units),
      });
    }

    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 overflow-y-auto px-5 pb-6 pt-1"
    >
      {/* Fund */}
      <div className="space-y-1.5">
        <Label htmlFor="tx-fund" className="text-muted-foreground">
          {t("txFund")}
        </Label>
        <Select value={symbol} onValueChange={(v) => setSymbol(v as FundSymbol)}>
          <SelectTrigger id="tx-fund" className="font-mono">
            {/* Render the symbol directly so the trigger always shows the
                selected fund without depending on Radix's item-text
                registration from the closed content portal. */}
            <span>{symbol}</span>
          </SelectTrigger>
          <SelectContent>
            {funds.map((f) => (
              <SelectItem key={f.symbol} value={f.symbol} className="font-mono">
                {f.symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Buy / Sell */}
      <div className="space-y-1.5">
        <Label className="text-muted-foreground">{t("txType")}</Label>
        <ToggleGroup
          type="single"
          value={type}
          onValueChange={(v) => v && setType(v as TransactionType)}
          variant="outline"
          className="grid grid-cols-2 gap-2"
        >
          <ToggleGroupItem
            value="buy"
            className="h-11 data-[state=on]:border-emerald-500/50 data-[state=on]:bg-emerald-500/15 data-[state=on]:text-emerald-600 dark:data-[state=on]:text-emerald-400"
          >
            <ShoppingCart className="h-4 w-4" />
            {t("txBuy")}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="sell"
            className="h-11 data-[state=on]:border-red-500/50 data-[state=on]:bg-red-500/15 data-[state=on]:text-red-600 dark:data-[state=on]:text-red-400"
          >
            <HandCoins className="h-4 w-4" />
            {t("txSell")}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <Label className="text-muted-foreground">{t("txDate")}</Label>
        {/* `modal` is required here: inside the Sheet (a modal Dialog) the body
            has pointer-events disabled, and only a modal layer re-enables them
            for its own content — without it the calendar isn't clickable. */}
        <Popover open={dateOpen} onOpenChange={setDateOpen} modal>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full justify-between gap-2 px-3 font-normal"
            >
              <span>
                {date.toLocaleDateString(locale, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              locale={lang === "th" ? thLocale : undefined}
              selected={date}
              onSelect={(d) => {
                if (d) setDate(d);
                setDateOpen(false);
              }}
              disabled={{ after: new Date() }}
              defaultMonth={date}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Amount + Units */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="tx-amount" className="text-muted-foreground">
            {t("txAmount")}
          </Label>
          <ThousandsInput id="tx-amount" value={cost} onChange={setCost} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tx-units" className="text-muted-foreground">
            {t("txUnits")}
          </Label>
          <ThousandsInput id="tx-units" value={units} onChange={setUnits} />
        </div>
      </div>

      {/* Update portfolio */}
      <Label
        htmlFor="tx-update"
        className="flex cursor-pointer items-start gap-2.5 rounded-md border border-input p-3 font-normal"
      >
        <Checkbox
          id="tx-update"
          checked={updatePortfolio}
          onCheckedChange={(c) => setUpdatePortfolio(c === true)}
          className="mt-0.5"
        />
        <span className="min-w-0">
          <span className="block text-sm font-medium">
            {t("txUpdatePortfolio")}
          </span>
          <span className="block text-xs text-muted-foreground">
            {t("txUpdatePortfolioHint")}
          </span>
        </span>
      </Label>

      <Button
        type="submit"
        disabled={!valid}
        className={cn(
          "h-10 w-full text-white",
          type === "buy"
            ? "bg-emerald-600 hover:bg-emerald-700"
            : "bg-red-600 hover:bg-red-700",
        )}
      >
        {type === "buy" ? <ShoppingCart /> : <HandCoins />}
        {t("txAdd")}
      </Button>
    </form>
  );
}

export function AddTransactionSheet({
  funds,
  open,
  onOpenChange,
  defaultSymbol,
}: {
  funds: FundData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSymbol: FundSymbol;
}) {
  const { t } = useI18n();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef({ active: false, startY: 0, dy: 0 });

  // Drag-to-dismiss on the grab handle: follow the finger downward, then either
  // snap back (short drag) or slide the sheet off-screen and close it.
  const CLOSE_THRESHOLD = 100; // px dragged before a release closes the sheet

  const handlePointerDown = (e: React.PointerEvent) => {
    const el = contentRef.current;
    if (!el) return;
    drag.current = { active: true, startY: e.clientY, dy: 0 };
    el.style.transition = "none";
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const el = contentRef.current;
    if (!drag.current.active || !el) return;
    const dy = Math.max(0, e.clientY - drag.current.startY);
    drag.current.dy = dy;
    el.style.transform = `translateY(${dy}px)`;
  };

  const handlePointerUp = () => {
    const el = contentRef.current;
    if (!drag.current.active || !el) return;
    const { dy } = drag.current;
    drag.current.active = false;
    el.style.transition = "transform 220ms ease-out";

    if (dy > CLOSE_THRESHOLD) {
      // Drive the close ourselves and suppress Radix's exit animation so it
      // doesn't fight our transform. The node unmounts on close, so this inline
      // style never leaks into the next open.
      el.style.animation = "none";
      el.style.transform = "translateY(100%)";
      window.setTimeout(() => onOpenChange(false), 200);
    } else {
      el.style.transform = "translateY(0px)";
      // Snap back, then clear our inline overrides so Radix regains control.
      // Note: we must NOT touch `animation` here — the sheet is still
      // data-state=open, so re-applying the class animation would replay the
      // slide-in-from-bottom enter and make the sheet look freshly opened.
      window.setTimeout(() => {
        if (!contentRef.current) return;
        contentRef.current.style.transition = "";
        contentRef.current.style.transform = "";
      }, 240);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        ref={contentRef}
        side="bottom"
        className="mx-auto flex max-h-[90vh] max-w-lg flex-col gap-0 rounded-t-2xl p-0"
      >
        {/* Grab handle — drag down to dismiss */}
        <div
          className="flex touch-none cursor-grab justify-center pb-1 pt-2.5 active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <span className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        <SheetHeader className="px-5 pb-3 pt-2">
          <SheetTitle>{t("addTransaction")}</SheetTitle>
          <SheetDescription>{t("addTransactionDesc")}</SheetDescription>
        </SheetHeader>

        {/* Rendered unconditionally so the form stays mounted through the
            slide-out animation (gating on `open` would collapse the sheet to the
            handle before it finishes sliding down). Radix unmounts the Content
            on close, so state still re-initialises fresh on every open. */}
        <SheetForm
          funds={funds}
          defaultSymbol={defaultSymbol}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
