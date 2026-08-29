import type {
  RXSectorsTypedOperationRequest,
} from "./sectors-operation-request";

export type RXSectorsOperationRequestIssue =
  | "PURPOSE_REQUIRED"
  | "COMPANY_ID_REQUIRED"
  | "COMMODITY_REQUIRED"
  | "PERIOD_INVALID";

export interface RXSectorsOperationRequestValidation {
  valid: boolean;
  issues: RXSectorsOperationRequestIssue[];
}

function hasValidPeriod(
  period: {
    kind?: string;
    start?: string;
    end?: string;
    year?: number;
    quarter?: number;
    month?: number;
    measurementYear?: number;
    rawLabel?: string;
  } | undefined
): boolean {
  if (!period) {
    return false;
  }

  switch (period.kind) {
    case "DATE":
      return (
        typeof period.start === "string" &&
        period.start.trim().length > 0
      );

    case "MONTH":
      return (
        Number.isInteger(period.year) &&
        Number.isInteger(period.month) &&
        (period.month ?? 0) >= 1 &&
        (period.month ?? 0) <= 12
      );

    case "QUARTER":
      return (
        Number.isInteger(period.year) &&
        Number.isInteger(period.quarter) &&
        (period.quarter ?? 0) >= 1 &&
        (period.quarter ?? 0) <= 4
      );

    case "YEAR":
      return Number.isInteger(period.year);

    case "RANGE":
      return (
        typeof period.start === "string" &&
        period.start.trim().length > 0 &&
        typeof period.end === "string" &&
        period.end.trim().length > 0
      );

    case "UNKNOWN":
      return false;

    default:
      return false;
  }
}

export function validateSectorsOperationRequest(
  request: RXSectorsTypedOperationRequest
): RXSectorsOperationRequestValidation {
  const issues:
    RXSectorsOperationRequestIssue[] = [];

  if (!request.purpose.trim()) {
    issues.push("PURPOSE_REQUIRED");
  }

  if (
    request.operation ===
      "GET_COMMODITY_PRICE_HISTORY"
  ) {
    if (!request.params.commodity) {
      issues.push("COMMODITY_REQUIRED");
    }
  } else {
    if (!request.params.companyId.trim()) {
      issues.push("COMPANY_ID_REQUIRED");
    }
  }

  if (!hasValidPeriod(request.params.period)) {
    issues.push("PERIOD_INVALID");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}