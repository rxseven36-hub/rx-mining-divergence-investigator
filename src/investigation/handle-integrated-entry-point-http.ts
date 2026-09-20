import {
  RestSectorsAdapter,
} from "../data/sectors/sectors-adapter";

import {
  SectorsHttpClient,
} from "../data/sectors/sectors-http-client";

import {
  executeSectorsOperation,
} from "../data/sectors/execute-sectors-operation";

import {
  projectIntegratedInvestigationResponse,
} from "./integrated-investigation-response";

import {
  runCanonicalServerIntegratedInvestigation,
  runIntegratedInvestigationEntryPoint,
} from "./run-integrated-investigation-entry-point";

import type {
  RXIntegratedInvestigationEntryPointDependencies,
} from "./run-integrated-investigation-entry-point";

import type {
  RXCommodity,
} from "../types/commodity";

export interface RXIntegratedEntryPointHttpBody {
  companyId?: unknown;
  sectorsSlug?: unknown;
  ticker?: unknown;
  commodity?: unknown;
  year?: unknown;
}

export interface RXIntegratedEntryPointHttpResult {
  httpStatus:
    number;

  body:
    unknown;
}

const SUPPORTED_COMMODITIES:
  readonly RXCommodity[] = [
    "COAL",
    "GOLD",
    "NICKEL",
    "COPPER",
  ];

function isCommodity(
  value:
    unknown,
): value is RXCommodity {
  return (
    typeof value === "string" &&
    (
      SUPPORTED_COMMODITIES as
        readonly string[]
    ).includes(
      value,
    )
  );
}

function requiredString(
  value:
    unknown,
): string | null {
  if (
    typeof value !==
      "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : null;
}

function createDiscoveryAdapter(
  apiKey:
    string,
): RestSectorsAdapter {
  const client =
    new SectorsHttpClient({
      apiKey,
    });

  return new RestSectorsAdapter(
    client,
  );
}

export async function handleIntegratedEntryPointHttp(
  sectorsApiKey:
    string | undefined,

  body:
    RXIntegratedEntryPointHttpBody,

  dependencies:
    RXIntegratedInvestigationEntryPointDependencies = {
      createDiscoveryAdapter,

      executeDiscovery:
        executeSectorsOperation,

      runIntegrated:
        runCanonicalServerIntegratedInvestigation,
    },
): Promise<RXIntegratedEntryPointHttpResult> {
  const apiKey =
    sectorsApiKey?.trim() ??
    "";

  if (
    apiKey.length === 0
  ) {
    return {
      httpStatus:
        503,

      body: {
        status:
          "REJECTED",

        stage:
          "CONFIGURATION",

        issues: [
          "SECTORS_API_KEY_REQUIRED",
        ],

        causalConclusion:
          "UNKNOWN",
      },
    };
  }

  const companyId =
    requiredString(
      body.companyId,
    );

  const sectorsSlug =
    requiredString(
      body.sectorsSlug,
    );

  const ticker =
    requiredString(
      body.ticker,
    );

  if (
    companyId === null ||
    sectorsSlug === null ||
    ticker === null ||
    !isCommodity(
      body.commodity,
    ) ||
    !Number.isInteger(
      body.year,
    ) ||
    (
      typeof body.year ===
        "number" &&
      body.year <= 0
    )
  ) {
    return {
      httpStatus:
        400,

      body: {
        status:
          "REJECTED",

        stage:
          "REQUEST",

        issues: [
          "INVALID_INTEGRATED_ENTRY_POINT_REQUEST",
        ],

        causalConclusion:
          "UNKNOWN",
      },
    };
  }

  try {
    const result =
      await runIntegratedInvestigationEntryPoint(
        {
          sectorsApiKey:
            apiKey,

          companyId,

          sectorsSlug,

          ticker,

          commodity:
            body.commodity,

          year:
            body.year as number,

          restEstimatedCreditBudget:
            4,
        },
        dependencies,
      );

    if (
      result.status ===
        "REJECTED"
    ) {
      return {
        httpStatus:
          422,

        body: {
          status:
            "REJECTED",

          stage:
            result.stage,

          issues:
            result.issues,

          causalConclusion:
            "UNKNOWN",
        },
      };
    }

    return {
      httpStatus:
        200,

      body:
        projectIntegratedInvestigationResponse(
          result.integrated,
        ),
    };
  } catch {
    return {
      httpStatus:
        502,

      body: {
        status:
          "REJECTED",

        stage:
          "RUNTIME",

        issues: [
          "INTEGRATED_ENTRY_POINT_RUNTIME_FAILURE",
        ],

        causalConclusion:
          "UNKNOWN",
      },
    };
  }
}