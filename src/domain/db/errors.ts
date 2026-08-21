export class RecordNotFoundError extends Error {
  readonly name = "RecordNotFoundError";

  constructor(
    readonly collection: string,
    readonly id: string,
  ) {
    super(`Record not found: ${collection}/${id}`);
  }
}

export class InvalidCollectionNameError extends Error {
  readonly name = "InvalidCollectionNameError";

  constructor(readonly collection: string) {
    super(`Invalid collection name: ${collection}`);
  }
}

export class InvalidDatabaseFileError extends Error {
  readonly name = "InvalidDatabaseFileError";

  constructor(readonly filePath: string) {
    super(`Invalid database file: ${filePath}`);
  }
}
