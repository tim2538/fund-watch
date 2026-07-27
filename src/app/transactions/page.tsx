import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { TransactionsView } from "@/components/transactions-view";
import { getAllFunds } from "@/lib/scrape";
import { FUND_SYMBOLS } from "@/lib/funds";

// Statically generated at build time (same as the home page). Fund metadata is
// fetched during the build; the trades themselves live in the browser.
export const dynamic = "force-static";

export default async function TransactionsPage() {
  const funds = await getAllFunds(FUND_SYMBOLS);
  const updatedAt = new Date().toISOString();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-3 sm:px-6">
      <AppHeader updatedAt={updatedAt} />
      {/* useSearchParams() needs a Suspense boundary under static export. */}
      <Suspense>
        <TransactionsView funds={funds} />
      </Suspense>
    </div>
  );
}
