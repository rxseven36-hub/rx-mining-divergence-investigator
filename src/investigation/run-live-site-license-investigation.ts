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
  admitMiningOperationalContextEvidence,
} from "./admit-mining-operational-context-evidence";

export interface RXLiveSiteLicenseInvestigationInput {
  sectorsApiKey: string;

  companyId: string;

  sectorsSlug: string;

  retrievedAt?: string;
}

export type RXLiveSiteLicenseInvestigationResult =
  | {
      status: "REJECTED";

      stage:
        | "EXECUTION"
        | "ADMISSION";

      causalConclusion: "UNKNOWN";

      evidence: null;

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
              typeof admitMiningOperationalContextEvidence
            >,
            {
              status: "ADMITTED";
            }
          >["collection"];

        context:
          Extract<
            ReturnType<
              typeof admitMiningOperationalContextEvidence
            >,
            {
              status: "ADMITTED";
            }
          >["context"];
      };

      issues: [];
    };

/**
 * Executes the canonical Site / License investigation path.
 *
 * This path intentionally uses only admitted
 * MINING_OPERATIONAL_CONTEXT evidence.
 *
 * No causal conclusion is produced.
 */
export async function runLiveSiteLicenseInvestigation(
  input: RXLiveSiteLicenseInvestigationInput,
): Promise<RXLiveSiteLicenseInvestigationResult> {
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
          "GET_MINING_OPERATIONAL_CONTEXT",

        purpose:
          "Collect admitted mining site, license, and contract evidence for Site / License investigation.",

        params: {
          sectorsSlug,
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

      issues: [
        execution.status,
      ],
    };
  }

  const admission =
    admitMiningOperationalContextEvidence({
      request: {
        requestId:
          `SITE-LICENSE-${companyId}-R1`,

        requirementId:
          `SITE-LICENSE-${companyId}-E1`,

        source:
          "SECTORS",

        capability:
          "MINING_OPERATIONAL_CONTEXT",

        purpose:
          "Collect admitted mining site, license, and contract evidence for Site / License investigation.",

        status:
          "PLANNED",
      },

      companyId,

      sourceReference:
        `sectors:mining-operational-context:${sectorsSlug}`,

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

      issues: [
        ...admission.collection.issues,
      ],
    };
  }

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

      context:
        admission.context,
    },

    issues: [],
  };
}