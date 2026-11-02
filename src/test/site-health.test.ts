import { describe, expect, it, vi } from "vitest";
import { checkPageStatuses } from "@/lib/site-health";

describe("checkPageStatuses", () => {
  it("reports ok + status for a successful response", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response("", { status: 200 }));
    const result = await checkPageStatuses(["/"], fetchImpl);
    expect(result).toEqual([{ path: "/", ok: true, status: 200 }]);
  });

  it("reports not-ok with the real status for a 404/500", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response("", { status: 500 }));
    const result = await checkPageStatuses(["/broken"], fetchImpl);
    expect(result).toEqual([{ path: "/broken", ok: false, status: 500 }]);
  });

  it("reports unreachable (status null) when fetch throws, without throwing itself", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network error"));
    const result = await checkPageStatuses(["/down"], fetchImpl);
    expect(result).toEqual([{ path: "/down", ok: false, status: null }]);
  });

  it("checks every path given, independently", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      .mockResolvedValueOnce(new Response("", { status: 404 }));
    const result = await checkPageStatuses(["/a", "/b"], fetchImpl);
    expect(result).toEqual([
      { path: "/a", ok: true, status: 200 },
      { path: "/b", ok: false, status: 404 },
    ]);
  });
});
