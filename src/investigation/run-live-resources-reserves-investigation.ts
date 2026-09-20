import {
  RestSectorsAdapter,
} from "../data/sectors/sectors-adapter";

import {
  SectorsCreditBudget,
} from "../data/sectors/credit-budget";

import {
  SectorsHttpClient,
} from "../data/sectors/sectors-http-client";

import {
  executeSectorsOperation,
} from "../data/sectors/execute-sectors-operation";

import {
  admitMiningResourcesReservesEvidence,
} from "./admit-mining-resources-reserves-evidence";

import {
  analyzeMiningResourcesReserves,
} from "./analyze-mining-resources-reserves";

export interface RXLiveResourcesReservesInvestigationInput {
  sectorsApiKey: string;
  companyId: string;
  sectorsSlug: string;
  year: number;
  retrievedAt?: string;
}

export type RXLiveResourcesReservesInvestigationResult =
  | {
      status: "REJECTED";
      stage:
        | "EXECUTION"
        | "ADMISSION";
      causalConclusion: "UNKNOWN";
      evidence: null;
      analysis: null;
      issues: string[];
    }
  | {
      status: "ACCEPTED";
      stage: "COMPLETE";
      causalConclusion: "UNKNOWN";
      evidence: {
        collection:
          Extract<
            ReturnType<
              typeof admitMiningResourcesReservesEvidence
            >,
            {
              status: "ADMITTED";
            }
          >["collection"];

        admittedObservations:
          Extract<
            ReturnType<
              typeof admitMiningResourcesReservesEvidence
            >,
            {
              status: "ADMITTED";
            }
          >["admittedObservations"];
      };

      analysis:
        ReturnType<
          typeof analyzeMiningResourcesReserves
        >;

      issues: [];
    };

/**
 * Executes the canonical Resources / Reserves path.
 *
 * Historical-performance is reused only as the verified
 * Sectors transport operation.
 *
 * Geological evidence keeps its own measurement year.
 * The selected performance year is never silently treated
 * as the geological measurement year.
 */
export async function runLiveResourcesReservesInvestigation(
  input:
    RXLiveResourcesReservesInvestigationInput,
): Promise<RXLiveResourcesReservesInvestigationResult> {
  const sectorsApiKey =
    input.sectorsApiKey.trim();

  const companyId =
    input.companyId.trim();

  const sectorsSlug =
    input.sectorsSlug.trim();

  if (sectorsApiKey.length === 0) {
    throw new Error(
      "SECTORS_API_KEY is required",
    );
  }

  if (companyId.length === 0) {
    throw new Error(
      "companyId is required",
    );
  }

  if (sectorsSlug.length === 0) {
    throw new Error(
      "sectorsSlug is required",
    );
  }

  if (
    !Number.isInteger(input.year) ||
    input.year < 1900 ||
    input.year > 2100
  ) {
    throw new Error(
      "year must be a valid integer year",
    );
  }

  const client =
    new SectorsHttpClient({
      apiKey:
        sectorsApiKey,

      creditBudget:
        new SectorsCreditBudget(1),
    });

  const adapter =
    new RestSectorsAdapter(
      client,
    );

  const execution =
    await executeSectorsOperation<unknown>(
      adapter,
      {
        operation:
          "GET_MINING_HISTORICAL_PERFORMANCE",

        purpose:
          "Collect admitted geological resources and reserves evidence.",

        params: {
          sectorsSlug,

          period: {
            kind:
              "YEAR",

            year:
              input.year,
          },
        },
      },
    );

  if (
    execution.status !==
    "EXECUTED"
  ) {
    return {
      status:
        "REJECTED",

      stage:
        "EXECUTION",

      causalConclusion:
        "UNKNOWN",

      evidence:
        null,

      analysis:
        null,

      issues: [
        execution.status,
      ],
    };
  }

  const admission =
    admitMiningResourcesReservesEvidence({
      request: {
        requestId:
          `RESOURCES-RESERVES-${companyId}-R1`,

        requirementId:
          `RESOURCES-RESERVES-${companyId}-E1`,

        source:
          "SECTORS",

        capability:
          "MINING_HISTORICAL_PERFORMANCE",

        purpose:
          "Collect admitted geological resources and reserves evidence.",

        status:
          "PLANNED",
      },

      companyId,

      sourceReference:
        `sectors:mining-historical-performance:${sectorsSlug}:${input.year}`,

      payload:
        execution.data,

      retrievedAt:
        input.retrievedAt,
    });

  if (
    admission.status !==
    "ADMITTED"
  ) {
    return {
      status:
        "REJECTED",

      stage:
        "ADMISSION",

      causalConclusion:
        "UNKNOWN",

      evidence:
        null,

      analysis:
        null,

      issues: [
        ...admission.collection.issues,
      ],
    };
  }

  const analysis =
    analyzeMiningResourcesReserves(
      admission,
    );

  return {
    status:
      "ACCEPTED",

    stage:
      "COMPLETE",

    causalConclusion:
      "UNKNOWN",

    evidence: {
      collection:
        admission.collection,

      admittedObservations:
        admission.admittedObservations,
    },

    analysis,

    issues: [],
  };
}