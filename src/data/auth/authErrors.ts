export class InvalidTokenFileError extends Error {
  readonly filePath: string;

  constructor(filePath: string) {
    super(`Invalid token file: ${filePath}`);
    this.name = "InvalidTokenFileError";
    this.filePath = filePath;
  }
}
