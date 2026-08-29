import type {
  RXPriorityResult,
} from "../intelligence/priority/priority-result";

import {
  createInvestigationCase,
} from "./create-investigation-case";

import type {
  RXInvestigationCase,
} from "./investigation-case";

export interface RXInvestigationQueue {
  cases: RXInvestigationCase[];

  rejectedPriorityCount: number;
}

/**
 * Converts already-ranked deterministic priorities
 * into investigation cases.
 *
 * IMPORTANT:
 * This layer does not rank, rescore, infer, or call AI.
 * It only creates cases from valid priority results.
 */
export function buildInvestigationQueue(
  priorities: RXPriorityResult[]
): RXInvestigationQueue {
  const cases: RXInvestigationCase[] =
    [];

  let rejectedPriorityCount = 0;

  for (const priority of priorities) {
    const result =
      createInvestigationCase(
        priority
      );

    if (!result.ok) {
      rejectedPriorityCount += 1;
      continue;
    }

    cases.push(result.case);
  }

  /**
   * Defensive queue ordering.
   *
   * Priority engine is expected to provide ranks,
   * but queue order must remain deterministic even
   * if input arrives shuffled.
   */
  cases.sort(
    (a, b) =>
      a.trigger.rank -
      b.trigger.rank
  );

  return {
    cases,
    rejectedPriorityCount,
  };
}