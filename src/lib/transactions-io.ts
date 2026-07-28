/**
 * File-based import / export for transactions.
 *
 * Transactions are a growing, flat list of dated buy / sell events — too much
 * data to fit in the portfolio QR code (see manage-data-dialog.tsx), so they
 * get their own file mechanism. CSV is the primary format (editable in Excel /
 * Google Sheets); JSON exported by this app is also accepted on import.
 *
 * Columns: id,symbol,type,date,cost,units — `id` is optional on import (a fresh
 * id is generated when it's missing or collides).
 */

import { FUND_SYMBOLS, type FundSymbol } from "@/lib/funds";
import type { Transaction, TransactionType } from "@/lib/transactions";

/** A transaction parsed from a file: same shape as Transaction, id optional. */
export type ImportedTransaction = Omit<Transaction, "id"> & { id?: string };

export const TX_CSV_HEADERS = [
  "id",
  "symbol",
  "type",
  "date",
  "cost",
  "units",
] as const;

function isFundSymbol(v: unknown): v is FundSymbol {
  return (FUND_SYMBOLS as string[]).includes(v as string);
}

/** Validate + coerce a loose record (CSV yields strings) into a candidate. */
function toCandidate(rec: Record<string, unknown>): ImportedTransaction | null {
  const symbol = rec.symbol;
  const type = rec.type;
  const date = rec.date;
  const cost = typeof rec.cost === "string" ? Number(rec.cost) : rec.cost;
  const units = typeof rec.units === "string" ? Number(rec.units) : rec.units;
  const id = rec.id;

  if (
    isFundSymbol(symbol) &&
    (type === "buy" || type === "sell") &&
    typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}/.test(date) &&
    typeof cost === "number" &&
    Number.isFinite(cost) &&
    cost >= 0 &&
    typeof units === "number" &&
    Number.isFinite(units) &&
    units >= 0
  ) {
    const out: ImportedTransaction = {
      symbol,
      type: type as TransactionType,
      date: date.slice(0, 10),
      cost,
      units,
    };
    if (typeof id === "string" && id.trim()) out.id = id.trim();
    return out;
  }
  return null;
}

/** Quote a CSV field only when it contains a comma, quote, or newline. */
function escapeCsv(s: string): string {
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Serialize transactions to CSV text (with a header row, CRLF line endings). */
export function transactionsToCsv(txs: Transaction[]): string {
  const lines = [TX_CSV_HEADERS.join(",")];
  for (const t of txs) {
    lines.push(
      [t.id, t.symbol, t.type, t.date, String(t.cost), String(t.units)]
        .map(escapeCsv)
        .join(","),
    );
  }
  return lines.join("\r\n") + "\r\n";
}

/** Serialize transactions to a JSON backup wrapper. */
export function transactionsToJson(txs: Transaction[]): string {
  return JSON.stringify(
    { app: "fund-watch", kind: "transactions", v: 1, data: txs },
    null,
    2,
  );
}

/** Split one CSV line, honoring double-quoted fields with "" escapes. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

/** Parse CSV text into loose records keyed by (lower-cased) header names. */
function parseCsv(text: string): Record<string, unknown>[] {
  const lines = text
    .split(/\r\n|\n|\r/)
    .filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: Record<string, unknown>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const rec: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      rec[h] = cells[idx]?.trim() ?? "";
    });
    rows.push(rec);
  }
  return rows;
}

/** Pull the transaction array out of any JSON shape we might export. */
function parseJson(text: string): Record<string, unknown>[] {
  const parsed = JSON.parse(text) as unknown;
  let arr: unknown = parsed;
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const obj = parsed as Record<string, unknown>;
    arr = obj.data ?? obj.transactions ?? [];
  }
  if (!Array.isArray(arr)) return [];
  return arr.filter(
    (v): v is Record<string, unknown> => !!v && typeof v === "object",
  );
}

/**
 * Parse a file's text (CSV or JSON, auto-detected) into validated candidates.
 * Invalid rows are silently dropped.
 */
export function parseTransactionsText(text: string): ImportedTransaction[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  let rows: Record<string, unknown>[] = [];
  try {
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      rows = parseJson(trimmed);
    } else {
      rows = parseCsv(text);
    }
  } catch {
    return [];
  }
  const out: ImportedTransaction[] = [];
  for (const r of rows) {
    const c = toCandidate(r);
    if (c) out.push(c);
  }
  return out;
}
