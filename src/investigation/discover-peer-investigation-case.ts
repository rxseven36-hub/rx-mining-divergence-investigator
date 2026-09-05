import type {
  SectorsAdapter,
} from "../data/sectors/sectors-adapter";

import {
  compileSectorsRestRequest,
} from "../data/sectors/sectors-rest-request-compiler";

import type {
  RXSectorsTypedOperationRequest,
} from "../data/sectors/sectors-operation-request";

import type {
  RXCompany,
} from "../types/company";

import type {
  RXInvestigationDataRequest,
} from "./investigation-plan";

import {
  admitMiningOperationalContextEvidence,
} from "./admit-mining-operational-context-evidence";

import {
  admitMiningHistoricalPerformanceEvidence,
} from "./admit-mining-historical-performance-evidence";

import {
  selectAdmittedPeerInvestigationCase,
} from "./select-admitted-peer-investigation-case";

export interface RXPeerInvestigationDiscoveryInput {
  adapter:
    SectorsAdapter;

  firstCompany:
    RXCompany;

  secondCompany:
    RXCompany;

  year:
    number;

  retrievedAt?:
    string;
}

export type RXPeerInvestigationDiscoveryResult =
  | {
      status:
        "DISCOVERED";

      firstCompany:
        RXCompany;

      secondCompany:
        RXCompany;

      selection:
        Extract<
          ReturnType<
            typeof selectAdmittedPeerInvestigationCase
          >,
          {
            status:
              "SELECTED";
          }
        >;

      estimatedCreditsUsed:
        4;

      causalConclusion:
        "UNKNOWN";

      issues:
        [];
    }
  | {
      status:
        "REJECTED";

      firstCompany:
        RXCompany;

      secondCompany:
        RXCompany;

      selection:
        ReturnType<
          typeof selectAdmittedPeerInvestigationCase
        > | null;

      estimatedCreditsUsed:
        number;

      causalConclusion:
        "UNKNOWN";

      issues:
        string[];
    };

interface RXDiscoveryRequestExecution {
  payload:
    unknown;

  sourceReference:
    string;
}

function createAdmissionRequest(
  requestId:
    string,
  requirementId:
    string,
  capability:
    "MINING_OPERATIONAL_CONTEXT" |
    "MINING_HISTORICAL_PERFORMANCE",
  purpose:
    string
): RXInvestigationDataRequest {
  return {
    requestId,
    requirementId,
    source:
      "SECTORS",
    capability,
    purpose,
    status:
      "PLANNED",
  };
}

async function executeDiscoveryOperation(
  adapter:
    SectorsAdapter,
  operation:
    RXSectorsTypedOperationRequest
): Promise<
  RXDiscoveryRequestExecution
> {
  const compiled =
    compileSectorsRestRequest(
      operation
    );

  if (
    compiled.status !==
      "COMPILED"
  ) {
    throw new Error(
      `SECTORS_DISCOVERY_REQUEST_REJECTED:${compiled.issues.join(
        ","
      )}`
    );
  }

  const payload =
    await adapter.requestJson<unknown>(
      compiled.request
    );

  return {
    payload,

    sourceReference:
      `sectors:${compiled.request.path}`,
  };
}

/**
 * Discovers one canonical peer investigation case from
 * real Sectors operational and historical evidence.
 *
 * Discovery performs exactly four intended Sectors requests:
 *
 * 1. first-company operational context,
 * 2. second-company operational context,
 * 3. first-company historical performance,
 * 4. second-company historical performance.
 *
 * Existing RX boundaries remain authoritative for:
 * - REST request compilation,
 * - evidence admission,
 * - typed intelligence evidence,
 * - peer eligibility,
 * - observation matching,
 * - divergence calculation,
 * - deterministic scoring,
 * - canonical selection,
 * - deterministic ranking,
 * - investigation-case construction.
 *
 * This function does NOT:
 * - manufacture Sectors evidence,
 * - manufacture commodity identity,
 * - invent a divergence,
 * - score or rank independently,
 * - repair rejected evidence,
 * - call AI,
 * - establish causality.
 *
 * Network/API failures intentionally propagate.
 */
export async function discoverPeerInvestigationCase(
  input:
    RXPeerInvestigationDiscoveryInput
): Promise<
  RXPeerInvestigationDiscoveryResult
