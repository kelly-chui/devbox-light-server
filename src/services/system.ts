export type SystemStatus = {
  status: "ok";
  timestamp: string;
};

export type SystemUptime = {
  uptimeSeconds: number;
};

export type SystemServiceOptions = {
  startedAt?: number;
};

export class SystemService {
  private readonly startedAt: number;

  constructor(options: SystemServiceOptions = {}) {
    this.startedAt = options.startedAt ?? Date.now();
  }

  getStatus(): SystemStatus {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }

  getUptime(): SystemUptime {
    const uptimeMs = Date.now() - this.startedAt;
    return {
      uptimeSeconds: Math.floor(uptimeMs / 1000),
    };
  }
}
