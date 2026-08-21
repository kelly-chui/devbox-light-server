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

export class AuthStorageError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("Authentication storage failed.", options);
    this.name = "AuthStorageError";
  }
}
