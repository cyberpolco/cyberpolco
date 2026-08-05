"use client";

import { useState } from "react";
import { Gauge } from "lucide-react";
import {
  computeMbps,
  createRollingThroughput,
  generateRandomPayload,
  MAX_UPLOAD_CHUNK_BYTES,
  MIN_UPLOAD_CHUNK_BYTES,
  TEST_DURATION_MS,
} from "@/lib/speedtest";
import SpeedGauge from "./SpeedGauge";

type Phase = "idle" | "ping" | "download" | "upload" | "done" | "error";

// Each of download/upload runs 3 concurrent streams and sums their
// throughput, the same technique fast.com/speedtest.net use — it measures
// true available bandwidth (a single stream under-fills the pipe on
// high-latency links like Starlink). Each stream runs for a fixed duration
// rather than a fixed byte count (see TEST_DURATION_MS) so total test time
// stays predictable instead of scaling inversely with how slow the link
// is. Ping still averages 3 sequential round-trips since it measures
// latency, not throughput.
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
// caller can sum bytes across concurrent streams before computing Mbps. The
// server streams indefinitely (see the download route), so `signal` is what
// actually bounds this to TEST_DURATION_MS — an abort is the normal, expected
// way this loop ends, not a failure.
async function measureDownloadOnce(
  runIndex: number,
  onProgress: (bytes: number) => void,
  signal: AbortSignal
): Promise<number> {
  const res = await fetch(`/api/speedtest/download?_=${Date.now()}-${runIndex}`, { cache: "no-store", signal });
  if (!res.ok || !res.body) throw new Error("download failed");

  const reader = res.body.getReader();
  let bytesReceived = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesReceived += value?.byteLength ?? 0;
      onProgress(bytesReceived);
    }
  } catch (err) {
    if (!signal.aborted) throw err;
  }
  return bytesReceived;
}

function uploadChunk(bytes: number, onProgress: (loaded: number) => void): Promise<number> {
  return new Promise((resolve, reject) => {
    const payload = generateRandomPayload(bytes);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/speedtest/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(payload.byteLength);
      } else {
        reject(new Error("upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("upload failed"));
    xhr.send(new Blob([payload.buffer as ArrayBuffer]));
  });
}

// fetch() has no cross-browser way to stream a request body progressively,
// so this sends repeated chunks instead, one after another, until
// `deadline` passes — the sequence stands in for one "stream" the same way
// a single long-lived download connection does. Each chunk is sized from
// the previous chunk's measured rate and the time remaining, starting at
// MIN_UPLOAD_CHUNK_BYTES: a fixed chunk size would either overshoot the
// deadline badly on a slow/degraded link (the Starlink case this test is
// for) or, sized small enough to avoid that, waste the budget on per-request
// overhead on a fast one.
async function measureUploadOnce(deadline: number, onProgress: (bytes: number) => void): Promise<number> {
  let totalSent = 0;
  let chunkBytes = MIN_UPLOAD_CHUNK_BYTES;
  while (performance.now() < deadline) {
    const chunkStart = performance.now();
    const sentInChunk = await uploadChunk(chunkBytes, (loaded) => onProgress(totalSent + loaded));
    totalSent += sentInChunk;
    onProgress(totalSent);

    const chunkSeconds = (performance.now() - chunkStart) / 1000;
    const bytesPerSecond = chunkSeconds > 0 ? sentInChunk / chunkSeconds : sentInChunk;
    const remainingSeconds = (deadline - performance.now()) / 1000;
    chunkBytes = Math.min(
      MAX_UPLOAD_CHUNK_BYTES,
      Math.max(MIN_UPLOAD_CHUNK_BYTES, Math.round(bytesPerSecond * remainingSeconds))
    );
  }
  return totalSent;
}

// Sums live byte counts across N concurrent streams and reports the
// combined Mbps measured over just the trailing LIVE_WINDOW_MS (see
// createRollingThroughput), so the gauge tracks real fluctuation — Starlink
// bufferbloat, weather fade, contention — instead of a since-start average
// that gets flatter the longer the test runs. Also exposes elapsedSeconds so
// the caller can compute a stable final Mbps across the whole run, from the
// same clock used for the live readings.
function makeAggregateProgress(streamCount: number, onCombined: (mbps: number) => void) {
  const start = performance.now();
  const bytesByStream = new Array(streamCount).fill(0);
  const rolling = createRollingThroughput();
  const elapsedSeconds = () => (performance.now() - start) / 1000;
  const report = (streamIndex: number, bytes: number) => {
    bytesByStream[streamIndex] = bytes;
    const totalBytes = bytesByStream.reduce((a, b) => a + b, 0);
    onCombined(rolling.record(performance.now(), totalBytes));
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TEST_DURATION_MS);
    try {
      const totals = await Promise.all(
        Array.from({ length: TEST_RUNS }, (_, i) =>
          measureDownloadOnce(i, (bytes) => report(i, bytes), controller.signal)
        )
      );
      return computeMbps(
        totals.reduce((a, b) => a + b, 0),
        elapsedSeconds()
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  async function measureUpload(): Promise<number> {
    setUploadMax(MIN_GAUGE_MAX);
    const { report, elapsedSeconds } = makeAggregateProgress(TEST_RUNS, (mbps) => {
      setUploadLive(mbps);
      setUploadMax((m) => Math.max(m, mbps * 1.25));
    });
    const deadline = performance.now() + TEST_DURATION_MS;
    const totals = await Promise.all(
      Array.from({ length: TEST_RUNS }, (_, i) => measureUploadOnce(deadline, (bytes) => report(i, bytes)))
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
