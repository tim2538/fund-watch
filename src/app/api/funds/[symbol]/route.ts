import { NextResponse } from "next/server";
import { getFund } from "@/lib/scrape";
import {
  FUND_SYMBOLS,
  sliceHistory,
  type FundSymbol,
  type TimeRange,
} from "@/lib/funds";

// Statically generate one JSON file per fund at build time (output: "export").
export const dynamic = "force-static";

export function generateStaticParams() {
  return FUND_SYMBOLS.map((symbol) => ({ symbol }));
}

const RANGES: TimeRange[] = ["1M", "3M", "6M", "YTD", "1Y"];

export async function GET(
  req: Request,
  { params }: { params: { symbol: string } },
) {
  const symbol = params.symbol.toUpperCase() as FundSymbol;
  if (!FUND_SYMBOLS.includes(symbol)) {
    return NextResponse.json({ error: "Unknown fund" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const rangeParam = (searchParams.get("range") ?? "1Y").toUpperCase();
  const range: TimeRange = (RANGES as string[]).includes(rangeParam)
    ? (rangeParam as TimeRange)
    : "1Y";

  const fund = await getFund(symbol);
  const history = sliceHistory(fund.history, range);

  return NextResponse.json(
    { ...fund, range, history },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
  );
}
