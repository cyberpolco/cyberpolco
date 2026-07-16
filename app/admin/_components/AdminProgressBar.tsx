"use client";

import ProgressBar from "@/components/ui/ProgressBar";
import { useNavProgress } from "./NavProgressContext";

export default function AdminProgressBar() {
  const { active } = useNavProgress();
  return <ProgressBar active={active} />;
}
