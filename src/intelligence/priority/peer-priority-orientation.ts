import {
  createPeerPairIdentity,
} from "../comparability/peer-pair-identity";

import type {
  RXPeerDivergencePriorityResult,
} from "./peer-divergence-priority";

export interface RXPeerPriorityOrientation {
  pairKey:
    string;

  firstCompanyId:
    string;

  secondCompanyId:
    string;

  isCanonical:
    boolean;
}

export function evaluatePeerPriorityOrientation(
  priority:
    RXPeerDivergencePriorityResult
): RXPeerPriorityOrientation {
  const identity =
    createPeerPairIdentity(
      priority.leftCompanyId,
      priority.rightCompanyId
    );

  return {
    pairKey:
      identity.key,

    firstCompanyId:
      identity.firstCompanyId,

    secondCompanyId:
      identity.secondCompanyId,

    isCanonical:
      priority.leftCompanyId ===
        identity.firstCompanyId &&
      priority.rightCompanyId ===
        identity.secondCompanyId,
  };
}
