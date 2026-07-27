"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

/** Parse a numeric input value, treating empty/invalid as 0. */
function parseNum(v: string): number {
  if (v.trim() === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Number input that shows thousand separators while not focused. */
export function ThousandsInput({
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
      autoComplete="off"
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
