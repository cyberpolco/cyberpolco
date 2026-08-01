"use client";

import { useState } from "react";
import { FileDown, FileText } from "lucide-react";

function isPdf(fileName: string | null): boolean {
  return (fileName ?? "").toLowerCase().endsWith(".pdf");
}

// Fetches the file client-side and downloads it via an object URL instead
// of a plain <a download> link, since cross-origin download attributes
// (this file lives on Blob storage, a different origin) aren't reliably
// honored by browsers — this guarantees a download with no navigation.
async function downloadFile(url: string, fileName: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(objectUrl);
}

export default function LessonMaterialViewer({
  materialUrl,
  materialFileName,
}: {
  materialUrl: string;
  materialFileName: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const pdf = isPdf(materialFileName);
  const label = materialFileName ?? "Material";

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadFile(materialUrl, label);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-brand-blue">
        {pdf && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1 hover:underline"
          >
            <FileText size={12} /> {open ? "Hide" : "View"} {label}
          </button>
        )}
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-1 hover:underline disabled:opacity-60"
        >
          <FileDown size={12} /> {downloading ? "Downloading..." : "Download"}
        </button>
      </div>

      {pdf && open && (
        <div className="mt-2 overflow-hidden rounded-lg border border-black/10 dark:border-white/15">
          <iframe src={materialUrl} title={label} className="h-96 w-full" />
        </div>
      )}
      {!pdf && (
        <p className="mt-1 text-xs text-brand-gray dark:text-white/60">
          Preview isn&apos;t available for this file type — download to view.
        </p>
      )}
    </div>
  );
}
