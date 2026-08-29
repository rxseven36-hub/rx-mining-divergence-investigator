export type TruthClass =
  | "SOURCE_FACT"
  | "COMPUTED_FACT"
  | "INFERENCE"
  | "UNKNOWN";

export interface TruthRecord<T = unknown> {
  classification: TruthClass;
  value: T;
  source?: string;
  note?: string;
}
