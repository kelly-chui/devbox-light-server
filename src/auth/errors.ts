export class UserNotFoundError extends Error {
  readonly userId: string;

  constructor(userId: string) {
    super(`User not found: ${userId}`);
    this.name = "UserNotFoundError";
    this.userId = userId;
  }
}

export class InvalidTokenError extends Error {
  constructor() {
    super("Invalid authentication token.");
    this.name = "InvalidTokenError";
  }
}

export class InvalidTokenFileError extends Error {
  readonly filePath: string;

  constructor(filePath: string) {
    super(`Invalid token file: ${filePath}`);
    this.name = "InvalidTokenFileError";
    this.filePath = filePath;
  }
}
