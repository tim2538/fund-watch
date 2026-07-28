# Fund Watch — PWA ดูข้อมูลกองทุนรวม

เว็บแอปพลิเคชัน (PWA) สำหรับติดตามข้อมูลกองทุนรวม **11 กองทุน** — BKD, BSIRICG, B-CHINE-EQ,
BFIXED, B-INNOTECH, SCBSET50, BCARERMF, BBASICRMF, BEQSSF, B-FUTURESSF, B-EQUITY —
พร้อมบันทึกพอร์ตการลงทุนและรายการซื้อ/ขายของตัวเอง โดยดึงข้อมูลกองทุน **ของจริง** จาก Finnomena

สร้างด้วย **Next.js (App Router, static export)** + **shadcn/ui** + **Tailwind CSS** + **Recharts** + **next-themes**
และตั้งค่า PWA ด้วย **@ducanh2912/next-pwa** (manifest, service worker, icons, offline, Add to Home Screen)
ข้อมูลผู้ใช้ทั้งหมดเก็บใน **localStorage** ของเบราว์เซอร์ ไม่มีเซิร์ฟเวอร์ backend

> หมายเหตุ: ข้อมูลในแอปนี้ไม่ใช่คำแนะนำการลงทุน

## รายการฟีเจอร์ (Features)

### ดูข้อมูลกองทุน

- **11 กองทุน** สลับดูได้ผ่าน Tabs (เลื่อนแนวนอนได้บนจอเล็ก)
- **การ์ดสรุป** ต่อกองทุน — NAV ล่าสุด, การเปลี่ยนแปลง (บาท + %), มูลค่าทรัพย์สินสุทธิ, ระดับความเสี่ยง (1–8), หมวด AIMC, บลจ., นโยบายปันผล
- **กราฟ NAV ย้อนหลัง** (Recharts) เลือกช่วงเวลา **1M / 3M / 6M / YTD / 1Y / 3Y / 5Y / 10Y / MAX**
- **ตารางประวัติปันผล** — มีแถว "รวมทั้งหมด" บนสุด, แสดง 5 รายการล่าสุด แล้วกด "ดูเพิ่มเติม" เพื่อโหลดต่อ
- **สัดส่วนพอร์ตกองทุน (Donut breakdown)** — สัดส่วนการลงทุนตามประเภทสินทรัพย์ และกลุ่มอุตสาหกรรม
- **หลักทรัพย์ที่ถือมากสุด (Top holdings)** — 5 อันดับแรก พร้อมวันที่รายงาน

### พอร์ตการลงทุนส่วนตัว

- **บันทึกพอร์ต** ต่อกองทุน — กรอกเงินต้นทุน (บาท) และจำนวนหน่วย แล้วระบบคำนวณ มูลค่าปัจจุบัน, กำไร/ขาดทุน, % ผลตอบแทน, ต้นทุนเฉลี่ยต่อหน่วย
- **โหมดแสดงผล (View mode)** สลับระหว่าง **Market** (การเปลี่ยนแปลง NAV รายวัน) และ **My portfolio** (ผลตอบแทนของคุณเอง)
- **รายการซื้อ/ขาย (Transactions)** — บันทึกรายการซื้อ/ขายรายครั้ง (วันที่, จำนวนเงิน, จำนวนหน่วย) ผ่านปุ่มลอย (FAB) และ bottom sheet; ในโหมด My portfolio จะพล็อตแต่ละรายการเป็นจุดบนกราฟ NAV
- **จัดลำดับ / ซ่อนกองทุน** — เลือกลำดับการแสดงและซ่อนกองทุนที่ไม่สนใจได้

### นำเข้า / ส่งออกข้อมูล

- **QR code สำหรับพอร์ต** — ส่งออกพอร์ต + ลำดับ + รายการซ่อน เป็น QR (สร้างด้วย `qrcode`) และนำเข้าด้วยการสแกนกล้อง หรืออัปโหลดรูป QR (ถอดรหัสด้วย `jsqr`) — ย้ายข้อมูลข้ามเครื่องได้โดยไม่ต้องมีบัญชี
- **ไฟล์สำหรับรายการซื้อ/ขาย** — นำเข้า/ส่งออกเป็น **CSV** (แก้ใน Excel / Google Sheets ได้) หรือ JSON คอลัมน์: `id,symbol,type,date,cost,units`

