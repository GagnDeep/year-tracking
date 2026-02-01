// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { LayoutProvider, useLayout } from "@/context/layout-context";

describe("Layout Context (Focus Mode)", () => {
  it("should toggle focus mode", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LayoutProvider>{children}</LayoutProvider>
    );

    const { result } = renderHook(() => useLayout(), { wrapper });

    expect(result.current.focusMode).toBe(false);

    act(() => {
      result.current.setFocusMode(true);
    });

    expect(result.current.focusMode).toBe(true);
  });

  it("should toggle view mode", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LayoutProvider>{children}</LayoutProvider>
    );

    const { result } = renderHook(() => useLayout(), { wrapper });

    expect(result.current.viewMode).toBe("year");

    act(() => {
      result.current.setViewMode("month");
    });

    expect(result.current.viewMode).toBe("month");
  });

  it("should handle transition rect", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LayoutProvider>{children}</LayoutProvider>
    );

    const { result } = renderHook(() => useLayout(), { wrapper });

    const rect = { width: 100, height: 100, top: 0, left: 0, bottom: 100, right: 100, x: 0, y: 0, toJSON: () => {} };

    act(() => {
        result.current.setTransitionRect(rect);
    });

    expect(result.current.transitionRect).toEqual(rect);
  });
});
