/**
 * Finnomena public API client (LIVE data — no mock).
 *
 * Endpoints used (base = https://www.finnomena.com/fn3/api/fund/v2/public/funds):
 *   GET  {code}                 -> fund metadata (name, risk, category, amc, dividend policy)
 *   GET  {code}/nav/q?range=1Y  -> NAV history  { data.navs: [{ date, value, amount }] }
 *   GET  {code}/dividend        -> dividends     { data.dividends: [{ xd_date, value, pay_date }] }
 *   GET  {code}/portfolio       -> holdings      { data.top_holdings: { data_date, elements: [{ name, percent, color }] } }
 *
 * These are the same public endpoints finnomena.com calls from the browser.
 * If a request fails or returns no NAV history, the fund is returned with
 * `ok: false` so the UI can show an error state instead of fabricated data.
 */

import {
  type FundData,
  type FundSymbol,
  type NavPoint,
  type Dividend,
  type Holding,
} from "@/lib/funds";

const API = "https://www.finnomena.com/fn3/api/fund/v2/public/funds";
const FETCH_TIMEOUT_MS = 8000;
const HISTORY_RANGE = "MAX"; // full window fetched once; UI slices client-side

async function fetchJson<T = any>(url: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "FundWatch/1.0 (+https://example.com)",
      },
      // Server-side ISR: revalidate at most once an hour.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.trim()) return null; // some funds return an empty body (e.g. no dividends)
    return JSON.parse(text) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const iso = (d: string) => new Date(d).toISOString().slice(0, 10);

function parseHistory(navRes: any): NavPoint[] {
  const navs: any[] = navRes?.data?.navs ?? [];
  return navs
    .filter((n) => n && n.date != null && n.value != null)
    .map((n) => ({ date: iso(n.date), nav: Number(n.value) }));
}

function parseDividends(divRes: any): Dividend[] {
  const items: any[] = divRes?.data?.dividends ?? [];
  return items
    .filter((d) => d && d.xd_date)
    .map((d) => ({
      xdDate: iso(d.xd_date),
      payDate: d.pay_date ? iso(d.pay_date) : "",
      amount: Number(d.value),
    }));
}

/** Map a portfolio node ({ data_date, elements: [...] }) to Holding[]. */
function parseElements(node: any): Holding[] {
  const items: any[] = node?.elements ?? [];
  return items
    .filter((e) => e && e.name != null)
    .map((e) => ({
      name: String(e.name),
      percent: Number(e.percent),
      color: typeof e.color === "string" ? e.color : undefined,
    }));
}

const nodeDate = (node: any) => (node?.data_date ? iso(node.data_date) : "");

function fallback(symbol: FundSymbol, meta: any): FundData {
  return {
    symbol,
    fundId: meta?.data?.fund_id ?? "",
    name: meta?.data?.name_th ?? symbol,
    nameEn: meta?.data?.name_en ?? "",
    amc: meta?.data?.amc_name_en ?? "",
    category: meta?.data?.aimc_category_name_th ?? "",
    risk: Number(meta?.data?.risk_spectrum ?? 0),
    dividendPolicy: meta?.data?.dividend_policy ?? "",
    nav: 0,
    change: 0,
    changePercent: 0,
    navDate: "",
    netAssets: Number(meta?.data?.net_assets ?? 0),
    history: [],
    dividends: [],
    topHoldings: [],
    holdingsDate: "",
    assetAllocation: [],
    assetAllocationDate: "",
    sectorBreakdown: [],
    sectorDate: "",
    ok: false,
  };
}

/** Fetch a single fund's live data from Finnomena. */
export async function getFund(symbol: FundSymbol): Promise<FundData> {
  const [meta, navRes, divRes, portRes] = await Promise.all([
    fetchJson(`${API}/${symbol}`),
    fetchJson(`${API}/${symbol}/nav/q?range=${HISTORY_RANGE}`),
    fetchJson(`${API}/${symbol}/dividend`),
    fetchJson(`${API}/${symbol}/portfolio`),
  ]);

  const history = parseHistory(navRes);
  if (history.length < 2) {
    // Without NAV history we cannot show price / change — surface an error state.
    return fallback(symbol, meta);
  }

  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const change = Number((last.nav - prev.nav).toFixed(4));
  const changePercent = Number(((change / prev.nav) * 100).toFixed(2));
  const lastNav = navRes?.data?.navs?.[navRes.data.navs.length - 1];

  return {
    symbol,
    fundId: meta?.data?.fund_id ?? navRes?.data?.fund_id ?? "",
    name: meta?.data?.name_th ?? symbol,
    nameEn: meta?.data?.name_en ?? "",
    amc: meta?.data?.amc_name_en ?? "",
    category: meta?.data?.aimc_category_name_th ?? "",
    risk: Number(meta?.data?.risk_spectrum ?? 0),
    dividendPolicy: meta?.data?.dividend_policy ?? "",
    nav: last.nav,
    change,
    changePercent,
    navDate: last.date,
    netAssets: Number(lastNav?.amount ?? 0),
    history,
    dividends: parseDividends(divRes),
    topHoldings: parseElements(portRes?.data?.top_holdings).slice(0, 5),
    holdingsDate: nodeDate(portRes?.data?.top_holdings),
    assetAllocation: parseElements(portRes?.data?.asset_allocation),
    assetAllocationDate: nodeDate(portRes?.data?.asset_allocation),
    sectorBreakdown: parseElements(portRes?.data?.global_stock_sector),
    sectorDate: nodeDate(portRes?.data?.global_stock_sector),
    ok: true,
  };
}

export async function getAllFunds(symbols: FundSymbol[]): Promise<FundData[]> {
  return Promise.all(symbols.map(getFund));
}