> {
  if (
    input.firstCompany.id.trim()
      .length === 0 ||
    input.secondCompany.id.trim()
      .length === 0
  ) {
    return {
      status:
        "REJECTED",

      firstCompany:
        input.firstCompany,

      secondCompany:
        input.secondCompany,

      selection:
        null,

      estimatedCreditsUsed:
        0,

      causalConclusion:
        "UNKNOWN",

      issues: [
        "COMPANY_ID_MISSING",
      ],
    };
  }

  if (
    input.firstCompany.id ===
    input.secondCompany.id
  ) {
    return {
      status:
        "REJECTED",

      firstCompany:
        input.firstCompany,

      secondCompany:
        input.secondCompany,

      selection:
        null,

      estimatedCreditsUsed:
        0,

      causalConclusion:
        "UNKNOWN",

      issues: [
        "SAME_COMPANY",
      ],
    };
  }

  const firstSlug =
    input.firstCompany
      .sectorsSlug?.trim() ??
    "";

  const secondSlug =
    input.secondCompany
      .sectorsSlug?.trim() ??
    "";

  if (
    firstSlug.length === 0 ||
    secondSlug.length === 0
  ) {
    return {
      status:
        "REJECTED",

      firstCompany:
        input.firstCompany,

      secondCompany:
        input.secondCompany,

      selection:
        null,

      estimatedCreditsUsed:
        0,

      causalConclusion:
        "UNKNOWN",

      issues: [
        "SECTORS_SLUG_MISSING",
      ],
    };
  }

  if (
    !Number.isInteger(
      input.year
    ) ||
    input.year < 1900 ||
    input.year > 2100
  ) {
    return {
      status:
        "REJECTED",

      firstCompany:
        input.firstCompany,

      secondCompany:
        input.secondCompany,

      selection:
        null,

      estimatedCreditsUsed:
        0,

      causalConclusion:
        "UNKNOWN",

      issues: [
        "YEAR_INVALID",
      ],
    };
  }

  let estimatedCreditsUsed =
    0;

  const firstOperationalRequest =
    createAdmissionRequest(
      "DISCOVERY-FIRST-OPERATIONAL",
      "DISCOVERY-FIRST-OPERATIONAL-EVIDENCE",
      "MINING_OPERATIONAL_CONTEXT",
      "Collect operational context required to evaluate peer eligibility for the first company."
    );

  const firstOperationalExecution =
    await executeDiscoveryOperation(
      input.adapter,
      {
        operation:
          "GET_MINING_OPERATIONAL_CONTEXT",

        purpose:
          firstOperationalRequest.purpose,

        params: {
          sectorsSlug:
            firstSlug,
        },
      }
    );

  estimatedCreditsUsed +=
    1;

  const firstOperationalAdmission =
    admitMiningOperationalContextEvidence({
      request:
        firstOperationalRequest,

      companyId:
        input.firstCompany.id,

      sourceReference:
        firstOperationalExecution
          .sourceReference,

      payload:
        firstOperationalExecution
          .payload,

      retrievedAt:
        input.retrievedAt,
    });

  if (
    firstOperationalAdmission.status !==
      "ADMITTED"
  ) {
    return {
      status:
        "REJECTED",

      firstCompany:
        input.firstCompany,

      secondCompany:
        input.secondCompany,

      selection:
        null,

      estimatedCreditsUsed,

      causalConclusion:
        "UNKNOWN",

      issues: [
        "FIRST_OPERATIONAL_EVIDENCE_NOT_ADMITTED",
        ...firstOperationalAdmission
          .collection.issues,
      ],
    };
  }

  const secondOperationalRequest =
    createAdmissionRequest(
      "DISCOVERY-SECOND-OPERATIONAL",
      "DISCOVERY-SECOND-OPERATIONAL-EVIDENCE",
      "MINING_OPERATIONAL_CONTEXT",
      "Collect operational context required to evaluate peer eligibility for the second company."
    );

  const secondOperationalExecution =
    await executeDiscoveryOperation(
      input.adapter,
      {
        operation:
          "GET_MINING_OPERATIONAL_CONTEXT",

        purpose:
          secondOperationalRequest.purpose,

        params: {
          sectorsSlug:
            secondSlug,
        },
      }
    );

  estimatedCreditsUsed +=
    1;

  const secondOperationalAdmission =
    admitMiningOperationalContextEvidence({
      request:
        secondOperationalRequest,

      companyId:
        input.secondCompany.id,

      sourceReference:
        secondOperationalExecution
          .sourceReference,

      payload:
        secondOperationalExecution
          .payload,

      retrievedAt:
        input.retrievedAt,
    });

  if (
    secondOperationalAdmission.status !==
      "ADMITTED"
  ) {
    return {
      status:
        "REJECTED",

      firstCompany:
        input.firstCompany,

      secondCompany:
        input.secondCompany,

      selection:
        null,

      estimatedCreditsUsed,

      causalConclusion:
        "UNKNOWN",

      issues: [
        "SECOND_OPERATIONAL_EVIDENCE_NOT_ADMITTED",
        ...secondOperationalAdmission
          .collection.issues,
      ],
    };
  }

  const firstHistoricalRequest =
    createAdmissionRequest(
      "DISCOVERY-FIRST-HISTORICAL",
      "DISCOVERY-FIRST-HISTORICAL-EVIDENCE",
      "MINING_HISTORICAL_PERFORMANCE",
      "Collect comparable historical mining performance for the first company."
    );

  const firstHistoricalExecution =
    await executeDiscoveryOperation(
      input.adapter,
      {
        operation:
          "GET_MINING_HISTORICAL_PERFORMANCE",

        purpose:
          firstHistoricalRequest.purpose,

        params: {
          sectorsSlug:
            firstSlug,

          period: {
            kind:
              "YEAR",

            year:
              input.year,
          },
        },
      }
    );

  estimatedCreditsUsed +=
    1;

  const firstHistoricalAdmission =
    admitMiningHistoricalPerformanceEvidence({
      request:
        firstHistoricalRequest,

      companyId:
        input.firstCompany.id,

      sourceReference:
        firstHistoricalExecution
          .sourceReference,

      payload:
        firstHistoricalExecution
          .payload,

      retrievedAt:
        input.retrievedAt,
    });

  if (
    firstHistoricalAdmission.status !==
      "ADMITTED"
  ) {
    return {
      status:
        "REJECTED",

      firstCompany:
        input.firstCompany,

      secondCompany:
        input.secondCompany,

      selection:
        null,

      estimatedCreditsUsed,

      causalConclusion:
        "UNKNOWN",

      issues: [
        "FIRST_HISTORICAL_EVIDENCE_NOT_ADMITTED",
        ...firstHistoricalAdmission
          .collection.issues,
      ],
    };
  }

  const secondHistoricalRequest =
    createAdmissionRequest(
      "DISCOVERY-SECOND-HISTORICAL",
      "DISCOVERY-SECOND-HISTORICAL-EVIDENCE",
      "MINING_HISTORICAL_PERFORMANCE",
      "Collect comparable historical mining performance for the second company."
    );

  const secondHistoricalExecution =
    await executeDiscoveryOperation(
      input.adapter,
      {
        operation:
          "GET_MINING_HISTORICAL_PERFORMANCE",

        purpose:
          secondHistoricalRequest.purpose,

        params: {
          sectorsSlug:
            secondSlug,

          period: {
            kind:
              "YEAR",

            year:
              input.year,
          },
        },
      }
    );

  estimatedCreditsUsed +=
    1;

  const secondHistoricalAdmission =
    admitMiningHistoricalPerformanceEvidence({
      request:
        secondHistoricalRequest,

      companyId:
        input.secondCompany.id,

      sourceReference:
        secondHistoricalExecution
          .sourceReference,

      payload:
        secondHistoricalExecution
          .payload,

      retrievedAt:
        input.retrievedAt,
    });

  if (
    secondHistoricalAdmission.status !==
      "ADMITTED"
  ) {
    return {
      status:
        "REJECTED",

      firstCompany:
        input.firstCompany,

      secondCompany:
        input.secondCompany,

      selection:
        null,

      estimatedCreditsUsed,

      causalConclusion:
        "UNKNOWN",

      issues: [
        "SECOND_HISTORICAL_EVIDENCE_NOT_ADMITTED",
        ...secondHistoricalAdmission
          .collection.issues,
      ],
    };
  }

  const selection =
    selectAdmittedPeerInvestigationCase({
      leftCompanyId:
        input.firstCompany.id,

      rightCompanyId:
        input.secondCompany.id,

      leftOperationalAdmission:
        firstOperationalAdmission,

      rightOperationalAdmission:
        secondOperationalAdmission,

      leftHistoricalAdmission:
        firstHistoricalAdmission,

      rightHistoricalAdmission:
        secondHistoricalAdmission,
    });

  if (
    selection.status !==
      "SELECTED"
  ) {
    return {
      status:
        "REJECTED",

      firstCompany:
        input.firstCompany,

      secondCompany:
        input.secondCompany,

      selection,

      estimatedCreditsUsed,

      causalConclusion:
        "UNKNOWN",

      issues: [
        ...selection.issues,
      ],
    };
  }

  return {
    status:
      "DISCOVERED",

    firstCompany:
      input.firstCompany,

    secondCompany:
      input.secondCompany,

    selection,

    estimatedCreditsUsed:
      4,

    causalConclusion:
      "UNKNOWN",

    issues: [],
  };
}