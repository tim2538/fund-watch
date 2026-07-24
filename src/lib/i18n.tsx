"use client";

/**
 * Tiny i18n layer (EN default, TH). No external deps.
 * - `useI18n()` returns { lang, setLang, t, locale }
 * - `t(key, params?)` looks up a string and interpolates {placeholders}
 * - choice is persisted in localStorage; default is "en"
 */

import * as React from "react";

export type Lang = "en" | "th";

type Dict = Record<string, string>;

const en: Dict = {
  installApp: "Install app",
  iosInstallHint:
    'To install: tap the Share button, then choose "Add to Home Screen".',
  menu: "Menu",
  settings: "Settings",
  settingsDesc: "Customize appearance, language, and view mode",
  manageData: "Manage data",
  manageDataDesc:
    "Back up or transfer your portfolio, fund order, and hidden funds via QR code",
  exportTab: "Export",
  importTab: "Import",
  exportHint:
    "Scan this QR code from another device, or save it as a backup image.",
  exportEmpty: "No data to export yet. Set up your portfolio first.",
  saveQr: "Save QR image",
  importScan: "Scan with camera",
  importUpload: "Upload QR image",
  importStopScan: "Stop camera",
  importScanHint: "Point your camera at the QR code.",
  importSuccess: "Data imported successfully.",
  importError: "Couldn't read a valid Fund Watch QR code.",
  importCameraError:
    "Couldn't access the camera. Try uploading an image instead.",
  importReplaceWarning:
    "Importing replaces your current portfolio, fund order, and hidden funds.",
  preference: "Preference",
  appearance: "Appearance",
  themeLight: "Light",
  themeDark: "Dark",
  themeSystem: "System",
  language: "Language",
  viewMode: "View mode",

  overview: "Fund Overview",
  liveData: "Live data from Finnomena",
  updated: "Updated {time}",
  footer:
    "NAV / dividend data from Finnomena · For tracking only, not investment advice",

  risk: "Risk {n}",
  live: "Live",
  na: "N/A",
  loadFailed: "Failed to load data",
  perUnit: "THB/unit",
  today: "today",
  asOf: "as of {date}",
  dividendLabel: "Dividend",

  navHistory: "NAV Price History",
  navHistoryDesc: "Select a time range to view the NAV trend",
  topHoldings: "Top 5 Holdings",
  topHoldingsDesc: "Largest positions by % of net assets",
  noHoldings: "No holdings data available",
  holdingsOthers: "Others",
  top5: "Top 5",
  assetAllocation: "Asset Allocation",
  assetAllocationDesc: "Breakdown by asset type (% of net assets)",
  sectorBreakdown: "Sector Breakdown",
  sectorDesc: "By industry sector of invested securities",
  noData: "No data available",
  dividendHistory: "Dividend History",
  dividendHistoryDesc:
    "Register-close date, payment date and dividend per unit",
  navAsOf: "NAV as of {date}",
  viewSource: "View source on Finnomena",
  loadErrorTitle: "{symbol} — failed to load",
  loadErrorDesc:
    "Couldn't fetch data from Finnomena right now. Try refreshing.",

  colXd: "Register Close",
  colPay: "Payment Date",
  colAmount: "Dividend (THB/unit)",
  total: "Total",
  noDividend: "This fund has no dividend history",
  loadMore: "Load more",
  showLess: "Show less",

  // Portfolio / display mode
  myPortfolio: "My portfolio",
  portfolioDesc: "Enter your cost and units per fund to see your own return",
  displayMode: "Display mode",
  modeMarket: "Market",
  modePortfolio: "My portfolio",
  costLabel: "Cost (THB)",
  unitsLabel: "Units",
  currentValue: "Current value",
  cost: "Cost",
  profit: "Profit/Loss",
  yourReturn: "Your return",
  avgCost: "Avg cost/unit",
  setupPortfolio: "Set up portfolio",
  clear: "Clear",
  close: "Close",
  manageFunds: "Manage funds",
  moveUp: "Move up",
  moveDown: "Move down",
  hideFund: "Hide fund",
  showFund: "Show fund",
  hiddenLabel: "Hidden",

  // Transactions
  addTransaction: "Add transaction",
  addTransactionDesc: "Record a buy or sell trade for one of your funds",
  txFund: "Fund",
  txType: "Type",
  txBuy: "Buy",
  txSell: "Sell",
  txDate: "Date",
  txAmount: "Amount (THB)",
  txUnits: "Units",
  txUpdatePortfolio: "Update portfolio",
  txUpdatePortfolioHint: "Buy adds to cost and units, sell subtracts",
  txAdd: "Add transaction",
};

