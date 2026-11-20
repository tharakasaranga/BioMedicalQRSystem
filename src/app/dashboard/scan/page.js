"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ArrowLeft, QrCode, Search } from "lucide-react";

export default function QRScannerPage() {
  const router = useRouter();
  const [manualId, setManualId] = useState("");
  const [scanError, setScanError] = useState("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
       
        scanner.clear();
        if (decodedText.includes("/equipment/")) {
          const assetId = decodedText.split("/equipment/")[1];
          router.push(`/equipment/${assetId}`);
        } else {
       
          router.push(`/equipment/${decodedText.trim()}`);
        }
      },
      (err) => {
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [router]);

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    router.push(`/equipment/${manualId.trim()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-md mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-4 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
          <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-full mb-3">
            <QrCode size={28} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Scan Equipment QR Code</h1>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Point your phone camera at the QR sticker attached to the biomedical machine.
          </p>

          {/* Camera Scanner Box */}
          <div id="qr-reader" className="overflow-hidden rounded-xl border border-slate-200"></div>

          {scanError && <p className="text-red-500 text-xs mt-2">{scanError}</p>}

          {/* Manual Asset ID Fallback */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-2">Or enter Asset ID manually:</p>
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. BIO-2026-4821"
                className="flex-1 p-2.5 border rounded-lg text-sm text-slate-800 uppercase"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
              />
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1"
              >
                <Search size={16} /> Go
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}