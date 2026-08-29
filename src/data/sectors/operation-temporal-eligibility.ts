import type {
  RXTimePeriod,
} from "../../types/time";

import type {
  RXSectorsOperation,
} from "./sectors-operation";

export type RXTemporalEligibilityIssue =
  | "YEAR_REQUIRED"
  | "YEAR_RANGE_REQUIRED"
  | "DATE_RANGE_REQUIRED"
  | "RANGE_ORDER_INVALID"
  | "COMMODITY_RANGE_EXCEEDS_3_YEARS"
  | "MARKET_RANGE_EXCEEDS_90_DAYS";

export interface RXTemporalEligibilityResult {
  eligible: boolean;
  issues: RXTemporalEligibilityIssue[];
}

function isIntegerYear(
  value: number | undefined
): value is number {
  return (
    Number.isInteger(value) &&
    (value ?? 0) >= 1900
  );
}

function parseDateOnly(
  value: string | undefined
): Date | null {
  if (
    !value ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return null;
  }

  const date = new Date(
    `${value}T00:00:00.000Z`
  );

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !==
      value
  ) {
    return null;
  }

  return date;
}

function inclusiveDayCount(
  start: Date,
  end: Date
): number {
  const millisecondsPerDay =
    24 * 60 * 60 * 1000;

  return (
    Math.floor(
      (end.getTime() - start.getTime()) /
        millisecondsPerDay
    ) + 1
  );
}

function validateSingleYear(
  period: RXTimePeriod
): RXTemporalEligibilityResult {
  const eligible =
    period.kind === "YEAR" &&
    isIntegerYear(period.year);

  return {
    eligible,
    issues: eligible
      ? []
      : ["YEAR_REQUIRED"],
  };
}

function resolveCommodityYearRange(
  period: RXTimePeriod
):
  | {
      startYear: number;
      endYear: number;
    }
  | null {
  if (
    period.kind === "YEAR" &&
    isIntegerYear(period.year)
  ) {
    return {
      startYear: period.year,
      endYear: period.year,
    };
  }

  if (period.kind !== "RANGE") {
    return null;
  }

  const start = parseDateOnly(period.start);
  const end = parseDateOnly(period.end);

  if (!start || !end) {
    return null;
  }

  const startYear =
    start.getUTCFullYear();

  const endYear =
    end.getUTCFullYear();

  return {
    startYear,
    endYear,
  };
}

function validateCommodityRange(
  period: RXTimePeriod
): RXTemporalEligibilityResult {
  const range =
    resolveCommodityYearRange(period);

  if (!range) {
    return {
      eligible: false,
      issues: ["YEAR_RANGE_REQUIRED"],
    };
  }

  if (range.endYear < range.startYear) {
    return {
      eligible: false,
      issues: ["RANGE_ORDER_INVALID"],
    };
  }

  const inclusiveYears =
    range.endYear -
    range.startYear +
    1;

  if (inclusiveYears > 3) {
    return {
      eligible: false,
      issues: [
        "COMMODITY_RANGE_EXCEEDS_3_YEARS",
      ],
    };
  }

  return {
    eligible: true,
    issues: [],
  };
}

function validateMarketRange(
  period: RXTimePeriod
): RXTemporalEligibilityResult {
  if (period.kind !== "RANGE") {
    return {
      eligible: false,
      issues: ["DATE_RANGE_REQUIRED"],
    };
  }

  const start = parseDateOnly(period.start);
  const end = parseDateOnly(period.end);

  if (!start || !end) {
    return {
      eligible: false,
      issues: ["DATE_RANGE_REQUIRED"],
    };
  }

  if (end.getTime() < start.getTime()) {
    return {
      eligible: false,
      issues: ["RANGE_ORDER_INVALID"],
    };
  }

  if (
    inclusiveDayCount(start, end) > 90
  ) {
    return {
      eligible: false,
      issues: [
        "MARKET_RANGE_EXCEEDS_90_DAYS",
      ],
    };
  }

  return {
    eligible: true,
    issues: [],
  };
}

export function evaluateOperationTemporalEligibility(
  operation: RXSectorsOperation,
  period: RXTimePeriod
): RXTemporalEligibilityResult {
  switch (operation) {
    case "GET_MINING_OPERATIONAL_CONTEXT":
    case "GET_MINING_HISTORICAL_PERFORMANCE":
      return validateSingleYear(period);

    case "GET_COMMODITY_PRICE_HISTORY":
      return validateCommodityRange(period);

    case "GET_COMPANY_MARKET_TRANSACTION_HISTORY":
      return validateMarketRange(period);
  }
}