import type {
  ListRecordsOptions,
  ListRecordsResult,
  StoredRecord,
} from "../../domain/db/types.js";

function getSortValue(record: StoredRecord, field: string): unknown {
  return field === "id" ? record.id : record.data[field];
}

function compareValues(left: unknown, right: unknown): number {
  if (left === right) return 0;
  if (left === undefined) return -1;
  if (right === undefined) return 1;
  if (left === null) return -1;
  if (right === null) return 1;

  if (typeof left === "string" && typeof right === "string") {
    if (left < right) return -1;
    if (left > right) return 1;
  }
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  if (typeof left === "boolean" && typeof right === "boolean") {
    return Number(left) - Number(right);
  }

  return String(left).localeCompare(String(right));
}

function filterRecords(
  records: StoredRecord[],
  filter: ListRecordsOptions["filter"],
): StoredRecord[] {
  if (filter === undefined) return records;
  return records.filter((record) =>
    Object.entries(filter).every(([field, value]) =>
      (field === "id" ? record.id : record.data[field]) === value,
    ),
  );
}

function sortRecords(
  records: StoredRecord[],
  sort: ListRecordsOptions["sort"],
): StoredRecord[] {
  if (sort === undefined) return records;
  const direction = sort.direction === "asc" ? 1 : -1;
  return records.sort((left, right) => {
    const comparison = compareValues(
      getSortValue(left, sort.field),
      getSortValue(right, sort.field),
    );
    if (comparison !== 0) return comparison * direction;
    return left.id.localeCompare(right.id);
  });
}

export function applyListRecordsOptions(
  records: StoredRecord[],
  options?: ListRecordsOptions,
): ListRecordsResult {
  const filteredRecords = filterRecords(records, options?.filter);
  const sortedRecords = sortRecords(filteredRecords, options?.sort);
  const total = sortedRecords.length;
  const offset = options?.offset ?? 0;
  const paginatedRecords = options?.limit === undefined
    ? sortedRecords.slice(offset)
    : sortedRecords.slice(offset, offset + options.limit);

  return { records: paginatedRecords, total };
}
