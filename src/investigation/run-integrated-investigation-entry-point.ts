import type {
  RXCommodity,
} from "../types/commodity";

import type {
  SectorsAdapter,
} from "../data/sectors/sectors-adapter";

import {
  executeSectorsOperation,
} from "../data/sectors/execute-sectors-operation";

import {
  admitMiningHistoricalPerformanceEvidence,
} from "./admit-mining-historical-performance-evidence";

import {
  buildAdmittedProductionSalesInvestigationQueue,
} from "./build-admitted-production-sales-investigation-queue";

import {
  runServerIntegratedInvestigation,
} from "./run-server-integrated-investigation";

import type {
  RXIntegratedInvestigationRunResult,
} from "./run-integrated-investigation";

export interface RXIntegratedInvestigationEntryPointInput {
  sectorsApiKey:
    string;

  companyId:
    string;

  sectorsSlug:
    string;

  ticker:
    string;

  commodity:
    RXCommodity;

  year:
    number;

  retrievedAt?:
    string;

  restEstimatedCreditBudget?:
    number;
}

export type RXIntegratedInvestigationEntryPointResult =
  | {
      status:
        "REJECTED";

      stage:
        "DISCOVERY_EXECUTION";

      discovery:
        null;

      investigationCase:
        null;

      integrated:
        null;

      issues:
        string[];

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "REJECTED";

      stage:
        "DISCOVERY_ADMISSION";

      discovery:
        ReturnType<
          typeof admitMiningHistoricalPerformanceEvidence
        >;

      investigationCase:
        null;

      integrated:
        null;

      issues:
        string[];

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "REJECTED";

      stage:
        "CASE_CREATION";

      discovery:
        Extract<
          ReturnType<
            typeof admitMiningHistoricalPerformanceEvidence
          >,
          {
            status:
              "ADMITTED";
          }
        >;

      investigationCase:
        null;

      integrated:
        null;

      issues:
        string[];

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "COMPLETED";

      stage:
        "DETERMINISTIC_INVESTIGATION";

      discovery:
        Extract<
          ReturnType<
            typeof admitMiningHistoricalPerformanceEvidence
          >,
          {
            status:
              "ADMITTED";
          }
        >;

      investigationCase:
        NonNullable<
          ReturnType<
            typeof buildAdmittedProductionSalesInvestigationQueue
          >["queue"]["cases"][number]
        >;

      integrated:
        RXIntegratedInvestigationRunResult;

      issues:
        [];

      causalConclusion:
        "UNKNOWN";
    };

export interface RXIntegratedInvestigationEntryPointDependencies {
  createDiscoveryAdapter(
    sectorsApiKey:
      string,
  ): SectorsAdapter;

  executeDiscovery(
    adapter:
      SectorsAdapter,

    request: Parameters<
      typeof executeSectorsOperation
    >[1],
  ): ReturnType<
    typeof executeSectorsOperation
  >;

  runIntegrated(
    input: {
      sectorsApiKey:
        string;

      investigationCase:
        NonNullable<
          ReturnType<
            typeof buildAdmittedProductionSalesInvestigationQueue
          >["queue"]["cases"][number]
        >;

      operationContext: {
        companyId:
          string;

        sectorsSlug:
          string;

        ticker:
          string;

        commodity:
          RXCommodity;

        period: {
          kind:
            "YEAR";

          year:
            number;
        };
      };

      retrievedAt?:
        string;

      restEstimatedCreditBudget?:
        number;
    },
  ): Promise<RXIntegratedInvestigationRunResult>;
}

/**
 * Canonical entry-point orchestration.
 *
 * This module does not create investigation cases directly.
 *
 * Discovery payload
 * -> canonical historical admission
 * -> deterministic scoring/ranking
 * -> canonical investigation queue
 * -> existing integrated server railway.
 *
 * No AI synthesis occurs here.
 * No generic MCP enrichment occurs here.
 */
