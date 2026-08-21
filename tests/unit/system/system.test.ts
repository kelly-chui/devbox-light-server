import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SystemUseCases } from "../../../src/application/systemUseCases.js";

describe("SystemUseCases", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getStatus", () => {
    it("returns ok status with an ISO timestamp", () => {
    const useCases = new SystemUseCases();
      const status = useCases.getStatus();

      expect(status.status).toBe("ok");
      expect(status.timestamp).toBe("2026-01-15T12:00:00.000Z");
    });
  });

  describe("getUptime", () => {
    it("returns elapsed whole seconds since service start", () => {
      const startedAt = new Date("2026-01-15T11:59:30.000Z").getTime();
      const useCases = new SystemUseCases({ startedAt });

      expect(useCases.getUptime()).toEqual({ uptimeSeconds: 30 });
    });

    it("floors partial seconds", () => {
      const startedAt = new Date("2026-01-15T11:59:59.750Z").getTime();
      const useCases = new SystemUseCases({ startedAt });

      expect(useCases.getUptime()).toEqual({ uptimeSeconds: 0 });
    });
  });
});