const th: Dict = {
  installApp: "ติดตั้งแอป",
  iosInstallHint: 'วิธีติดตั้ง: แตะปุ่มแชร์ แล้วเลือก "เพิ่มไปยังหน้าจอโฮม"',
  menu: "เมนู",
  settings: "ตั้งค่า",
  settingsDesc: "ปรับแต่งธีม ภาษา และมุมมอง",
  manageData: "จัดการข้อมูล",
  manageDataDesc:
    "สำรองหรือย้ายข้อมูลพอร์ต ลำดับกองทุน และกองทุนที่ซ่อน ผ่าน QR code",
  exportTab: "ส่งออก",
  importTab: "นำเข้า",
  exportHint: "สแกน QR code นี้จากอีกเครื่อง หรือบันทึกเป็นรูปสำรองข้อมูลไว้",
  exportEmpty: "ยังไม่มีข้อมูลให้ส่งออก ตั้งค่าพอร์ตของคุณก่อน",
  saveQr: "บันทึกรูป QR",
  importScan: "สแกนด้วยกล้อง",
  importUpload: "อัปโหลดรูป QR",
  importStopScan: "ปิดกล้อง",
  importScanHint: "หันกล้องไปที่ QR code",
  importSuccess: "นำเข้าข้อมูลสำเร็จ",
  importError: "อ่าน QR code ของ Fund Watch ไม่สำเร็จ",
  importCameraError: "เข้าถึงกล้องไม่สำเร็จ ลองอัปโหลดรูปแทน",
  importReplaceWarning:
    "การนำเข้าจะแทนที่ข้อมูลพอร์ต ลำดับกองทุน และกองทุนที่ซ่อนในปัจจุบัน",
  preference: "การตั้งค่า",
  appearance: "ธีม",
  themeLight: "สว่าง",
  themeDark: "มืด",
  themeSystem: "ตามระบบ",
  language: "ภาษา",
  viewMode: "มุมมอง",

  overview: "ภาพรวมกองทุน",
  liveData: "ข้อมูลจริงจาก Finnomena",
  updated: "อัปเดต {time}",
  footer:
    "ข้อมูล NAV / ปันผล จาก Finnomena · เพื่อการติดตามเท่านั้น ไม่ใช่คำแนะนำการลงทุน",

  risk: "ความเสี่ยง {n}",
  live: "ข้อมูลจริง",
  na: "N/A",
  loadFailed: "โหลดข้อมูลไม่สำเร็จ",
  perUnit: "บาท/หน่วย",
  today: "วันนี้",
  asOf: "ณ วันที่ {date}",
  dividendLabel: "ปันผล",

  navHistory: "กราฟราคา NAV ย้อนหลัง",
  navHistoryDesc: "เลือกช่วงเวลาเพื่อดูแนวโน้มราคาต่อหน่วย",
  topHoldings: "5 อันดับหลักทรัพย์ที่ถือครอง",
  topHoldingsDesc: "สัดส่วนการลงทุนสูงสุด (% ของมูลค่าทรัพย์สินสุทธิ)",
  noHoldings: "ไม่มีข้อมูลสัดส่วนการลงทุน",
  holdingsOthers: "อื่นๆ",
  top5: "5 อันดับแรก",
  assetAllocation: "สัดส่วนการลงทุน",
  assetAllocationDesc: "แบ่งตามประเภทสินทรัพย์ (% ของมูลค่าทรัพย์สินสุทธิ)",
  sectorBreakdown: "กลุ่มประเภทตราสารทุน/ตราสารหนี้ที่ลงทุน",
  sectorDesc: "แบ่งตามกลุ่มอุตสาหกรรมของหลักทรัพย์ที่ลงทุน",
  noData: "ไม่มีข้อมูล",
  dividendHistory: "ประวัติการจ่ายเงินปันผล",
  dividendHistoryDesc:
    "วันปิดสมุดทะเบียน, วันที่จ่าย และจำนวนเงินปันผลต่อหน่วย",
  navAsOf: "NAV ณ {date}",
  viewSource: "ดูข้อมูลต้นทางบน Finnomena",
  loadErrorTitle: "{symbol} — โหลดข้อมูลไม่สำเร็จ",
  loadErrorDesc:
    "ไม่สามารถดึงข้อมูลจาก Finnomena ได้ในขณะนี้ ลองรีเฟรชอีกครั้ง",

  colXd: "วันปิดสมุดทะเบียน",
  colPay: "วันที่จ่าย",
  colAmount: "เงินปันผล (บาท/หน่วย)",
  total: "รวมทั้งหมด",
  noDividend: "กองทุนนี้ไม่มีประวัติการจ่ายเงินปันผล",
  loadMore: "ดูเพิ่มเติม",
  showLess: "ย่อลง",

  // Portfolio / display mode
  myPortfolio: "พอร์ตของฉัน",
  portfolioDesc:
    "กรอกต้นทุนและจำนวนหน่วยของแต่ละกองทุนเพื่อดูผลตอบแทนของคุณเอง",
  displayMode: "โหมดแสดงผล",
  modeMarket: "ตลาด",
  modePortfolio: "พอร์ตของฉัน",
  costLabel: "ต้นทุน (บาท)",
  unitsLabel: "จำนวนหน่วย",
  currentValue: "มูลค่าปัจจุบัน",
  cost: "ต้นทุน",
  profit: "กำไร/ขาดทุน",
  yourReturn: "ผลตอบแทนของคุณ",
  avgCost: "ต้นทุนเฉลี่ย/หน่วย",
  setupPortfolio: "ตั้งค่าพอร์ต",
  clear: "ล้าง",
  close: "ปิด",
  manageFunds: "จัดการกองทุน",
  moveUp: "เลื่อนขึ้น",
  moveDown: "เลื่อนลง",
  hideFund: "ซ่อนกองทุน",
  showFund: "แสดงกองทุน",
  hiddenLabel: "ซ่อนอยู่",

  // Transactions
  addTransaction: "เพิ่มรายการซื้อขาย",
  addTransactionDesc: "บันทึกการซื้อหรือขายกองทุนของคุณ",
  txFund: "กองทุน",
  txType: "ประเภท",
  txBuy: "ซื้อ",
  txSell: "ขาย",
  txDate: "วันที่",
  txAmount: "จำนวนเงิน (บาท)",
  txUnits: "จำนวนหน่วย",
  txUpdatePortfolio: "อัปเดตพอร์ต",
  txUpdatePortfolioHint: "ซื้อเพิ่มต้นทุนและจำนวนหน่วย ขายหักออก",
  txAdd: "เพิ่มรายการ",
};

const DICTS: Record<Lang, Dict> = { en, th };

type Params = Record<string, string | number>;

function interpolate(s: string, params?: Params) {
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) =>
    params[k] != null ? String(params[k]) : `{${k}}`,
  );
}

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof en, params?: Params) => string;
  locale: string; // Intl locale (en-US | th-TH)
}

const I18nContext = React.createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("en");

  React.useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem("lang")
        : null;
    if (saved === "en" || saved === "th") setLangState(saved);
  }, []);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem("lang", l);
      document.documentElement.lang = l;
    } catch {
      /* ignore */
    }
  }, []);

  const t = React.useCallback<I18nValue["t"]>(
    (key, params) =>
      interpolate(DICTS[lang][key] ?? en[key] ?? String(key), params),
    [lang],
  );

  const value = React.useMemo<I18nValue>(
    () => ({ lang, setLang, t, locale: lang === "en" ? "en-US" : "th-TH" }),
    [lang, setLang, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}
