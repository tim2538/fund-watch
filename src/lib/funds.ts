/**
 * Fund domain types + constants.
 *
 * All live data is fetched from the Finnomena public API in `finnomena.ts`.
 * There is no mock data — if a fetch fails, the fund is returned with
 * `ok: false` and the UI shows an error state.
 */

export type FundSymbol = "BKD" | "BSIRICG" | "B-CHINE-EQ";

export type TimeRange = "1M" | "3M" | "6M" | "YTD" | "1Y";

export interface NavPoint {
  date: string; // ISO yyyy-mm-dd
  nav: number;
}

export interface Dividend {
  xdDate: string; // ISO — วันที่ปิดสมุดทะเบียน (XD)
  payDate: string; // ISO — วันที่จ่ายปันผล
  amount: number; // baht per unit
}

export interface FundData {
  symbol: FundSymbol;
  fundId: string;
  name: string; // Thai name
  nameEn: string;
  amc: string; // asset management company
  category: string; // AIMC category (Thai)
  risk: number; // 1-8
  dividendPolicy: string;
  nav: number; // latest NAV
  change: number; // absolute vs previous NAV day
  changePercent: number; // % vs previous NAV day
  navDate: string; // ISO date of latest NAV
  netAssets: number; // latest net asset value (baht)
  history: NavPoint[]; // up to ~1y daily NAV (oldest -> newest)
  dividends: Dividend[]; // newest -> oldest
  ok: boolean; // false when the live fetch failed / no data
}

export const FUND_SYMBOLS: FundSymbol[] = ["BKD", "BSIRICG", "B-CHINE-EQ"];

export const FINNOMENA_URL: Record<FundSymbol, string> = {
  BKD: "https://www.finnomena.com/fund/BKD",
  BSIRICG: "https://www.finnomena.com/fund/BSIRICG",
  "B-CHINE-EQ": "https://www.finnomena.com/fund/B-CHINE-EQ",
};

/** Slice a full history down to the requested range. */
export function sliceHistory(history: NavPoint[], range: TimeRange): NavPoint[] {
  if (!history.length) return history;
  const end = new Date(history[history.length - 1].date);
  let start: Date;
  switch (range) {
    case "1M":
      start = new Date(end);
      start.setMonth(end.getMonth() - 1);
      break;
    case "3M":
      start = new Date(end);
      start.setMonth(end.getMonth() - 3);
      break;
    case "6M":
      start = new Date(end);
      start.setMonth(end.getMonth() - 6);
      break;
    case "YTD":
      start = new Date(end.getFullYear(), 0, 1);
      break;
    case "1Y":
    default:
      start = new Date(end);
      start.setFullYear(end.getFullYear() - 1);
      break;
  }
  return history.filter((p) => new Date(p.date) >= start);
}
