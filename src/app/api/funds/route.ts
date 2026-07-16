import { NextResponse } from "next/server";
import { getAllFunds } from "@/lib/scrape";
import { FUND_SYMBOLS } from "@/lib/funds";

// Refresh on the server at most once an hour; still works offline via SW cache.
export const revalidate = 3600;

export async function GET() {
  const funds = await getAllFunds(FUND_SYMBOLS);
  return NextResponse.json(
    { funds, updatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
  );
}
