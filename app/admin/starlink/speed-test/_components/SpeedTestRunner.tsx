"use client";

import { useState } from "react";
import { Gauge, Wifi, Download, Upload } from "lucide-react";
import { computeMbps, generateRandomPayload, DEFAULT_DOWNLOAD_BYTES, UPLOAD_BYTES } from "@/lib/speedtest";

type Phase = "idle" | "ping" | "download" | "upload" | "done" | "error";

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

async function measureDownload(): Promise<number> {
  const start = performance.now();
  const res = await fetch(`/api/speedtest/download?size=${DEFAULT_DOWNLOAD_BYTES}&_=${Date.now()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("download failed");
  const buf = await res.arrayBuffer();
  const seconds = (performance.now() - start) / 1000;
  return computeMbps(buf.byteLength, seconds);
}

async function measureUpload(): Promise<number> {
  const payload = generateRandomPayload(UPLOAD_BYTES);
  const start = performance.now();
  const res = await fetch("/api/speedtest/upload", {
    method: "POST",
    body: new Blob([payload.buffer as ArrayBuffer]),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("upload failed");
  const seconds = (performance.now() - start) / 1000;
  return computeMbps(payload.byteLength, seconds);
}

export default function SpeedTestRunner() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [ping, setPing] = useState<number | null>(null);
  const [download, setDownload] = useState<number | null>(null);
  const [upload, setUpload] = useState<number | null>(null);

  const running = phase === "ping" || phase === "download" || phase === "upload";

  async function runTest() {
    setPhase("ping");
    setPing(null);
    setDownload(null);
    setUpload(null);
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
    <div className="max-w-lg">
      <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
        <div className="grid grid-cols-3 gap-3">
          <Tile
            icon={Wifi}
            label="Ping"
            value={ping !== null ? `${ping} ms` : phase === "ping" ? "Testing..." : "—"}
          />
          <Tile
            icon={Download}
            label="Download"
            value={download !== null ? `${download} Mbps` : phase === "download" ? "Testing..." : "—"}
          />
          <Tile
            icon={Upload}
            label="Upload"
            value={upload !== null ? `${upload} Mbps` : phase === "upload" ? "Testing..." : "—"}
          />
        </div>

        <button
          type="button"
          onClick={runTest}
          disabled={running}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Gauge size={16} />
          {running ? "Testing..." : phase === "done" || phase === "error" ? "Test again" : "Start test"}
        </button>

        {phase === "error" && (
          <p className="mt-3 text-sm text-brand-red">Something went wrong running the test. Please try again.</p>
        )}

        <p className="mt-4 text-xs text-brand-gray dark:text-white/60">
          This is a rough diagnostic, not a lab-grade measurement — network conditions and server load can affect
          the result.
        </p>
      </div>
    </div>
  );
}

function Tile({ icon: Icon, label, value }: { icon: typeof Wifi; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/5 dark:border-white/10 p-4 text-center">
      <Icon className="mx-auto text-brand-blue" size={20} />
      <p className="mt-2 text-lg font-bold text-brand-dark dark:text-white">{value}</p>
      <p className="text-xs text-brand-gray dark:text-white/60">{label}</p>
    </div>
  );
}
