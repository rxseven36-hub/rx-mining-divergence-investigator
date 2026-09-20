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
  admitMarketTransactionEvidence,
} from "./admit-market-transaction-evidence";

import {
  analyzeMarketTransactions,
} from "./analyze-market-transactions";

import type {
  RXTimePeriod,
} from "../types/time";

export interface RXLiveMarketInvestigationInput {
  sectorsApiKey: string;
  companyId: string;
  ticker: string;
  start: string;
  end: string;
  retrievedAt?: string;
}

export type RXLiveMarketInvestigationResult =
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
              typeof admitMarketTransactionEvidence
            >,
            {
              status: "ADMITTED";
            }
          >["collection"];

        admittedObservations:
          Extract<
            ReturnType<
              typeof admitMarketTransactionEvidence
            >,
            {
              status: "ADMITTED";
            }
          >["observations"];
      };

      analysis:
        ReturnType<
          typeof analyzeMarketTransactions
        >;

      issues: [];
    };

function parseDateOnly(
  value: string,
): Date | null {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return null;
  }

  const date =
    new Date(`${value}T00:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return date;
}

function validateMarketPeriod(
  start: string,
  end: string,
): void {
  const startDate =
    parseDateOnly(start);

  const endDate =
    parseDateOnly(end);

  if (!startDate || !endDate) {
    throw new Error(
      "start and end must use YYYY-MM-DD",
    );
  }

  if (
    startDate.getTime() >
    endDate.getTime()
  ) {
    throw new Error(
      "start must not be after end",
    );
  }

  const daySpan =
    Math.floor(
      (
        endDate.getTime() -
        startDate.getTime()
      ) /
        86400000,
    ) + 1;

  if (daySpan > 90) {
    throw new Error(
      "market investigation range must not exceed 90 days",
    );
  }
}

/**
 * Canonical standalone company-market investigation.
 *
 * The runner:
 * - executes only the verified company market capability;
 * - admits only ticker- and period-aligned source facts;
 * - analyzes only admitted PRICE / VOLUME / MARKET_CAP facts;
 * - does not infer bullish/bearish state, anomaly, mining
 *   relationship, event explanation, or causality.
 */
export async function runLiveMarketInvestigation(
  input: RXLiveMarketInvestigationInput,
): Promise<RXLiveMarketInvestigationResult> {
  const sectorsApiKey =
    input.sectorsApiKey.trim();

  const companyId =
    input.companyId.trim();

  const ticker =
    input.ticker.trim().toUpperCase();

  const start =
    input.start.trim();

  const end =
    input.end.trim();

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

  if (ticker.length === 0) {
    throw new Error(
      "ticker is required",
    );
  }

  validateMarketPeriod(
    start,
    end,
  );

  const requestedPeriod: RXTimePeriod = {
    kind: "RANGE",
    start,
    end,
  };

  const client =
    new SectorsHttpClient({
      apiKey: sectorsApiKey,

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
          "GET_COMPANY_MARKET_TRANSACTION_HISTORY",

        purpose:
          "Collect admitted daily company market evidence for standalone Market investigation.",

        params: {
          ticker,
          period: requestedPeriod,
        },
      },
    );

  if (
    execution.status !==
      "EXECUTED"
  ) {
    return {
      status: "REJECTED",
      stage: "EXECUTION",
      causalConclusion: "UNKNOWN",
      evidence: null,
      analysis: null,
      issues:
        execution.status === "REJECTED"
          ? [...execution.issues]
          : ["SECTORS_EXECUTION_FAILED"],
    };
  }

  const admission =
    admitMarketTransactionEvidence({
      request: {
        requestId:
          `MARKET-${companyId}-R1`,

        requirementId:
          `MARKET-${companyId}-E1`,

        source: "SECTORS",

        capability:
          "COMPANY_MARKET_TRANSACTION_HISTORY",

        purpose:
          "Collect admitted daily company market evidence for standalone Market investigation.",

        status: "PLANNED",
      },

      requestedTicker:
        ticker,

      requestedPeriod,

      sourceReference:
        `sectors:daily:${ticker}:${start}:${end}`,

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
      status: "REJECTED",
      stage: "ADMISSION",
      causalConclusion: "UNKNOWN",
      evidence: null,
      analysis: null,
      issues: [
        ...admission.collection.issues,
      ],
    };
  }

  const analysis =
    analyzeMarketTransactions(
      admission.observations,
    );

  return {
    status: "ACCEPTED",
    stage: "COMPLETE",
    causalConclusion: "UNKNOWN",

    evidence: {
      collection:
        admission.collection,

      admittedObservations:
        admission.observations,
    },

    analysis,

    issues: [],
  };
}