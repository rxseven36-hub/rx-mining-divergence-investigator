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
  admitCommodityPriceEvidence,
} from "./admit-commodity-price-evidence";

import {
  analyzeCommodityPrice,
} from "./analyze-commodity-price";

import type {
  RXCommodity,
} from "../types/commodity";

import type {
  RXTimePeriod,
} from "../types/time";

export interface RXLiveCommodityInvestigationInput {
  sectorsApiKey: string;
  commodity: RXCommodity;
  startYear: number;
  endYear: number;
  retrievedAt?: string;
}

type CommodityAdmission =
  ReturnType<
    typeof admitCommodityPriceEvidence
  >;

type AdmittedCommodityEvidence =
  Extract<
    CommodityAdmission,
    {
      status:
        "ADMITTED";
    }
  >;

export type RXLiveCommodityInvestigationResult =
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
          AdmittedCommodityEvidence[
            "collection"
          ];

        admittedObservations:
          AdmittedCommodityEvidence[
            "observations"
          ];
      };

      analysis:
        ReturnType<
          typeof analyzeCommodityPrice
        >;

      issues:
        [];
    };

const SUPPORTED_COMMODITIES =
  new Set<RXCommodity>([
    "COAL",
    "GOLD",
    "NICKEL",
    "COPPER",
  ]);

function validateYear(
  value: number,
  field: string,
): void {
  if (
    !Number.isInteger(value) ||
    value < 1900 ||
    value > 2100
  ) {
    throw new Error(
      `${field} must be an integer year between 1900 and 2100`,
    );
  }
}

export async function runLiveCommodityInvestigation(
  input:
    RXLiveCommodityInvestigationInput,
): Promise<RXLiveCommodityInvestigationResult> {
  const sectorsApiKey =
    input.sectorsApiKey.trim();

  if (
    sectorsApiKey.length === 0
  ) {
    throw new Error(
      "SECTORS_API_KEY is required",
    );
  }

  if (
    !SUPPORTED_COMMODITIES.has(
      input.commodity,
    )
  ) {
    throw new Error(
      "commodity must be COAL, GOLD, NICKEL, or COPPER",
    );
  }

  validateYear(
    input.startYear,
    "startYear",
  );

  validateYear(
    input.endYear,
    "endYear",
  );

  if (
    input.startYear >
    input.endYear
  ) {
    throw new Error(
      "startYear must not be after endYear",
    );
  }

  const requestedPeriod:
    RXTimePeriod = {
      kind:
        "RANGE",

      start:
        `${input.startYear}-01-01`,

      end:
        `${input.endYear}-12-31`,
    };

  const client =
    new SectorsHttpClient({
      apiKey:
        sectorsApiKey,

      creditBudget:
        new SectorsCreditBudget(
          1,
        ),
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
          "GET_COMMODITY_PRICE_HISTORY",

        purpose:
          "Collect admitted commodity-price evidence for standalone Commodity investigation.",

        params: {
          commodity:
            input.commodity,

          period:
            requestedPeriod,
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
        execution.status ===
        "REJECTED"
          ? [
              ...execution.issues,
            ]
          : [
              "SECTORS_EXECUTION_FAILED",
            ],
    };
  }

  const admissionInput = {
    request: {
      requestId:
        `COMMODITY-${input.commodity}-R1`,

      requirementId:
        `COMMODITY-${input.commodity}-E1`,

      source:
        "SECTORS" as const,

      capability:
        "COMMODITY_PRICE_HISTORY" as const,

      purpose:
        "Collect admitted commodity-price evidence for standalone Commodity investigation.",

      status:
        "PLANNED" as const,
    },

    requestedCommodity:
      input.commodity,

    requestedPeriod,

    sourceReference:
      `sectors:commodity-price:${input.commodity}:${input.startYear}:${input.endYear}`,

    payload:
      execution.data,
  };

  const admission =
    input.retrievedAt === undefined
      ? admitCommodityPriceEvidence(
          admissionInput,
        )
      : admitCommodityPriceEvidence({
          ...admissionInput,

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
        ...admission.collection
          .issues,
      ],
    };
  }

  const analysis =
    analyzeCommodityPrice(
      admission.observations,
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
        admission.observations,
    },

    analysis,

    issues:
      [],
  };
}