### PWA & UX

- **ติดตั้งเป็นแอป** (Add to Home Screen) — มีปุ่ม "ติดตั้งแอป" บนเดสก์ท็อปที่รองรับ, ทำงาน offline ผ่าน service worker + หน้า `offline.html`
- **ธีม Light / Dark / System** (next-themes)
- **สองภาษา EN / TH** (ระบบ i18n เอง จำค่าผ่าน localStorage, ค่าเริ่มต้น EN)
- ปรับ layout สำหรับมือถือ, ตัวเลือกในเมนู hamburger มุมขวาบน

## เริ่มใช้งาน

```bash
npm install
npm run dev      # เปิด http://localhost:3000
```

Build โปรดักชัน (service worker ทำงานเฉพาะโหมด production):

```bash
npm run build    # export เป็น static ไปที่ ./out
npm run start
```

## โครงสร้างโฟลเดอร์

```
.
├── next.config.mjs          # Next.js static export + next-pwa + basePath (สำหรับ GitHub Pages)
├── tailwind.config.ts       # ธีม shadcn (สี, radius, dark mode)
├── components.json          # config ของ shadcn/ui
├── .github/workflows/
│   └── deploy.yml           # build + deploy ขึ้น GitHub Pages (+ rebuild รายวันเพื่อรีเฟรชข้อมูล)
├── public/
│   ├── manifest.webmanifest # PWA manifest (path แบบ relative — รองรับ basePath)
│   ├── offline.html         # หน้าสำรองตอนออฟไลน์
│   ├── sw.js / workbox-*.js  # service worker (สร้างตอน build)
│   └── icons/               # ไอคอน PWA (192, 512, apple-touch, svg)
└── src/
    ├── app/
    │   ├── layout.tsx        # root layout + ThemeProvider + I18nProvider + Portfolio/Transactions providers
    │   ├── page.tsx          # Dashboard (Server Component, ดึงข้อมูลตอน build → force-static)
    │   └── globals.css       # ตัวแปรสีของ shadcn (light/dark)
    ├── components/
    │   ├── ui/                   # ส่วนประกอบ shadcn/ui (button, card, tabs, table, dialog, sheet, calendar, ...)
    │   ├── app-header.tsx        # หัวเว็บ + เมนู + footer
    │   ├── app-menu.tsx          # เมนู hamburger (settings, manage data, transactions)
    │   ├── fund-dashboard.tsx    # การ์ดสรุป + Tabs สลับกองทุน
    │   ├── fund-summary-card.tsx # การ์ดสรุปรายกองทุน
    │   ├── fund-detail.tsx       # รายละเอียด: หัวข้อ + กราฟ + ปันผล + holdings
    │   ├── nav-chart.tsx         # กราฟเส้น NAV + ปุ่มเลือกช่วงเวลา + จุด transaction (Recharts)
    │   ├── dividend-table.tsx    # ตารางประวัติปันผล
    │   ├── donut-breakdown.tsx   # กราฟโดนัทสัดส่วนสินทรัพย์ / กลุ่มอุตสาหกรรม
    │   ├── top-holdings.tsx      # หลักทรัพย์ที่ถือมากสุด
    │   ├── portfolio-dialog.tsx  # กรอก/แก้ไขพอร์ต (ต้นทุน + หน่วย)
    │   ├── recent-transactions-card.tsx # การ์ดรายการล่าสุด
    │   ├── transactions-dialog.tsx      # รายการซื้อ/ขายทั้งหมด (modal + provider)
    │   ├── add-transaction-sheet.tsx    # bottom sheet เพิ่มรายการ
    │   ├── transaction-fab.tsx / transaction-item.tsx
    │   ├── manage-data-dialog.tsx # นำเข้า/ส่งออกพอร์ตด้วย QR (qrcode + jsqr)
    │   ├── settings-dialog.tsx   # ธีม / ภาษา / view mode
    │   ├── install-prompt.tsx    # ปุ่ม "ติดตั้งแอป"
    │   └── theme-provider.tsx / mode-toggle.tsx
    └── lib/
        ├── funds.ts            # types + รายชื่อกองทุน + ตัวช่วยตัดช่วงเวลา (sliceHistory)
        ├── scrape.ts           # Finnomena API client (ข้อมูลจริง)
        ├── portfolio.tsx       # state พอร์ต + display mode + ลำดับ/ซ่อนกองทุน (localStorage)
        ├── transactions.tsx    # state รายการซื้อ/ขาย (localStorage)
        ├── transactions-io.ts  # นำเข้า/ส่งออกรายการเป็น CSV / JSON
        ├── i18n.tsx            # ระบบสองภาษา EN / TH
        └── utils.ts            # cn(), จัดรูปแบบเงิน/วันที่
```

