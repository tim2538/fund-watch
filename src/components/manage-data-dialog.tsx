"use client";

import * as React from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  QrCode,
  ScanLine,
  Upload,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn, fileStamp } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { usePortfolio } from "@/lib/portfolio";
import { FUND_SYMBOLS } from "@/lib/funds";

type Tab = "export" | "import";

/** Parse a scanned/decoded string and hand it to the portfolio importer. */
function parsePayload(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function ManageDataDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { entries, order, hidden, importData } = usePortfolio();

  const [tab, setTab] = React.useState<Tab>("export");
  const [qrUrl, setQrUrl] = React.useState<string | null>(null);
  const [scanning, setScanning] = React.useState(false);
  const [status, setStatus] = React.useState<{ ok: boolean; msg: string } | null>(
    null,
  );

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const rafRef = React.useRef<number>(0);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const orderChanged = order.join() !== FUND_SYMBOLS.join();
  const hasData =
    Object.keys(entries).length > 0 || hidden.length > 0 || orderChanged;

  const payload = React.useMemo(
    () =>
      JSON.stringify({
        app: "fund-watch",
        v: 1,
        data: { portfolio: entries, fundOrder: order, fundHidden: hidden },
      }),
    [entries, order, hidden],
  );

  // Generate the export QR whenever the export tab is showing valid data.
  React.useEffect(() => {
    if (!open || tab !== "export" || !hasData) {
      setQrUrl(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const url = await QRCode.toDataURL(payload, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 512,
        });
        if (!cancelled) setQrUrl(url);
      } catch {
        if (!cancelled) setQrUrl(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, tab, hasData, payload]);

  const stopScan = React.useCallback(() => {
    setScanning(false);
  }, []);

  const handleDecoded = React.useCallback(
    (text: string) => {
      const parsed = parsePayload(text);
      const ok = parsed != null && importData(parsed);
      setStatus({ ok, msg: ok ? t("importSuccess") : t("importError") });
      setScanning(false);
    },
    [importData, t],
  );

  // Camera scanning loop — runs only while `scanning` is true.
  React.useEffect(() => {
    if (!scanning) return;
    let cancelled = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    (async () => {
      let jsQR: typeof import("jsqr").default;
      try {
        jsQR = (await import("jsqr")).default;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video || !ctx) return;
        video.srcObject = stream;
        video.setAttribute("playsinline", "true");
        await video.play();

        const tick = () => {
          if (cancelled) return;
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(img.data, img.width, img.height);
            if (code) {
              handleDecoded(code.data);
              return;
            }
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        if (!cancelled) {
          setStatus({ ok: false, msg: t("importCameraError") });
          setScanning(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((tr) => tr.stop());
        streamRef.current = null;
      }
    };
  }, [scanning, handleDecoded, t]);

  // Stop the camera and clear transient state when the dialog closes.
  React.useEffect(() => {
    if (!open) {
      setScanning(false);
      setStatus(null);
      setTab("export");
    }
  }, [open]);

  // Leaving the import tab stops the camera.
  React.useEffect(() => {
    if (tab !== "import") setScanning(false);
  }, [tab]);

  async function handleFile(file: File) {
    setStatus(null);
    try {
      const jsQR = (await import("jsqr")).default;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        URL.revokeObjectURL(url);
        if (!ctx) {
          setStatus({ ok: false, msg: t("importError") });
          return;
        }
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(data.data, data.width, data.height);
        if (code) handleDecoded(code.data);
        else setStatus({ ok: false, msg: t("importError") });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setStatus({ ok: false, msg: t("importError") });
      };
      img.src = url;
    } catch {
      setStatus({ ok: false, msg: t("importError") });
    }
  }

  const statusBanner = status ? (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border px-3 py-2 text-xs",
        status.ok
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
      )}
    >
      {status.ok ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0" />
      )}
      {status.msg}
    </div>
  ) : null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("manageData")}
      description={t("manageDataDesc")}
      closeLabel={t("close")}
    >
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex rounded-md border p-0.5">
          {(["export", "import"] as Tab[]).map((tb) => (
            <button
              key={tb}
              type="button"
              onClick={() => {
                setStatus(null);
                setTab(tb);
              }}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors",
                tab === tb
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tb === "export" ? (
                <QrCode className="h-3.5 w-3.5" />
              ) : (
                <ScanLine className="h-3.5 w-3.5" />
              )}
              {tb === "export" ? t("exportTab") : t("importTab")}
            </button>
          ))}
        </div>

        <div className="flex h-[340px] flex-col gap-3">
          {statusBanner}

          <div className="min-h-0 flex-1">
            {tab === "export" ? (
          <div className="flex h-full flex-col gap-3">
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              {hasData && qrUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrUrl}
                    alt="Fund Watch data QR code"
                    className="h-56 w-56 rounded-lg border bg-white p-2"
                  />
                  <p className="text-center text-xs text-muted-foreground">
                    {t("exportHint")}
                  </p>
                </>
              ) : hasData ? (
                <div className="flex h-56 w-56 items-center justify-center rounded-lg border">
                  <QrCode className="h-8 w-8 animate-pulse text-muted-foreground" />
                </div>
              ) : (
                <p className="text-center text-xs text-muted-foreground">
                  {t("exportEmpty")}
                </p>
              )}
            </div>

            {hasData && qrUrl && (
              <Button
                variant="outline"
                className="mt-auto w-full gap-1.5"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = qrUrl;
                  a.download = `fund-watch-${fileStamp(new Date())}.png`;
                  a.click();
                }}
              >
                <Download className="h-4 w-4" />
                {t("saveQr")}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex h-full flex-col gap-3">
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              {t("importReplaceWarning")}
            </div>

            {scanning ? (
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <div className="flex min-h-0 flex-1 items-center justify-center">
                  <div className="relative aspect-square h-full overflow-hidden rounded-md border bg-black">
                    <video
                      ref={videoRef}
                      className="absolute inset-0 h-full w-full object-cover"
                      muted
                      playsInline
                    />
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  {t("importScanHint")}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={stopScan}
                >
                  {t("importStopScan")}
                </Button>
              </div>
            ) : (
              <div className="mt-auto grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  {t("importUpload")}
                </Button>
                <Button
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => {
                    setStatus(null);
                    setScanning(true);
                  }}
                >
                  <ScanLine className="h-4 w-4" />
                  {t("importScan")}
                </Button>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
          </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
