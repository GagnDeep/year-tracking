"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type ViewMode = "year" | "month" | "week";

interface LayoutContextType {
  focusMode: boolean;
  setFocusMode: (value: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
  isIdle: boolean;
  transitionRect: DOMRect | null;
  setTransitionRect: (rect: DOMRect | null) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [focusMode, setFocusMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("year");
  const [isIdle, setIsIdle] = useState(false);
  const [transitionRect, setTransitionRect] = useState<DOMRect | null>(null);

  // Screensaver / Idle Timer Logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

    const resetTimer = () => {
      setIsIdle(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsIdle(true);
      }, IDLE_TIMEOUT);
    };

    // Events to detect activity
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // Start timer on mount

    return () => {
      clearTimeout(timeout);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);

  return (
    <LayoutContext.Provider
      value={{
        focusMode,
        setFocusMode,
        viewMode,
        setViewMode,
        isIdle,
        transitionRect,
        setTransitionRect,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
