import { NextResponse } from "next/server";
import { getAllFunds } from "@/lib/scrape";
import { FUND_SYMBOLS } from "@/lib/funds";

// Rendered to a static JSON file at build time (compatible with output: "export").
export const dynamic = "force-static";

export async function GET() {
  const funds = await getAllFunds(FUND_SYMBOLS);
  return NextResponse.json(
    { funds, updatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
  );
}
