import {
  createPeerComparisonIdentity,
} from "../comparability/peer-comparison-identity";

import type {
  RXPeerDivergencePriorityResult,
} from "./peer-divergence-priority";

export type RXRankedPeerDivergencePriorityResult =
  RXPeerDivergencePriorityResult & {
    status:
      "SCORABLE";

    score:
      number;

    rank:
      number;
  };

/**
 * Ranks already-selected peer divergence priorities by
 * descending deterministic priority score.
 *
 * Expected pipeline:
 *
 * peer priorities
 * -> selectCanonicalPeerPriorities()
 * -> rankPeerPriorities()
 *
 * This function does NOT:
 * - decide canonical orientation,
 * - rescore priorities,
 * - interpret divergence,
 * - infer materiality,
 * - infer causality,
 * - mutate the supplied results.
 */
export function rankPeerPriorities(
  results:
    RXPeerDivergencePriorityResult[]
): RXRankedPeerDivergencePriorityResult[] {
  const scorable =
    results.filter(
      (
        result
      ): result is RXPeerDivergencePriorityResult & {
        status:
          "SCORABLE";

        score:
          number;
      } =>
        result.status ===
          "SCORABLE" &&
        result.score !== null &&
        Number.isFinite(
          result.score
        )
    );

  const sorted =
    [...scorable].sort(
      (
        left,
        right
      ) => {
        const scoreDifference =
          right.score -
          left.score;

        if (
          scoreDifference !== 0
        ) {
          return scoreDifference;
        }

        const leftIdentity =
          createPeerComparisonIdentity(
            left
          );

        const rightIdentity =
          createPeerComparisonIdentity(
            right
          );

        const identityDifference =
          leftIdentity.key.localeCompare(
            rightIdentity.key
          );

        if (
          identityDifference !== 0
        ) {
          return identityDifference;
        }

        const leftObservationDifference =
          String(
            left.leftObservationId
          ).localeCompare(
            String(
              right.leftObservationId
            )
          );

        if (
          leftObservationDifference !==
          0
        ) {
          return leftObservationDifference;
        }

        return String(
          left.rightObservationId
        ).localeCompare(
          String(
            right.rightObservationId
          )
        );
      }
    );

  return sorted.map(
    (
      result,
      index
    ) => ({
      ...result,

      leftUnit: {
        ...result.leftUnit,
      },

      rightUnit: {
        ...result.rightUnit,
      },

      leftPeriod: {
        ...result.leftPeriod,
      },

      rightPeriod: {
        ...result.rightPeriod,
      },

      unscorableReasons: [
        ...result.unscorableReasons,
      ],

      rank:
        index + 1,
    })
  );
}