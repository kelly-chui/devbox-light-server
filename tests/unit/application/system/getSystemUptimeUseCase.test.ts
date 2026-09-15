import { describe, expect, it } from "vitest";
import { createGetSystemUptimeUseCase } from "../../../../src/application/system/getSystemUptimeUseCase.js";
import { SystemRepository } from "../../../../src/domain/system/system.js";

describe("createGetSystemUptimeUseCase", () => {
  it("returns elapsed whole seconds", () => {
    const getSystemUptime = createGetSystemUptimeUseCase({
      systemRepository: new SystemRepository({
        startedAt: new Date("2026-01-15T11:59:30.000Z").getTime(),
      }),
      now: () => new Date("2026-01-15T12:00:00.000Z").getTime(),
    });

    expect(getSystemUptime()).toEqual({ uptimeSeconds: 30 });
  });

  it("floors partial seconds", () => {
    const getSystemUptime = createGetSystemUptimeUseCase({
      systemRepository: new SystemRepository({
        startedAt: new Date("2026-01-15T11:59:59.750Z").getTime(),
      }),
      now: () => new Date("2026-01-15T12:00:00.000Z").getTime(),
    });

    expect(getSystemUptime()).toEqual({ uptimeSeconds: 0 });
  });
});
