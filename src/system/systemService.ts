import type { SystemStatus, SystemUptime } from "./types.js";
import { SystemRepository } from "./system.js";

export type { SystemStatus, SystemUptime } from "./types.js";

export type SystemServiceOptions = {
  startedAt?: number;
};

export class SystemService {
  private readonly systemRepository: SystemRepository;

  constructor(systemRepository: SystemRepository);
  constructor(options: SystemServiceOptions);
  constructor(
    optionsOrRepository: SystemServiceOptions | SystemRepository = {},
  ) {
    this.systemRepository =
      optionsOrRepository instanceof SystemRepository
        ? optionsOrRepository
        : new SystemRepository(optionsOrRepository);
  }

  getStatus(): SystemStatus {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }

  getUptime(): SystemUptime {
    const uptimeMs = Date.now() - this.systemRepository.getStartedAt();
    return { uptimeSeconds: Math.floor(uptimeMs / 1000) };
  }
}
