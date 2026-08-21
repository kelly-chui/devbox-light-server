export type SystemRepositoryOptions = {
  startedAt?: number;
};

export class SystemRepository {
  private readonly startedAt: number;

  constructor(options: SystemRepositoryOptions = {}) {
    this.startedAt = options.startedAt ?? Date.now();
  }

  getStartedAt(): number {
    return this.startedAt;
  }
}
