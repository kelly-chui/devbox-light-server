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
