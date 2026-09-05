import type {
  SectorsAdapter,
} from "../data/sectors/sectors-adapter";

import type {
  LLMProvider,
} from "./llm-provider";

import type {
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
} from "./admit-mining-historical-performance-evidence";

import {
  buildAdmittedProductionSalesInvestigationQueue,
} from "./build-admitted-production-sales-investigation-queue";

import {
  createInvestigationPlan,
} from "./create-investigation-plan";

import type {
  RXInvestigationOperationContext,
} from "./bind-operation-request";

import {
  prepareInvestigationRequests,
} from "./prepare-investigation-requests";

import {
  executePreparedInvestigation,
} from "./execute-prepared-investigation";

import type {
  RXPreparedInvestigationExecutionResult,
  RXPreparedInvestigationRunContext,
} from "./execute-prepared-investigation";

import {
  projectInvestigationIntelligenceEvidencePack,
} from "../intelligence/context/project-investigation-intelligence-evidence-pack";

import type {
  RXIntelligenceEvidencePack,
} from "../intelligence/context/intelligence-evidence-pack";

import {
  runNeutralIntelligenceSynthesis,
} from "../intelligence/synthesis/run-neutral-intelligence-synthesis";

import type {
  RXNeutralIntelligenceSynthesisRunResult,
} from "../intelligence/synthesis/run-neutral-intelligence-synthesis";

export interface RXProductionSalesInvestigationIntelligenceInput {
  admissions:
    RXMiningHistoricalPerformanceEvidenceAdmissionResult[];

  operationContext:
    RXInvestigationOperationContext;

  retrievedAt?: string;
}

type RXProductionSalesInvestigationQueueResult =
  ReturnType<
    typeof buildAdmittedProductionSalesInvestigationQueue
  >;

type RXProductionSalesInvestigationPlan =
  ReturnType<
    typeof createInvestigationPlan
  >;

export type RXProductionSalesInvestigationIntelligenceRunResult =
  | {
      status:
        "NO_INVESTIGATION_CASE";

      queue:
        RXProductionSalesInvestigationQueueResult;

      plan:
        null;

      execution:
        null;

      evidencePack:
        null;

      synthesis:
        null;

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "NO_ADMITTED_EVIDENCE";

      queue:
        RXProductionSalesInvestigationQueueResult;

      plan:
        RXProductionSalesInvestigationPlan;

      execution:
        RXPreparedInvestigationExecutionResult;

      evidencePack:
        RXIntelligenceEvidencePack;

      synthesis:
        null;

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "COMPLETED";

      queue:
        RXProductionSalesInvestigationQueueResult;

      plan:
        RXProductionSalesInvestigationPlan;

      execution:
        RXPreparedInvestigationExecutionResult;

      evidencePack:
        RXIntelligenceEvidencePack;

      synthesis:
        RXNeutralIntelligenceSynthesisRunResult;

      causalConclusion:
        "UNKNOWN";
    };

/**
 * Canonical single-company production-versus-sales
 * investigation intelligence bridge.
 *
 * Sequence:
 *
 * admitted historical mining evidence
 * -> deterministic divergence scoring
 * -> deterministic ranking
 * -> canonical investigation queue
 * -> first ranked investigation case
 * -> deterministic investigation plan
 * -> request validation and operation binding
 * -> Sectors execution and evidence admission
 * -> neutral intelligence evidence projection
 * -> evidence-bounded neutral intelligence synthesis
 *
 * Important boundaries:
 *
 * - Investigation cases are created only by the canonical
 *   queue builder. This runner never recreates them.
 *
 * - Detection, scoring, ranking, and queue construction
 *   remain deterministic and AI-free.
 *
 * - Sectors execution occurs only after a valid canonical
 *   investigation case exists.
 *
 * - AI synthesis receives only the neutral evidence pack
 *   projected from admitted evidence.
 *
 * - AI synthesis is never called when no evidence was
 *   admitted by the investigation execution path.
 *
 * - This runner never establishes causality.
 */
export async function runProductionSalesInvestigationIntelligence(
  adapter:
    SectorsAdapter,
  provider:
    LLMProvider,
  input:
    RXProductionSalesInvestigationIntelligenceInput
): Promise<
  RXProductionSalesInvestigationIntelligenceRunResult
> {
  const queue =
    buildAdmittedProductionSalesInvestigationQueue(
      input.admissions
    );

  const investigationCase =
    queue.queue.cases[0];

  if (!investigationCase) {
    return {
      status:
        "NO_INVESTIGATION_CASE",

      queue,

      plan:
        null,

      execution:
        null,

      evidencePack:
        null,

      synthesis:
        null,

      causalConclusion:
        "UNKNOWN",
    };
  }

  const plan =
    createInvestigationPlan(
      investigationCase
    );

  const prepared =
    prepareInvestigationRequests(
      plan,
      input.operationContext
    );

  const runContext:
    RXPreparedInvestigationRunContext = {
      companyId:
        input.operationContext.companyId,

      retrievedAt:
        input.retrievedAt,
    };

  const execution =
    await executePreparedInvestigation(
      adapter,
      prepared,
      runContext
    );

  const evidencePack =
    projectInvestigationIntelligenceEvidencePack(
      {
        companyId:
          input.operationContext.companyId,

        execution,
      }
    );

  /**
   * Credit-safety boundary.
   *
   * No admitted evidence means there is nothing
   * evidence-bounded for an LLM to interpret.
   *
   * Do not call the provider merely to produce
   * unsupported narrative.
   */
  if (
    evidencePack.evidence.length === 0
  ) {
    return {
      status:
        "NO_ADMITTED_EVIDENCE",

      queue,

      plan,

      execution,

      evidencePack,

      synthesis:
        null,

      causalConclusion:
        "UNKNOWN",
    };
  }

  const synthesis =
    await runNeutralIntelligenceSynthesis(
      provider,
      evidencePack
    );

  return {
    status:
      "COMPLETED",

    queue,

    plan,

    execution,

    evidencePack,

    synthesis,

    causalConclusion:
      "UNKNOWN",
  };
}