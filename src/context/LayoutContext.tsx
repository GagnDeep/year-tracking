"use client";

import React, { createContext, useContext, useState } from "react";

interface LayoutContextType {
  focusMode: boolean;
  setFocusMode: (mode: boolean) => void;
  viewMode: "day" | "week" | "month";
  setViewMode: (mode: "day" | "week" | "month") => void;
  toggleFocusMode: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [focusMode, setFocusMode] = useState(false);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");

  const toggleFocusMode = () => setFocusMode((prev) => !prev);

  return (
    <LayoutContext.Provider
      value={{ focusMode, setFocusMode, viewMode, setViewMode, toggleFocusMode }}
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
