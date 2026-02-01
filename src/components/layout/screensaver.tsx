"use client";

import { useLayout } from "@/context/layout-context";
import { useChronos } from "@/hooks/use-chronos";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { gsap } from "gsap";

export function Screensaver() {
  const { isIdle } = useLayout();
  const { yearProgress } = useChronos();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isIdle) {
      setIsVisible(true);
      gsap.fromTo(
        ".screensaver-content",
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1, ease: "power2.out" }
      );
    } else {
      gsap.to(".screensaver-content", {
        opacity: 0,
        scale: 0.95,
        duration: 0.5,
        onComplete: () => setIsVisible(false),
      });
    }
  }, [isIdle]);

  if (!isVisible && !isIdle) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-1000",
        isIdle ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="screensaver-content flex flex-col items-center gap-4 text-center">
        <h1 className="text-[15vw] font-bold leading-none tracking-tighter text-neutral-100 tabular-nums">
          {yearProgress}%
        </h1>
        <p className="text-xl uppercase tracking-[1em] text-neutral-500">
          Year Progress
        </p>
      </div>
    </div>
  );
}
