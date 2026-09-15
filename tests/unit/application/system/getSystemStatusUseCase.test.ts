import { describe, expect, it } from "vitest";
import { createGetSystemStatusUseCase } from "../../../../src/application/system/getSystemStatusUseCase.js";

describe("createGetSystemStatusUseCase", () => {
  it("returns an ok status with an ISO timestamp", () => {
    const getSystemStatus = createGetSystemStatusUseCase({
      now: () => new Date("2026-01-15T12:00:00.000Z").getTime(),
    });

    expect(getSystemStatus()).toEqual({
      status: "ok",
      timestamp: "2026-01-15T12:00:00.000Z",
    });
  });
});
