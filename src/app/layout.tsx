import type { Metadata, Viewport } from "next";
import { Sarabun } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n";
import { PortfolioProvider } from "@/lib/portfolio";
import { TransactionsProvider } from "@/lib/transactions";

const sarabun = Sarabun({
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun",
  display: "swap",
});

// NOTE: The manifest <link> and icons are injected by the inline script below
// (not via Next metadata). Next has a known bug where basePath is NOT applied to
// the manifest link (vercel/next.js#56687), so on a project page like /fund-watch
// the browser would fetch /manifest.webmanifest at the domain root (404) and the
// PWA becomes non-installable. Injecting from the real URL is basePath-proof.
export const metadata: Metadata = {
  title: "Fund Watch",
  description:
    "ดูข้อมูลกองทุนรวม NAV กราฟผลการดำเนินงาน และประวัติการจ่ายปันผล",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fund Watch",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020817" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Absolute base for static assets, known at build time. Using this (instead
  // of deriving a directory from location.pathname) means the manifest resolves
  // to /<basePath>/manifest.webmanifest on EVERY route, not just the home page.
  const assetBase = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`;

  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen overflow-x-hidden bg-background antialiased",
          sarabun.variable,
        )}
      >
        {/* (1) Inject the manifest + apple-touch-icon links pointing at the
            build-time basePath root, so they resolve to
            /<basePath>/manifest.webmanifest on every route (Next doesn't apply
            basePath to the manifest link for a project sub-path). (2) Capture
            the install event before React hydrates so the button never misses
            it. */}
        <Script id="pwa-boot" strategy="beforeInteractive">
          {`(function(){try{var base='${assetBase}';document.querySelectorAll('link[rel="manifest"]').forEach(function(n){n.remove();});var m=document.createElement('link');m.rel='manifest';m.href=base+'manifest.webmanifest';document.head.appendChild(m);var a=document.createElement('link');a.rel='apple-touch-icon';a.href=base+'icons/apple-touch-icon.png';document.head.appendChild(a);}catch(e){}window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__deferredInstallPrompt=e;window.dispatchEvent(new Event('pwa-installable'));});})();`}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <PortfolioProvider>
              <TransactionsProvider>{children}</TransactionsProvider>
            </PortfolioProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
