import { AppFooter, AppHeader } from "@/components/app-header";
import { FundDashboard } from "@/components/fund-dashboard";
import { getAllFunds } from "@/lib/scrape";
import { FUND_SYMBOLS } from "@/lib/funds";

// Revalidate the server render hourly; the PWA service worker serves it offline.
export const revalidate = 3600;

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
