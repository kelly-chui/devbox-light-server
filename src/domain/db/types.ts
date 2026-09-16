export type RecordData = Record<string, unknown>;

export type FilterValue = string | number | boolean | null;

export type RecordFilter = Record<string, FilterValue>;

export type ListRecordsOptions = {
  filter?: RecordFilter;
};

export type StoredRecord = {
  id: string;
  data: RecordData;
};
