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
  admitMiningSalesDestinationEvidence,
} from "./admit-mining-sales-destination-evidence";

import {
  analyzeMiningSalesDestination,
} from "./analyze-mining-sales-destination";

export interface RXLiveSalesDestinationInvestigationInput {
  sectorsApiKey: string;

  companyId: string;

  sectorsSlug: string;

  year: number;

  retrievedAt?: string;
}

export type RXLiveSalesDestinationInvestigationResult =
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
              typeof admitMiningSalesDestinationEvidence
            >,
            {
              status:
                "ADMITTED";
            }
          >["collection"];

        admittedObservations:
          Extract<
            ReturnType<
              typeof admitMiningSalesDestinationEvidence
            >,
            {
              status:
                "ADMITTED";
            }
          >["admittedObservations"];
      };

      analysis:
        ReturnType<
          typeof analyzeMiningSalesDestination
        >;

      issues:
        [];
    };

/**
 * Executes the canonical Sales Destination path.
 *
 * IMPORTANT:
 * - Uses GET_MINING_SALES_DESTINATION as the verified
 *   Sectors transport operation.
 * - Runtime credit budget is exactly one request.
 * - Destination labels remain provider-defined.
 * - Missing provider values remain missing.
 * - No revenue, volume, or percentage is derived.
 * - No domestic/export classification is invented.
 * - No concentration score or ranking is created.
 * - Deterministic analysis consumes admitted evidence only.
 * - No causal conclusion is manufactured.
 */
export async function runLiveSalesDestinationInvestigation(
  input:
    RXLiveSalesDestinationInvestigationInput,
): Promise<RXLiveSalesDestinationInvestigationResult> {
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
          "GET_MINING_SALES_DESTINATION",

        purpose:
          "Collect admitted mining sales-destination evidence.",

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
    admitMiningSalesDestinationEvidence({
      request: {
        requestId:
          `SALES-DESTINATION-${companyId}-R1`,

        requirementId:
          `SALES-DESTINATION-${companyId}-E1`,

        source:
          "SECTORS",

        capability:
          "MINING_SALES_DESTINATION",

        purpose:
          "Collect admitted mining sales-destination evidence.",

        status:
          "PLANNED",
      },

      companyId,

      requestedYear:
        input.year,

      sourceReference:
        `sectors:sales-destination:${sectorsSlug}:${input.year}`,

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
    analyzeMiningSalesDestination(
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