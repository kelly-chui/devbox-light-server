import type { SystemStatus } from "../../domain/system/types.js";

export type GetSystemStatusUseCase = () => SystemStatus;

export function createGetSystemStatusUseCase({
  now,
}: { now: () => number }): GetSystemStatusUseCase {
  return () => ({
    status: "ok",
    timestamp: new Date(now()).toISOString(),
  });
}
