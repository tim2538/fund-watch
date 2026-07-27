import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Configured basePath (e.g. "/fund-watch" on GitHub Pages, "" locally). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Build a base-path-aware, trailing-slash URL for use in plain <a> tags.
 *
 * We deliberately use full-page navigation (not next/link soft navigation) for
 * cross-route links: on a static host like GitHub Pages, App Router client-side
 * navigation can't fetch a route's RSC payload (the host ignores the RSC header
 * and returns HTML), so soft-navigating to a build-time data page renders it
 * without its baked data. A hard navigation always loads the correct static
 * HTML. `path` should start with "/"; an optional query string is preserved.
 */
export function appHref(path: string): string {
  const [pathname, query] = path.split("?");
  const withSlash = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return `${BASE_PATH}${withSlash}${query ? `?${query}` : ""}`;
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

/** Local-time timestamp for filenames, e.g. 202607251655 (YYYYMMDDHHmm). */
export function fileStamp(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `${p(d.getHours())}${p(d.getMinutes())}`
  );
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
