import { AppFooter, AppHeader } from "@/components/app-header";
import { FundDashboard } from "@/components/fund-dashboard";
import { getAllFunds } from "@/lib/scrape";
import { FUND_SYMBOLS } from "@/lib/funds";

// Statically generated at build time. Data is fetched from Finnomena during the
// build, so re-run the deploy (or the scheduled workflow) to refresh it.
export const dynamic = "force-static";

export default async function Home() {
  const funds = await getAllFunds(FUND_SYMBOLS);
  const updatedAt = new Date().toISOString();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">
      <AppHeader updatedAt={updatedAt} />
      <FundDashboard funds={funds} />
      <AppFooter />
    </div>
  );
}
