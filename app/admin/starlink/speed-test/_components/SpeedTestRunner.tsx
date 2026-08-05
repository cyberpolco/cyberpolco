"use client";

import { useState } from "react";
import { Gauge } from "lucide-react";
import { computeMbps, generateRandomPayload, DEFAULT_DOWNLOAD_BYTES, UPLOAD_BYTES } from "@/lib/speedtest";
import SpeedGauge from "./SpeedGauge";

type Phase = "idle" | "ping" | "download" | "upload" | "done" | "error";

// Each of download/upload runs 3 concurrent streams and sums their
// throughput, the same technique fast.com/speedtest.net use — it measures
// true available bandwidth (a single stream under-fills the pipe on
// high-latency links like Starlink) without tripling wall-clock time the
// way running the streams one after another would. Ping still averages 3
// sequential round-trips since it measures latency, not throughput.
const TEST_RUNS = 3;
const MIN_GAUGE_MAX = 50;

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
// thing at once) so onProgress can report live byte counts instead of only
// a single number at the very end. Reports raw bytes (not Mbps) so the
// caller can sum bytes across concurrent streams before computing Mbps.
async function measureDownloadOnce(runIndex: number, onProgress: (bytes: number) => void): Promise<number> {
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
    onProgress(bytesReceived);
  }
  return bytesReceived;
}

// fetch() has no upload-progress event, so this uses XMLHttpRequest instead
// (via xhr.upload.onprogress) purely to get a live reading while the
// payload is still being sent. Reports raw bytes (not Mbps) — see
// measureDownloadOnce.
function measureUploadOnce(onProgress: (bytes: number) => void): Promise<number> {
  return new Promise((resolve, reject) => {
    const payload = generateRandomPayload(UPLOAD_BYTES);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/speedtest/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(payload.byteLength);
        resolve(payload.byteLength);
      } else {
        reject(new Error("upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("upload failed"));
    xhr.send(new Blob([payload.buffer as ArrayBuffer]));
  });
}

// Sums live byte counts across N concurrent streams and reports the
// combined Mbps so far, so the gauge reflects aggregate throughput instead
// of any single stream's (necessarily lower) share of it. Also exposes
// elapsedSeconds so the caller can compute the final Mbps once every
// stream has finished, from the same clock used for the live readings.
function makeAggregateProgress(streamCount: number, onCombined: (mbps: number) => void) {
  const start = performance.now();
  const bytesByStream = new Array(streamCount).fill(0);
  const elapsedSeconds = () => (performance.now() - start) / 1000;
  const report = (streamIndex: number, bytes: number) => {
    bytesByStream[streamIndex] = bytes;
    const totalBytes = bytesByStream.reduce((a, b) => a + b, 0);
    onCombined(computeMbps(totalBytes, elapsedSeconds()));
  };
  return { report, elapsedSeconds };
}

export default function SpeedTestRunner() {
  const [phase, setPhase] = useState<Phase>("idle");
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
    const { report, elapsedSeconds } = makeAggregateProgress(TEST_RUNS, (mbps) => {
      setDownloadLive(mbps);
      setDownloadMax((m) => Math.max(m, mbps * 1.25));
    });
    const totals = await Promise.all(
      Array.from({ length: TEST_RUNS }, (_, i) => measureDownloadOnce(i, (bytes) => report(i, bytes)))
    );
    return computeMbps(
      totals.reduce((a, b) => a + b, 0),
      elapsedSeconds()
    );
  }

  async function measureUpload(): Promise<number> {
    setUploadMax(MIN_GAUGE_MAX);
    const { report, elapsedSeconds } = makeAggregateProgress(TEST_RUNS, (mbps) => {
      setUploadLive(mbps);
      setUploadMax((m) => Math.max(m, mbps * 1.25));
    });
    const totals = await Promise.all(
      Array.from({ length: TEST_RUNS }, (_, i) => measureUploadOnce((bytes) => report(i, bytes)))
    );
    return computeMbps(
      totals.reduce((a, b) => a + b, 0),
      elapsedSeconds()
    );
  }

  async function runTest() {
    setPhase("ping");
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
          label={`Download (${TEST_RUNS} streams)`}
          unit="Mbps"
          active={phase === "download"}
        />

        <SpeedGauge
          value={upload !== null ? upload : uploadLive}
          max={uploadMax}
          label={`Upload (${TEST_RUNS} streams)`}
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
