import type { SystemStatus, SystemUptime } from "../domain/system/types.js";
import { SystemRepository } from "../domain/system/system.js";

export type { SystemStatus, SystemUptime } from "../domain/system/types.js";

export type SystemUseCasesOptions = {
  startedAt?: number;
};

export class SystemUseCases {
  private readonly systemRepository: SystemRepository;

  constructor(systemRepository: SystemRepository);
  constructor(options: SystemUseCasesOptions);
  constructor(
    optionsOrRepository: SystemUseCasesOptions | SystemRepository = {},
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

export { SystemUseCases as SystemService };
