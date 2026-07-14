import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-red"
    >
      <ArrowLeft size={16} /> {label}
    </Link>
  );
}
