"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/toast";

export default function ErrorToast({ message }: { message?: string }) {
  const { push } = useToast();

  useEffect(() => {
    if (message) push(message, { variant: "error" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  return null;
}
