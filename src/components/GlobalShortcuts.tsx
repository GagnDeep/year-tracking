"use client";

import { useHotkeys } from "react-hotkeys-hook";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export function GlobalShortcuts() {
  const router = useRouter();

  useHotkeys("g+t", () => {
    const today = format(new Date(), "yyyy-MM-dd");
    router.push(`/dashboard/day/${today}`);
  });

  useHotkeys("g+s", () => {
    router.push("/dashboard/settings");
  });

  return null;
}
