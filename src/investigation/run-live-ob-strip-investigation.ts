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
  admitMiningObStripEvidence,
} from "./admit-mining-ob-strip-evidence";

import {
  analyzeMiningObStrip,
} from "./analyze-mining-ob-strip";

export interface RXLiveObStripInvestigationInput {
  sectorsApiKey: string;

  companyId: string;

  sectorsSlug: string;

  year: number;

  retrievedAt?: string;
}

export type RXLiveObStripInvestigationResult =
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
              typeof admitMiningObStripEvidence
            >,
            {
              status: "ADMITTED";
            }
          >["collection"];

        admittedObservations:
          Extract<
            ReturnType<
              typeof admitMiningObStripEvidence
            >,
            {
              status: "ADMITTED";
            }
          >["admittedObservations"];
      };

      analysis:
        ReturnType<
          typeof analyzeMiningObStrip
        >;

      issues: [];
    };

/**
 * Executes the canonical OB / Strip Ratio investigation path.
 *
 * The Sectors historical-performance operation is reused because
 * OB and strip-ratio observations originate from that verified
 * performance payload.
 *
 * Evidence admission remains dedicated to OVERBURDEN and
 * STRIP_RATIO. Production, sales, resources and reserves are not
 * admitted by this path.
 *
 * No causal conclusion is produced.
 */
export async function runLiveObStripInvestigation(
  input: RXLiveObStripInvestigationInput,
): Promise<RXLiveObStripInvestigationResult> {
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
          "Collect admitted overburden-removal and strip-ratio evidence for OB / Strip Ratio investigation.",

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
    admitMiningObStripEvidence({
      request: {
        requestId:
          `OB-STRIP-${companyId}-R1`,

        requirementId:
          `OB-STRIP-${companyId}-E1`,

        source:
          "SECTORS",

        capability:
          "MINING_HISTORICAL_PERFORMANCE",

        purpose:
          "Collect admitted overburden-removal and strip-ratio evidence for OB / Strip Ratio investigation.",

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
    analyzeMiningObStrip(
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