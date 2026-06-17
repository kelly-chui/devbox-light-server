export class FileNotFoundError extends Error {
  readonly name = "FileNotFoundError";

  constructor(readonly key: string) {
    super(`File not found: ${key}`);
  }
}
