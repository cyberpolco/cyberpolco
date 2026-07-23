"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import LocaleSwitcher from "./LocaleSwitcher";

export default function Header() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t("home") },
    { href: "/services", label: t("services") },
    { href: "/about", label: t("about") },
    { href: "/achievements", label: t("achievements") },
    { href: "/articles", label: t("articles") },
    { href: "/careers", label: t("careers") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-dark/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Image src="/images/logo-mark.png" alt="Cyber PolCo" width={40} height={40} className="rounded-full" />
          <span className="font-display text-lg font-bold tracking-tight text-white">
            Cyber PolCo
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <LocaleSwitcher />
          <Link
            href="/contact"
            className="rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            {t("getInTouch")}
          </Link>
        </div>

        <button
          className="text-white lg:hidden"
          aria-label="Menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-brand-dark px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-white/90"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 w-fit rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
            >
              {t("getInTouch")}
            </Link>
            <div className="pt-2">
              <LocaleSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
