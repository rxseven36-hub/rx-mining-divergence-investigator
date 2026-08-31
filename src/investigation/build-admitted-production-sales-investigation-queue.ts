import type {
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
} from "./admit-mining-historical-performance-evidence";

import {
  scoreAdmittedProductionSalesDivergence,
} from "../intelligence/priority/score-admitted-production-sales-divergence";

import type {
  RXPriorityResult,
} from "../intelligence/priority/priority-result";

import {
  rankPriorities,
} from "../intelligence/priority/rank-priorities";

import {
  buildInvestigationQueue,
} from "./investigation-queue";

import type {
  RXInvestigationQueue,
} from "./investigation-queue";

export interface RXAdmittedProductionSalesInvestigationQueueResult {
  queue: RXInvestigationQueue;

  admissionCount: number;

  scoringRunCount: number;

  scoringNotRunCount: number;

  scorablePriorityCount: number;

  unscorablePriorityCount: number;
}

/**
 * Runs admitted historical mining-performance evidence
 * through the existing deterministic production-versus-sales
 * detection, scoring, ranking, and investigation-queue path.
 *
 * Truth boundaries:
 *
 * - Detection remains restricted to explicitly admitted
 *   observations through scoreAdmittedProductionSalesDivergence.
 *
 * - NOT_RUN results never create priority results.
 *
 * - UNSCORABLE priority results are preserved for accounting
 *   but excluded by rankPriorities from the ranked queue.
 *
 * - Ranking and queue construction remain delegated to their
 *   existing deterministic engines.
 *
 * - This orchestration does not infer causality, rescore cases,
 *   or call AI.
 */
export function buildAdmittedProductionSalesInvestigationQueue(
  admissions:
    RXMiningHistoricalPerformanceEvidenceAdmissionResult[]
): RXAdmittedProductionSalesInvestigationQueueResult {
  const priorities: RXPriorityResult[] =
    [];

  let scoringRunCount = 0;
  let scoringNotRunCount = 0;
  let scorablePriorityCount = 0;
  let unscorablePriorityCount = 0;

  for (const admission of admissions) {
    const scoring =
      scoreAdmittedProductionSalesDivergence(
        admission
      );

    if (scoring.status === "NOT_RUN") {
      scoringNotRunCount += 1;
      continue;
    }

    scoringRunCount += 1;

    const priority =
      scoring.priorityResult;

    priorities.push(priority);

    if (priority.status === "SCORABLE") {
      scorablePriorityCount += 1;
    } else {
      unscorablePriorityCount += 1;
    }
  }

  const ranked =
    rankPriorities(priorities);

  const queue =
    buildInvestigationQueue(
      ranked
    );

  return {
    queue,

    admissionCount:
      admissions.length,

    scoringRunCount,

    scoringNotRunCount,

    scorablePriorityCount,

    unscorablePriorityCount,
  };
}