export class DatabaseRecordNotFoundError extends Error {
  readonly name = "DatabaseRecordNotFoundError";
  constructor(readonly collection: string, readonly id: string) {
    super(`Record not found: ${collection}/${id}`);
  }
}

export class DatabaseInvalidCollectionError extends Error {
  readonly name = "DatabaseInvalidCollectionError";
  constructor(readonly collection: string) {
    super(`Invalid collection name: ${collection}`);
  }
}

export class DatabaseReadError extends Error {
  readonly name = "DatabaseReadError";
  constructor(options?: { cause?: unknown }) { super("Database read failed.", options); }
}

export class DatabaseWriteError extends Error {
  readonly name = "DatabaseWriteError";
  constructor(options?: { cause?: unknown }) { super("Database write failed.", options); }
}
