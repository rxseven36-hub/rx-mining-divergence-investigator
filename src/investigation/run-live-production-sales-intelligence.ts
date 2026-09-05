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

import type {
  RXCommodity,
} from "../types/commodity";

import {
  admitMiningHistoricalPerformanceEvidence,
} from "./admit-mining-historical-performance-evidence";

import {
  GeminiLLMProvider,
} from "./gemini-llm-provider";

import {
  runProductionSalesInvestigationIntelligence,
} from "./run-production-sales-investigation-intelligence";

/**
 * One discovery historical request plus the maximum
 * four requests produced by the canonical single-company
 * investigation plan.
 *
 * This is only a LOCAL estimated-credit guard.
 * The Sectors API remains authoritative for actual usage.
 */
const COMPLETE_FLOW_CREDIT_BUDGET =
  5;

export interface RXLiveProductionSalesIntelligenceRunInput {
  sectorsApiKey:
    string;

  llmApiKey:
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
}

export type RXLiveProductionSalesIntelligenceRunResult =
  | {
      status:
        "REJECTED";

      stage:
        "DISCOVERY_EXECUTION";

      discovery:
        null;

      intelligence:
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

      intelligence:
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
        "INTELLIGENCE";

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

      intelligence:
        Awaited<
          ReturnType<
            typeof runProductionSalesInvestigationIntelligence
          >
        >;

      issues:
        [];

      causalConclusion:
        "UNKNOWN";
    };

/**
 * Server-only composition for one real single-company
 * production-sales divergence investigation.
 *
 * Flow:
 *
 * Sectors historical mining performance
 * -> canonical historical admission
 * -> deterministic production-sales divergence
 * -> canonical investigation queue
 * -> investigation plan
 * -> Sectors evidence execution/admission
 * -> neutral evidence pack
 * -> evidence-bounded Gemini synthesis
 *
 * The initial historical request exists only to establish
 * whether a production-sales divergence is admissible.
 *
 * The downstream investigation remains authoritative for
 * evidence collection used by intelligence synthesis.
 *
 * No causal conclusion is established here.
 *
 * Runtime/API/provider failures from downstream boundaries
 * intentionally propagate unless the canonical Sectors
 * execution boundary returns a typed rejection/failure.
 */
export async function runLiveProductionSalesIntelligence(
  input:
    RXLiveProductionSalesIntelligenceRunInput
): Promise<
  RXLiveProductionSalesIntelligenceRunResult
> {
  const sectorsApiKey =
    input.sectorsApiKey.trim();

  const llmApiKey =
    input.llmApiKey.trim();

  const companyId =
    input.companyId.trim();

  const sectorsSlug =
    input.sectorsSlug.trim();

  const ticker =
    input.ticker.trim();

  if (
    sectorsApiKey.length === 0
  ) {
    throw new Error(
      "SECTORS_API_KEY is required"
    );
  }

  if (
    llmApiKey.length === 0
  ) {
    throw new Error(
      "LLM_API_KEY is required"
    );
  }

  if (
    companyId.length === 0
  ) {
    throw new Error(
      "companyId is required"
    );
  }

  if (
    sectorsSlug.length === 0
  ) {
    throw new Error(
      "sectorsSlug is required"
    );
  }

  if (
    ticker.length === 0
  ) {
    throw new Error(
      "ticker is required"
    );
  }

  if (
    !Number.isInteger(
      input.year
    ) ||
    input.year <= 0
  ) {
    throw new Error(
      "year must be a positive integer"
    );
  }

  const client =
    new SectorsHttpClient({
      apiKey:
        sectorsApiKey,

      creditBudget:
        new SectorsCreditBudget(
          COMPLETE_FLOW_CREDIT_BUDGET
        ),
    });

  const adapter =
    new RestSectorsAdapter(
      client
    );

  const provider =
    new GeminiLLMProvider({
      apiKey:
        llmApiKey,
    });

  /**
   * Discovery deliberately uses the canonical typed
   * Sectors operation rather than constructing a REST
   * path locally.
   *
   * Endpoint compilation and estimated request cost
   * therefore remain owned by the existing Sectors
   * execution boundary.
   */
  const discoveryExecution =
    await executeSectorsOperation<unknown>(
      adapter,
      {
        operation:
          "GET_MINING_HISTORICAL_PERFORMANCE",

        purpose:
          "Establish admissible production-sales divergence for single-company investigation.",

        params: {
          sectorsSlug,

          period: {
            kind:
              "YEAR",

            year:
              input.year,
          },
        },
      }
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

      intelligence:
        null,

      issues: [
        discoveryExecution.status,
      ],

      causalConclusion:
        "UNKNOWN",
    };
  }

  /**
   * Admission request identity is local orchestration
   * metadata. It does not create another Sectors request.
   *
   * The executed raw payload crosses the same canonical
   * historical admission boundary used elsewhere in RX.
   */
  const discovery =
    admitMiningHistoricalPerformanceEvidence({
      request: {
        requestId:
          `LIVE-${companyId}-${input.year}-R0`,

        requirementId:
          `LIVE-${companyId}-${input.year}-E0`,

        source:
          "SECTORS",

        capability:
          "MINING_HISTORICAL_PERFORMANCE",

        purpose:
          "Establish admissible production-sales divergence for single-company investigation.",

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

      intelligence:
        null,

      issues: [
        ...discovery.collection.issues,
      ],

      causalConclusion:
        "UNKNOWN",
    };
  }

  const intelligence =
    await runProductionSalesInvestigationIntelligence(
      adapter,
      provider,
      {
        admissions: [
          discovery,
        ],

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
      }
    );

  return {
    status:
      "COMPLETED",

    stage:
      "INTELLIGENCE",

    discovery,

    intelligence,

    issues: [],

    causalConclusion:
      "UNKNOWN",
  };
}