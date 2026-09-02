import type {
  RXPeerDivergencePriorityResult,
} from "./peer-divergence-priority";

import {
  evaluatePeerPriorityOrientation,
} from "./peer-priority-orientation";

export function selectCanonicalPeerPriorities(
  priorities:
    RXPeerDivergencePriorityResult[]
): RXPeerDivergencePriorityResult[] {
  return priorities.filter(
    (
      priority
    ) => {
      if (
        priority.status !==
          "SCORABLE" ||
        priority.score === null ||
        !Number.isFinite(
          priority.score
        )
      ) {
        return false;
      }

      return (
        evaluatePeerPriorityOrientation(
          priority
        ).isCanonical
      );
    }
  );
}
