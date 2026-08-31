"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, FileDown, FileText } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";

function isPdf(fileName: string | null): boolean {
  return (fileName ?? "").toLowerCase().endsWith(".pdf");
}

function isPptx(fileName: string | null): boolean {
  return /\.pptx?$/i.test(fileName ?? "");
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

// Renders one page at a time onto a canvas via pdfjs, instead of dumping the
// whole document into an <iframe>, so learners can page through it like a
// slide deck. The worker is bundled locally (rather than pulled from a CDN)
// so it loads from our own origin and needs no CSP changes.
function PdfPager({ url, label }: { url: string; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();

      try {
        const doc = await pdfjsLib.getDocument(url).promise;
        if (cancelled) {
          doc.destroy();
          return;
        }
        docRef.current = doc;
        setNumPages(doc.numPages);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      docRef.current?.destroy();
      docRef.current = null;
    };
  }, [url]);

  useEffect(() => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas || !numPages) return;

    let cancelled = false;
    (async () => {
      const pdfPage = await doc.getPage(page);
      if (cancelled) return;
      const viewport = pdfPage.getViewport({ scale: 1.5 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      try {
        await pdfPage.render({ canvas, viewport }).promise;
      } catch {
        // Render tasks throw when cancelled mid-flight (e.g. rapid page
        // flips) — nothing to surface to the user in that case.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, numPages]);

  if (failed) {
    return (
      <p className="mt-1 text-xs text-brand-gray dark:text-white/60">
        Couldn&apos;t load this PDF for preview — download to view.
      </p>
    );
  }

  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-black/10 dark:border-white/15">
      <div className="max-h-[32rem] overflow-auto bg-black/5 p-2 dark:bg-white/5">
        <canvas ref={canvasRef} aria-label={label} className="mx-auto block max-w-full" />
      </div>
      {numPages !== null && numPages > 1 && (
        <div className="flex items-center justify-center gap-3 border-t border-black/10 bg-white p-2 text-xs text-brand-gray dark:border-white/15 dark:bg-transparent dark:text-white/60">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            Page {page} of {numPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            disabled={page >= numPages}
            className="disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// No client-side PPTX renderer exists, so slides are paged through via
// Office Online's embed viewer instead — it fetches the (public) Blob URL
// itself and has its own built-in slide navigation.
function PptxViewer({ url, label }: { url: string; label: string }) {
  const embedSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-black/10 dark:border-white/15">
      <iframe src={embedSrc} title={label} className="h-96 w-full" />
    </div>
  );
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
  const pptx = isPptx(materialFileName);
  const previewable = pdf || pptx;
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
        {previewable && (
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

      {open && pdf && <PdfPager key={materialUrl} url={materialUrl} label={label} />}
      {open && pptx && <PptxViewer url={materialUrl} label={label} />}
      {!previewable && (
        <p className="mt-1 text-xs text-brand-gray dark:text-white/60">
          Preview isn&apos;t available for this file type — download to view.
        </p>
      )}
    </div>
  );
}
