"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { useEffect, useId } from "react";
import { useNavProgress } from "./NavProgressContext";

function StatusReporter() {
  const { pending } = useLinkStatus();
  const { report } = useNavProgress();
  const id = useId();

  useEffect(() => {
    report(id, pending);
    return () => report(id, false);
  }, [pending, report, id]);

  return null;
}

export default function AdminNavLink({
  href,
  className,
  onClick,
  children,
}: {
  href: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
      <StatusReporter />
    </Link>
  );
}
