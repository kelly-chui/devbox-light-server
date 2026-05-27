export class RecordNotFoundError extends Error {
  readonly name = "RecordNotFoundError";

  constructor(
    readonly collection: string,
    readonly id: string,
  ) {
    super(`Record not found: ${collection}/${id}`);
  }
}
