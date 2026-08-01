"use client";

import { useState } from "react";
import { Gauge } from "lucide-react";
import { computeMbps, generateRandomPayload, DEFAULT_DOWNLOAD_BYTES, UPLOAD_BYTES } from "@/lib/speedtest";
import SpeedGauge from "./SpeedGauge";

type Phase = "idle" | "ping" | "download" | "upload" | "done" | "error";

// Each of download/upload runs 3 times and averages, to smooth out one-off
// network blips — ping already averages 3 round-trips on its own.
const TEST_RUNS = 3;
const MIN_GAUGE_MAX = 50;

function average(values: number[]): number {
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

async function measurePing(): Promise<number> {
  const samples: number[] = [];
  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    const res = await fetch(`/api/speedtest/ping?_=${Date.now()}-${i}`, { cache: "no-store" });
    if (!res.ok) throw new Error("ping failed");
    samples.push(performance.now() - start);
  }
  return Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
}

// Reads the response body as it streams in (rather than awaiting the whole
// thing at once) so onProgress can report a live, continuously-updating
// Mbps reading instead of only a single number at the very end.
async function measureDownloadOnce(runIndex: number, onProgress: (mbps: number) => void): Promise<number> {
  const start = performance.now();
  const res = await fetch(`/api/speedtest/download?size=${DEFAULT_DOWNLOAD_BYTES}&_=${Date.now()}-${runIndex}`, {
    cache: "no-store",
  });
  if (!res.ok || !res.body) throw new Error("download failed");

  const reader = res.body.getReader();
  let bytesReceived = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesReceived += value?.byteLength ?? 0;
    onProgress(computeMbps(bytesReceived, (performance.now() - start) / 1000));
  }
  return computeMbps(bytesReceived, (performance.now() - start) / 1000);
}

// fetch() has no upload-progress event, so this uses XMLHttpRequest instead
// (via xhr.upload.onprogress) purely to get a live reading while the
// payload is still being sent.
function measureUploadOnce(onProgress: (mbps: number) => void): Promise<number> {
  return new Promise((resolve, reject) => {
    const payload = generateRandomPayload(UPLOAD_BYTES);
    const start = performance.now();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/speedtest/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(computeMbps(e.loaded, (performance.now() - start) / 1000));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(computeMbps(payload.byteLength, (performance.now() - start) / 1000));
      } else {
        reject(new Error("upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("upload failed"));
    xhr.send(new Blob([payload.buffer as ArrayBuffer]));
  });
}

export default function SpeedTestRunner() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [run, setRun] = useState(0);
  const [ping, setPing] = useState<number | null>(null);
  const [download, setDownload] = useState<number | null>(null);
  const [downloadLive, setDownloadLive] = useState(0);
  const [downloadMax, setDownloadMax] = useState(MIN_GAUGE_MAX);
  const [upload, setUpload] = useState<number | null>(null);
  const [uploadLive, setUploadLive] = useState(0);
  const [uploadMax, setUploadMax] = useState(MIN_GAUGE_MAX);

  const running = phase === "ping" || phase === "download" || phase === "upload";

  async function measureDownload(): Promise<number> {
    setDownloadMax(MIN_GAUGE_MAX);
    const results: number[] = [];
    for (let i = 0; i < TEST_RUNS; i++) {
      setRun(i + 1);
      const mbps = await measureDownloadOnce(i, (live) => {
        setDownloadLive(live);
        setDownloadMax((m) => Math.max(m, live * 1.25));
      });
      results.push(mbps);
    }
    return average(results);
  }

  async function measureUpload(): Promise<number> {
    setUploadMax(MIN_GAUGE_MAX);
    const results: number[] = [];
    for (let i = 0; i < TEST_RUNS; i++) {
      setRun(i + 1);
      const mbps = await measureUploadOnce((live) => {
        setUploadLive(live);
        setUploadMax((m) => Math.max(m, live * 1.25));
      });
      results.push(mbps);
    }
    return average(results);
  }

  async function runTest() {
    setPhase("ping");
    setRun(0);
    setPing(null);
    setDownload(null);
    setDownloadLive(0);
    setUpload(null);
    setUploadLive(0);
    try {
      setPing(await measurePing());
      setPhase("download");
      setDownload(await measureDownload());
      setPhase("upload");
      setUpload(await measureUpload());
      setPhase("done");
    } catch {
      setPhase("error");
    }
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="flex flex-col items-center">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-full border-4 border-black/5 dark:border-white/10 ${
              phase === "ping" ? "animate-pulse" : ""
            }`}
          >
            <div>
              <p className="text-xl font-bold text-brand-dark dark:text-white">{ping !== null ? ping : "—"}</p>
              <p className="text-xs text-brand-gray dark:text-white/60">ms</p>
            </div>
          </div>
          <p className="mt-3 text-sm font-medium text-brand-gray dark:text-white/60">Ping</p>
        </div>

        <SpeedGauge
          value={download !== null ? download : downloadLive}
          max={downloadMax}
          label={phase === "download" ? `Download (${run}/${TEST_RUNS})` : "Download (avg of 3)"}
          unit="Mbps"
          active={phase === "download"}
        />

        <SpeedGauge
          value={upload !== null ? upload : uploadLive}
          max={uploadMax}
          label={phase === "upload" ? `Upload (${run}/${TEST_RUNS})` : "Upload (avg of 3)"}
          unit="Mbps"
          active={phase === "upload"}
        />
      </div>

      <button
        type="button"
        onClick={runTest}
        disabled={running}
        className="mt-10 flex items-center justify-center gap-2 rounded-full bg-brand-red px-8 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Gauge size={16} />
        {running ? "Testing..." : phase === "done" || phase === "error" ? "Test again" : "Start test"}
      </button>

      {phase === "error" && (
        <p className="mt-3 text-sm text-brand-red">Something went wrong running the test. Please try again.</p>
      )}

      <p className="mt-4 max-w-sm text-xs text-brand-gray dark:text-white/60">
        This is a rough diagnostic, not a lab-grade measurement — network conditions and server load can affect the
        result.
      </p>
    </div>
  );
}