export async function runIntegratedInvestigationEntryPoint(
  input:
    RXIntegratedInvestigationEntryPointInput,

  dependencies:
    RXIntegratedInvestigationEntryPointDependencies,
): Promise<RXIntegratedInvestigationEntryPointResult> {
  const sectorsApiKey =
    input.sectorsApiKey.trim();

  const companyId =
    input.companyId.trim();

  const sectorsSlug =
    input.sectorsSlug.trim();

  const ticker =
    input.ticker.trim();

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

  if (ticker.length === 0) {
    throw new Error(
      "ticker is required",
    );
  }

  if (
    !Number.isInteger(
      input.year,
    ) ||
    input.year <= 0
  ) {
    throw new Error(
      "year must be a positive integer",
    );
  }

  const discoveryAdapter =
    dependencies.createDiscoveryAdapter(
      sectorsApiKey,
    );

  const discoveryExecution =
    await dependencies.executeDiscovery(
      discoveryAdapter,
      {
        operation:
          "GET_MINING_HISTORICAL_PERFORMANCE",

        purpose:
          "Establish admissible production-sales divergence for integrated investigation.",

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
    discoveryExecution.status !==
      "EXECUTED"
  ) {
    return {
      status:
        "REJECTED",

      stage:
        "DISCOVERY_EXECUTION",

      discovery:
        null,

      investigationCase:
        null,

      integrated:
        null,

      issues: [
        discoveryExecution.status,
        ...(
          "issues" in discoveryExecution &&
          Array.isArray(discoveryExecution.issues)
            ? discoveryExecution.issues.filter(
                (
                  issue,
                ) =>
                  typeof issue === "string" &&
                  issue.trim().length > 0,
              )
            : []
        ),
      ],

      causalConclusion:
        "UNKNOWN",
    };
  }

  const discovery =
    admitMiningHistoricalPerformanceEvidence({
      request: {
        requestId:
          `INTEGRATED-${companyId}-${input.year}-R0`,

        requirementId:
          `INTEGRATED-${companyId}-${input.year}-E0`,

        source:
          "SECTORS",

        capability:
          "MINING_HISTORICAL_PERFORMANCE",

        purpose:
          "Establish admissible production-sales divergence for integrated investigation.",

        status:
          "PLANNED",
      },

      companyId,

      sourceReference:
        `sectors:mining-performance:${sectorsSlug}:${input.year}`,

      payload:
        discoveryExecution.data,

      retrievedAt:
        input.retrievedAt,
    });

  if (
    discovery.status !==
      "ADMITTED"
  ) {
    return {
      status:
        "REJECTED",

      stage:
        "DISCOVERY_ADMISSION",

      discovery,

      investigationCase:
        null,

      integrated:
        null,

      issues: [
        ...discovery.collection.issues,
      ],

      causalConclusion:
        "UNKNOWN",
    };
  }

  const queue =
    buildAdmittedProductionSalesInvestigationQueue([
      discovery,
    ]);

  const investigationCase =
    queue.queue.cases[0] ??
      null;

  if (investigationCase === null) {
    return {
      status:
        "REJECTED",

      stage:
        "CASE_CREATION",

      discovery,

      investigationCase:
        null,

      integrated:
        null,

      issues: [
        "NO_CANONICAL_INVESTIGATION_CASE",
      ],

      causalConclusion:
        "UNKNOWN",
    };
  }

  const integrated =
    await dependencies.runIntegrated({
      sectorsApiKey,

      investigationCase,

      operationContext: {
        companyId,

        sectorsSlug,

        ticker,

        commodity:
          input.commodity,

        period: {
          kind:
            "YEAR",

          year:
            input.year,
        },
      },

      retrievedAt:
        input.retrievedAt,

      restEstimatedCreditBudget:
        input.restEstimatedCreditBudget ??
          4,
    });

  return {
    status:
      "COMPLETED",

    stage:
      "DETERMINISTIC_INVESTIGATION",

    discovery,

    investigationCase,

    integrated,

    issues:
      [],

    causalConclusion:
      "UNKNOWN",
  };
}

/**
 * Default integrated execution dependency is exported separately
 * so the HTTP/server composition can use the canonical server
 * railway without duplicating its contract.
 */
export const runCanonicalServerIntegratedInvestigation =
  runServerIntegratedInvestigation;