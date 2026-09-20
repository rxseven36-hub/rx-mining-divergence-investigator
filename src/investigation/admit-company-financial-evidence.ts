import {
  sectorsCompanyFinancialReportSchema,
} from "../data/schemas/sectors-company-financial-report";

import {
  normalizeCompanyFinancialReport,
} from "../data/normalization/normalize-company-financial-report";

import type {
  RXNormalizedFinancialObservation,
} from "../data/normalization/normalize-company-financial-report";

export interface RXCompanyFinancialEvidenceAdmissionInput {
  companyId:
    string;

  sourceReference:
    string;

  payload:
    unknown;

  retrievedAt?:
    string;
}

export type RXCompanyFinancialEvidenceAdmissionResult =
  | {
      status:
        "ADMITTED";

      observations:
        RXNormalizedFinancialObservation[];

      admittedObservations:
        RXNormalizedFinancialObservation[];

      issues:
        [];
    }
  | {
      status:
        "REJECTED";

      observations:
        RXNormalizedFinancialObservation[];

      admittedObservations:
        [];

      issues:
        string[];
    };

/**
 * Dedicated Sectors MCP Financial evidence boundary.
 *
 * The admitted contract is intentionally narrower than
 * the transport payload. Only explicitly whitelisted
 * historical provider facts become RX evidence.
 */
export function admitCompanyFinancialEvidence(
  input:
    RXCompanyFinancialEvidenceAdmissionInput,
): RXCompanyFinancialEvidenceAdmissionResult {
  const parsed =
    sectorsCompanyFinancialReportSchema.safeParse(
      input.payload,
    );

  if (!parsed.success) {
    return {
      status:
        "REJECTED",

      observations:
        [],

      admittedObservations:
        [],

      issues: [
        "INVALID_RESPONSE",
      ],
    };
  }

  const observations =
    normalizeCompanyFinancialReport({
      companyId:
        input.companyId,

      report:
        parsed.data,

      source:
        input.sourceReference,

      retrievedAt:
        input.retrievedAt,
    });

  if (observations.length === 0) {
    return {
      status:
        "REJECTED",

      observations,

      admittedObservations:
        [],

      issues: [
        "NO_ADMISSIBLE_FINANCIAL_EVIDENCE",
      ],
    };
  }

  return {
    status:
      "ADMITTED",

    observations,

    admittedObservations:
      observations,

    issues: [],
  };
}