export type RecordData = Record<string, unknown>;

export type FilterValue = string | number | boolean | null;

export type RecordFilter = Record<string, FilterValue>;

export type SortDirection = "asc" | "desc";

export type RecordSort = {
  field: string;
  direction: SortDirection;
};

export type ListRecordsOptions = {
  filter?: RecordFilter;
  sort?: RecordSort;
  offset?: number;
  limit?: number;
};

export type StoredRecord = {
  id: string;
  data: RecordData;
};

export type ListRecordsResult = {
  records: StoredRecord[];
  total: number;
};
