import {
  RestSectorsAdapter,
} from "../data/sectors/sectors-adapter";

import {
  SectorsCreditBudget,
} from "../data/sectors/credit-budget";

import {
  SectorsHttpClient,
} from "../data/sectors/sectors-http-client";

import type {
  RXCompany,
} from "../types/company";

import {
  discoverPeerInvestigationCase,
} from "./discover-peer-investigation-case";

import {
  GeminiLLMProvider,
} from "./gemini-llm-provider";

import {
  runPeerInvestigationIntelligence,
} from "./run-peer-investigation-intelligence";

export interface RXLivePeerIntelligenceRunInput {
  sectorsApiKey:
    string;

  llmApiKey:
    string;

  firstCompany:
    RXCompany;

  secondCompany:
    RXCompany;

  year:
    number;

  retrievedAt?:
    string;
}

type RXPeerIntelligenceIssue =
  Awaited<
    ReturnType<
      typeof runPeerInvestigationIntelligence
    >
  >["issues"][number];

type RXLivePeerIntelligenceIssue =
  | string
  | RXPeerIntelligenceIssue;

export type RXLivePeerIntelligenceRunResult =
  | {
      status:
        "REJECTED";

      stage:
        "DISCOVERY";

      discovery:
        Awaited<
          ReturnType<
            typeof discoverPeerInvestigationCase
          >
        >;

      intelligence:
        null;

      causalConclusion:
        "UNKNOWN";

      issues:
        RXLivePeerIntelligenceIssue[];
    }
  | {
      status:
        "REJECTED";

      stage:
        "INTELLIGENCE";

      discovery:
        Extract<
          Awaited<
            ReturnType<
              typeof discoverPeerInvestigationCase
            >
          >,
          {
            status:
              "DISCOVERED";
          }
        >;

      intelligence:
        Awaited<
          ReturnType<
            typeof runPeerInvestigationIntelligence
          >
        >;

      causalConclusion:
        "UNKNOWN";

      issues:
        RXLivePeerIntelligenceIssue[];
    }
  | {
      status:
        "ACCEPTED";

      stage:
        "COMPLETE";

      discovery:
        Extract<
          Awaited<
            ReturnType<
              typeof discoverPeerInvestigationCase
            >
          >,
          {
            status:
              "DISCOVERED";
          }
        >;

      intelligence:
        Extract<
          Awaited<
            ReturnType<
              typeof runPeerInvestigationIntelligence
            >
          >,
          {
            status:
              "ACCEPTED";
          }
        >;

      causalConclusion:
        "UNKNOWN";

      issues:
        [];
    };

const COMPLETE_FLOW_CREDIT_BUDGET =
  11;

/**
 * Server-only composition for one real RX MDI peer
 * intelligence run.
 *
 * Maximum intended Sectors execution:
 *
 * discovery:
 *   2 operational
 *   2 historical
 *
 * investigation:
 *   2 operational
 *   2 historical
 *   1 shared commodity
 *   2 market
 *
 * Maximum local estimated credit budget = 11.
 *
 * Existing RX boundaries remain authoritative for
 * discovery, evidence admission, deterministic peer
 * selection, investigation execution, evidence binding,
 * and evidence-bounded synthesis.
 *
 * Runtime/API/provider failures intentionally propagate.
 */
export async function runLivePeerIntelligence(
  input:
    RXLivePeerIntelligenceRunInput
): Promise<
  RXLivePeerIntelligenceRunResult
> {
  const sectorsApiKey =
    input.sectorsApiKey.trim();

  const llmApiKey =
    input.llmApiKey.trim();

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

  const discovery =
    await discoverPeerInvestigationCase({
      adapter,

      firstCompany:
        input.firstCompany,

      secondCompany:
        input.secondCompany,

      year:
        input.year,

      retrievedAt:
        input.retrievedAt,
    });

  if (
    discovery.status !==
      "DISCOVERED"
  ) {
    return {
      status:
        "REJECTED",

      stage:
        "DISCOVERY",

      discovery,

      intelligence:
        null,

      causalConclusion:
        "UNKNOWN",

      issues: [
        ...discovery.issues,
      ],
    };
  }

  const intelligence =
    await runPeerInvestigationIntelligence({
      adapter,

      provider,

      investigationCase:
        discovery.selection
          .investigationCase,

      firstCompany:
        discovery.firstCompany,

      secondCompany:
        discovery.secondCompany,

      retrievedAt:
        input.retrievedAt,
    });

  if (
    intelligence.status !==
      "ACCEPTED"
  ) {
    return {
      status:
        "REJECTED",

      stage:
        "INTELLIGENCE",

      discovery,

      intelligence,

      causalConclusion:
        "UNKNOWN",

      issues: [
        ...intelligence.issues,
      ],
    };
  }

  return {
    status:
      "ACCEPTED",

    stage:
      "COMPLETE",

    discovery,

    intelligence,

    causalConclusion:
      "UNKNOWN",

    issues: [],
  };
}