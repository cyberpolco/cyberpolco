import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { APP_VERSION } from "@/lib/version";

const binaryDigits = [
  { top: "10%", left: "8%", char: "1", duration: "6s", twinkle: "3.2s", delay: "0s" },
  { top: "22%", left: "88%", char: "0", duration: "7.5s", twinkle: "4s", delay: "0.6s" },
  { top: "68%", left: "10%", char: "0", duration: "5.5s", twinkle: "2.8s", delay: "1.1s" },
  { top: "80%", left: "82%", char: "1", duration: "8s", twinkle: "3.6s", delay: "0.3s" },
  { top: "15%", left: "45%", char: "0", duration: "6.8s", twinkle: "3s", delay: "1.6s" },
  { top: "48%", left: "94%", char: "1", duration: "7s", twinkle: "4.4s", delay: "0.8s" },
  { top: "34%", left: "18%", char: "1", duration: "6.2s", twinkle: "3.4s", delay: "1.9s" },
  { top: "88%", left: "48%", char: "0", duration: "7.2s", twinkle: "3.8s", delay: "0.4s" },
  { top: "5%", left: "65%", char: "0", duration: "6.5s", twinkle: "3.1s", delay: "1.2s" },
  { top: "58%", left: "4%", char: "1", duration: "7.8s", twinkle: "4.1s", delay: "0.9s" },
] as const;

export default function AuthPageBackground({
  homeLabel,
  children,
}: {
  homeLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-dark px-5">
      {/* tech background */}
      <div className="hero-grid pointer-events-none absolute inset-0" />
      <div className="hero-glow-orb pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-brand-blue/25 blur-3xl" />
      <div
        className="hero-glow-orb pointer-events-none absolute -right-16 top-0 h-96 w-96 rounded-full bg-brand-red/20 blur-3xl"
        style={{ animationDelay: "2s" }}
      />
      {/* orbiting satellite ring */}
      <div className="pointer-events-none absolute inset-6 hidden animate-spin rounded-full border border-dashed border-brand-blue/15 [animation-duration:32s] sm:block">
        <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-brand-yellow shadow-[0_0_10px_2px_rgba(230,156,63,0.7)]" />
      </div>
      {/* floating binary digits */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        {binaryDigits.map((b, i) => (
          <span
            key={i}
            className="login-binary absolute select-none font-mono text-sm font-bold text-brand-blue/30"
            style={{
              top: b.top,
              left: b.left,
              animationDelay: b.delay,
              ["--hero-particle-duration" as string]: b.duration,
              ["--hero-particle-twinkle" as string]: b.twinkle,
            }}
          >
            {b.char}
          </span>
        ))}
      </div>

      <Link
        href="/"
        className="fixed left-5 top-5 z-10 inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 transition-colors hover:text-white"
      >
        <ArrowLeft size={16} />
        {homeLabel}
      </Link>

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-white p-8 shadow-xl">
        {children}
      </div>

      <p className="fixed bottom-3 right-4 z-10 text-xs text-white/30">v{APP_VERSION}</p>
    </div>
  );
}
