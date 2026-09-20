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
  admitMiningProductQualityEvidence,
} from "./admit-mining-product-quality-evidence";

import {
  analyzeMiningProductQuality,
} from "./analyze-mining-product-quality";

export interface RXLiveProductQualityInvestigationInput {
  sectorsApiKey: string;

  companyId: string;

  sectorsSlug: string;

  year: number;

  retrievedAt?: string;
}

export type RXLiveProductQualityInvestigationResult =
  | {
      status:
        "REJECTED";

      stage:
        | "EXECUTION"
        | "ADMISSION";

      causalConclusion:
        "UNKNOWN";

      evidence:
        null;

      analysis:
        null;

      issues:
        string[];
    }
  | {
      status:
        "ACCEPTED";

      stage:
        "COMPLETE";

      causalConclusion:
        "UNKNOWN";

      evidence: {
        collection:
          Extract<
            ReturnType<
              typeof admitMiningProductQualityEvidence
            >,
            {
              status:
                "ADMITTED";
            }
          >["collection"];

        admittedObservations:
          Extract<
            ReturnType<
              typeof admitMiningProductQualityEvidence
            >,
            {
              status:
                "ADMITTED";
            }
          >["admittedObservations"];
      };

      analysis:
        ReturnType<
          typeof analyzeMiningProductQuality
        >;

      issues:
        [];
    };

/**
 * Executes the canonical Product Quality path.
 *
 * IMPORTANT:
 * - Reuses GET_MINING_HISTORICAL_PERFORMANCE only as
 *   the verified Sectors transport operation.
 * - Runtime credit budget is exactly one request.
 * - Product-quality admission remains dedicated.
 * - Deterministic analysis consumes admitted evidence only.
 * - Product identity remains explicit.
 * - ARB and ADB remain distinct.
 * - Source min/max ranges remain intact.
 * - No midpoint, score, ranking, or causal conclusion
 *   is manufactured.
 */
export async function runLiveProductQualityInvestigation(
  input:
    RXLiveProductQualityInvestigationInput,
): Promise<RXLiveProductQualityInvestigationResult> {
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
          "Collect admitted mining product-quality evidence.",

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

      issues:
        execution.status === "REJECTED"
          ? [...execution.issues]
          : ["SECTORS_EXECUTION_FAILED"],
    };
  }

  const admission =
    admitMiningProductQualityEvidence({
      request: {
        requestId:
          `PRODUCT-QUALITY-${companyId}-R1`,

        requirementId:
          `PRODUCT-QUALITY-${companyId}-E1`,

        source:
          "SECTORS",

        capability:
          "MINING_HISTORICAL_PERFORMANCE",

        purpose:
          "Collect admitted mining product-quality evidence.",

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
    analyzeMiningProductQuality(
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