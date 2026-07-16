import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBaht(value: number, digits = 4): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** Format a percentage with an explicit sign (e.g. +12.34% / -5.00%). */
export function formatPercent(value: number, digits = 2): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

/** Format a signed baht amount with a leading + for gains (e.g. +1,234.56). */
export function formatSignedBaht(value: number, digits = 2): string {
  return `${value >= 0 ? "+" : ""}${formatBaht(value, digits)}`;
}

/**
 * Format an ISO date for the given Intl locale.
 * Parses YYYY-MM-DD as a *local* calendar date so the output is identical on
 * server and client regardless of timezone (avoids hydration mismatches).
 */
export function formatDate(iso: string, locale = "en-US"): string {
  if (!iso) return "-";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  const d = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}