## แหล่งข้อมูล (Data Source) — ข้อมูลจริงจาก Finnomena

`src/lib/scrape.ts` ดึงข้อมูล **จริง** จาก Finnomena public API (base `https://www.finnomena.com/fn3/api/fund/v2/public/funds`):

| ข้อมูล            | Endpoint                 | ฟิลด์ที่ใช้                                                                                      |
| ----------------- | ------------------------ | ------------------------------------------------------------------------------------------------ |
| ข้อมูลกองทุน      | `{code}`                 | `name_th`, `name_en`, `risk_spectrum`, `aimc_category_name_th`, `amc_name_en`, `dividend_policy` |
| ราคา NAV ย้อนหลัง | `{code}/nav/q?range=MAX` | `data.navs[] = { date, value, amount }`                                                          |
| ประวัติปันผล      | `{code}/dividend`        | `data.dividends[] = { xd_date, value, pay_date }`                                                |
| พอร์ต/holdings    | `{code}/portfolio`       | `data.top_holdings.elements[] = { name, percent, color }`                                        |

- **ไม่มี mock data** — ราคา NAV ล่าสุดและ % เปลี่ยนแปลงคำนวณจากสองจุดล่าสุดของประวัติ NAV
- ดึงประวัติเต็มช่วง (MAX) ครั้งเดียวตอน build แล้วให้ฝั่ง client ตัดช่วง 1M…MAX เอง (เร็ว + ใช้กับ offline cache ได้)
- ถ้าดึงข้อมูลไม่สำเร็จ กองทุนนั้นจะได้ `ok: false` และ UI จะแสดงสถานะ error แทน (ไม่มีการสร้างข้อมูลปลอม)

> หมายเหตุ: เป็น public endpoint เดียวกับที่หน้าเว็บ finnomena.com เรียกใช้ อาจมีการเปลี่ยนแปลง/จำกัดการเรียกได้ในอนาคต

## Deploy (GitHub Pages)

- แอป export เป็น **static HTML** (`output: "export"` → โฟลเดอร์ `./out`) รันได้บน static host ทุกที่
- `.github/workflows/deploy.yml` build + deploy อัตโนมัติเมื่อ push ขึ้น `main`, สั่งเองจากแท็บ Actions ได้, และ **rebuild รายวัน** (~05:00 เวลาไทย) เพื่อรีเฟรชข้อมูล Finnomena ที่ถูก bake ไว้ตอน build
- สำหรับ project page ตั้ง `NEXT_PUBLIC_BASE_PATH=/<repo-name>` (ปัจจุบันตั้งเป็น `/fund-watch`) — ดูรายละเอียดใน `deploy.md`

## PWA / Add to Home Screen

- service worker ถูกสร้างอัตโนมัติโดย `next-pwa` ตอน `npm run build` (ปิดในโหมด dev)
- เปิดหน้าเว็บบนมือถือ → เมนูเบราว์เซอร์ → "Add to Home Screen"
- บนเดสก์ท็อป (Chrome/Edge) จะมีปุ่ม **ติดตั้งแอป** โผล่ขึ้นเมื่อเบราว์เซอร์รองรับ
