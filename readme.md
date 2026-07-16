# Fund Watch — PWA ดูข้อมูลกองทุนรวม

เว็บแอปพลิเคชัน (PWA) สำหรับดูข้อมูลกองทุนรวม 3 กองทุน — **BKD**, **BSIRICG**, **B-CHINE-EQ** —
แสดง NAV ล่าสุด, % การเปลี่ยนแปลง, กราฟราคาย้อนหลัง (เลือกช่วง 1M/3M/6M/YTD/1Y) และตารางประวัติการจ่ายปันผล

สร้างด้วย **Next.js (App Router)** + **shadcn/ui** + **Tailwind CSS** + **Recharts** + **next-themes**
และตั้งค่า PWA ด้วย **@ducanh2912/next-pwa** (manifest, service worker, icons, offline, Add to Home Screen)

มีเมนู (ไอคอน hamburger) มุมขวาบนสำหรับตั้งค่า:
- **Preference** — ธีม Light / Dark / System (ค่าเริ่มต้น)
- **Language** — EN (ค่าเริ่มต้น) / TH (ระบบ i18n อยู่ใน `src/lib/i18n.tsx`, จำค่าที่เลือกไว้ผ่าน localStorage)

ตารางประวัติปันผลแสดงแถว **รวมทั้งหมด** ไว้บนสุด, แสดง 5 รายการล่าสุด แล้วกด **ดูเพิ่มเติม (Load more)** เพื่อดูเพิ่ม

## เริ่มใช้งาน

```bash
npm install
npm run dev      # เปิด http://localhost:3000
```

Build โปรดักชัน (service worker ทำงานเฉพาะโหมด production):

```bash
npm run build
npm run start
```

## โครงสร้างโฟลเดอร์

```
.
├── next.config.mjs          # ตั้งค่า Next.js + next-pwa (สร้าง service worker)
├── tailwind.config.ts       # ธีม shadcn (สี, radius, dark mode)
├── components.json          # config ของ shadcn/ui
├── public/
│   ├── manifest.json        # PWA manifest (ชื่อ, ไอคอน, theme color)
│   ├── offline.html         # หน้าสำรองตอนออฟไลน์
│   └── icons/               # ไอคอน PWA (192, 512, maskable, apple-touch)
└── src/
    ├── app/
    │   ├── layout.tsx        # root layout + ThemeProvider + metadata/manifest
    │   ├── page.tsx          # หน้า Dashboard (Server Component ดึงข้อมูล)
    │   ├── globals.css       # ตัวแปรสีของ shadcn (light/dark)
    │   └── api/funds/
    │       ├── route.ts             # GET /api/funds        (สรุปทั้ง 3 กองทุน)
    │       └── [symbol]/route.ts    # GET /api/funds/BKD?range=1Y
    ├── components/
    │   ├── ui/               # ส่วนประกอบ shadcn/ui (button, card, tabs, table, ...)
    │   ├── fund-dashboard.tsx    # การ์ดสรุป + Tabs สลับกองทุน
    │   ├── fund-summary-card.tsx # การ์ดสรุปรายกองทุน
    │   ├── fund-detail.tsx       # รายละเอียด: หัวข้อ + กราฟ + ปันผล
    │   ├── nav-chart.tsx         # กราฟเส้น NAV + ปุ่มเลือกช่วงเวลา (Recharts)
    │   ├── dividend-table.tsx    # ตารางประวัติปันผล
    │   ├── theme-provider.tsx    # next-themes
    │   ├── mode-toggle.tsx       # สลับ Light/Dark/System
    │   └── install-prompt.tsx    # ปุ่ม "ติดตั้งแอป" (Add to Home Screen)
    └── lib/
        ├── funds.ts         # ชนิดข้อมูล (types) + ค่าคงที่ + ตัวช่วยตัดช่วงเวลา
        ├── scrape.ts        # Finnomena API client (ดึงข้อมูลสดจริง)
        └── utils.ts         # cn(), จัดรูปแบบเงิน/วันที่ (ภาษาไทย)
```

## แหล่งข้อมูล (Data Source) — ข้อมูลสดจาก Finnomena

`src/lib/scrape.ts` ดึงข้อมูล **จริง** จาก Finnomena public API (base `https://www.finnomena.com/fn3/api/fund/v2/public/funds`):

| ข้อมูล | Endpoint | ฟิลด์ที่ใช้ |
| --- | --- | --- |
| ข้อมูลกองทุน | `{code}` | `name_th`, `name_en`, `risk_spectrum`, `aimc_category_name_th`, `amc_name_en`, `dividend_policy` |
| ราคา NAV ย้อนหลัง | `{code}/nav/q?range=1Y` | `data.navs[] = { date, value, amount }` |
| ประวัติปันผล | `{code}/dividend` | `data.dividends[] = { xd_date, value, pay_date }` |

- **ไม่มี mock data แล้ว** — ราคา NAV ล่าสุดและ % เปลี่ยนแปลงคำนวณจากสองจุดล่าสุดของประวัติ NAV
- ดึง 1 ปีครั้งเดียวแล้วให้ฝั่ง client ตัดช่วง 1M/3M/6M/YTD/1Y เอง (เร็ว + ใช้กับ offline cache ได้)
- server ทำ ISR `revalidate = 3600` (รีเฟรชข้อมูลอัตโนมัติทุกชั่วโมง) NAV อัปเดตรายวันตามต้นทาง
- ถ้าดึงข้อมูลไม่สำเร็จ กองทุนนั้นจะได้ `ok: false` และ UI จะแสดงสถานะ error แทน (ไม่มีการสร้างข้อมูลปลอม)

> หมายเหตุ: เป็น public endpoint เดียวกับที่หน้าเว็บ finnomena.com เรียกใช้ อาจมีการเปลี่ยนแปลง/จำกัดการเรียกได้ในอนาคต

## PWA / Add to Home Screen

- service worker ถูกสร้างอัตโนมัติโดย `next-pwa` ตอน `npm run build` (ปิดในโหมด dev)
- เปิดหน้าเว็บบนมือถือ → เมนูเบราว์เซอร์ → "Add to Home Screen"
- บนเดสก์ท็อป (Chrome/Edge) จะมีปุ่ม **ติดตั้งแอป** โผล่ขึ้นเมื่อเบราว์เซอร์รองรับ

> หมายเหตุ: ข้อมูลในแอปนี้ไม่ใช่คำแนะนำการลงทุน
