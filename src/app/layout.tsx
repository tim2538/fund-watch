import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n";

// NOTE: The manifest <link> and icons are injected by the inline script below
// (not via Next metadata). Next has a known bug where basePath is NOT applied to
// the manifest link (vercel/next.js#56687), so on a project page like /fund-watch
// the browser would fetch /manifest.webmanifest at the domain root (404) and the
// PWA becomes non-installable. Injecting from the real URL is basePath-proof.
export const metadata: Metadata = {
  title: "Fund Watch — ดูข้อมูลกองทุนรวม",
  description:
    "ดู NAV กราฟผลการดำเนินงาน และประวัติการจ่ายปันผลของกองทุน BKD, BSIRICG และ B-CHINE-EQ",
  applicationName: "Fund Watch",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fund Watch",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
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
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        {/* (1) Inject the manifest + apple-touch-icon links pointing at the
            *actual* URL directory, so they resolve under any basePath
            (e.g. /fund-watch/manifest.webmanifest) — Next doesn't do this
            correctly for a project sub-path. (2) Capture the install event
            before React hydrates so the button never misses it. */}
        <Script id="pwa-boot" strategy="beforeInteractive">
          {`(function(){try{var dir=location.pathname.replace(/[^\\/]*$/,'');document.querySelectorAll('link[rel="manifest"]').forEach(function(n){n.remove();});var m=document.createElement('link');m.rel='manifest';m.href=dir+'manifest.webmanifest';document.head.appendChild(m);var a=document.createElement('link');a.rel='apple-touch-icon';a.href=dir+'icons/apple-touch-icon.png';document.head.appendChild(a);}catch(e){}window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__deferredInstallPrompt=e;window.dispatchEvent(new Event('pwa-installable'));});})();`}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
