import { SystemRepository } from "../../domain/system/system.js";
import type { SystemUptime } from "../../domain/system/types.js";

export type GetSystemUptimeUseCase = () => SystemUptime;

export function createGetSystemUptimeUseCase({
  systemRepository,
  now,
}: {
  systemRepository: SystemRepository;
  now: () => number;
}): GetSystemUptimeUseCase {
  return () => {
    const uptimeMs = now() - systemRepository.getStartedAt();
    return { uptimeSeconds: Math.floor(uptimeMs / 1000) };
  };
}
