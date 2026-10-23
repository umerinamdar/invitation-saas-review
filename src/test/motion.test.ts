import { describe, expect, it, vi } from "vitest";
import {
  EASE,
  MOTION,
  openingDurationMs,
  prefersReducedMotion,
} from "@/lib/motion";

// The motion system is the one place durations/easings live; these
// tests pin the contract the CSS tokens in site.css/styles.css mirror.
describe("motion system", () => {
  it("exposes exactly two easings, both valid cubic-beziers", () => {
    expect(Object.keys(EASE).sort()).toEqual(["inOut", "out"]);
    for (const value of Object.values(EASE)) {
      expect(value).toMatch(/^cubic-bezier\(0\.\d+, \d, 0\.\d+, 1\)$/);
    }
  });

  it("keeps durations in a sane premium range (no instant, no sluggish)", () => {
    expect(MOTION.instant).toBeGreaterThanOrEqual(80);
    expect(MOTION.instant).toBeLessThan(MOTION.fast);
    expect(MOTION.fast).toBeLessThan(MOTION.base);
    expect(MOTION.base).toBeLessThan(MOTION.slow);
    expect(MOTION.slow).toBeLessThan(MOTION.slower);
    expect(MOTION.slower).toBeLessThanOrEqual(800);
  });

  it("returns the theme's openMs for motion-accepting guests", () => {
    // Test setup mocks matchMedia with matches:false.
    expect(prefersReducedMotion()).toBe(false);
    expect(openingDurationMs(1400)).toBe(1400);
    expect(openingDurationMs(1700)).toBe(1700);
  });

  it("collapses the opening to near-instant for reduced-motion guests", () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    expect(prefersReducedMotion()).toBe(true);
    expect(openingDurationMs(1400)).toBe(150);
    expect(openingDurationMs(1700)).toBe(150);
    vi.restoreAllMocks();
  });
});
