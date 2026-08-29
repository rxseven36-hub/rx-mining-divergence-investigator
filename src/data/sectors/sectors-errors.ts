export type SectorsClientErrorCode =
  | "MISSING_API_KEY"
  | "INVALID_REQUEST"
  | "CREDIT_BUDGET_EXCEEDED"
  | "NETWORK_ERROR"
  | "HTTP_ERROR"
  | "INVALID_JSON";

export interface SectorsClientErrorOptions {
  code: SectorsClientErrorCode;
  message: string;
  status?: number;
  retryAfter?: string;
}

export class SectorsClientError extends Error {
  readonly code: SectorsClientErrorCode;
  readonly status?: number;
  readonly retryAfter?: string;

  constructor(options: SectorsClientErrorOptions) {
    super(options.message);

    this.name = "SectorsClientError";
    this.code = options.code;
    this.status = options.status;
    this.retryAfter = options.retryAfter;
  }
}