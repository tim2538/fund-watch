import type { MetadataRoute } from "next";

// Generated at build time. All paths include the deployment basePath so the
// PWA installs correctly on a GitHub Pages project site (e.g. /fund-watch).
const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fund Watch — กองทุนรวม",
    short_name: "Fund Watch",
    description:
      "ดูข้อมูลกองทุนรวม NAV กราฟผลการดำเนินงาน และประวัติการจ่ายปันผล (BKD, BSIRICG, B-CHINE-EQ)",
    id: `${bp}/`,
    start_url: `${bp}/`,
    scope: `${bp}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: "#10b981",
    lang: "th",
    categories: ["finance", "productivity"],
    icons: [
      { src: `${bp}/icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${bp}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${bp}/icons/maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
