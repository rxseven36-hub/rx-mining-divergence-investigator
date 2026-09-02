import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXPeerDivergencePriorityResult,
} from "../intelligence/priority/peer-divergence-priority";

import {
  evaluatePeerPriorityOrientation,
} from "../intelligence/priority/peer-priority-orientation";

function priority(
  leftCompanyId:
    string,
  rightCompanyId:
    string
): RXPeerDivergencePriorityResult {
  return {
    leftCompanyId,
    rightCompanyId,

    metric:
      "PRODUCTION",

    commodity:
      "COAL",

    status:
      "SCORABLE",

    score:
      20,

    divergenceMagnitude:
      0.25,

    unscorableReasons:
      [],

    causalConclusion:
      "UNKNOWN",
  };
}

describe(
  "evaluatePeerPriorityOrientation",
  () => {
    it(
      "accepts canonical peer priority orientation",
      () => {
        const result =
          evaluatePeerPriorityOrientation(
            priority(
              "COMPANY-A",
              "COMPANY-B"
            )
          );

        expect(
          result.isCanonical
        ).toBe(true);

        expect(
          result.firstCompanyId
        ).toBe(
          "COMPANY-A"
        );

        expect(
          result.secondCompanyId
        ).toBe(
          "COMPANY-B"
        );
      }
    );

    it(
      "identifies reverse peer priority orientation",
      () => {
        const result =
          evaluatePeerPriorityOrientation(
            priority(
              "COMPANY-B",
              "COMPANY-A"
            )
          );

        expect(
          result.isCanonical
        ).toBe(false);

        expect(
          result.firstCompanyId
        ).toBe(
          "COMPANY-A"
        );

        expect(
          result.secondCompanyId
        ).toBe(
          "COMPANY-B"
        );
      }
    );

    it(
      "produces the same pair identity for both orientations",
      () => {
        const direct =
          evaluatePeerPriorityOrientation(
            priority(
              "COMPANY-A",
              "COMPANY-B"
            )
          );

        const reverse =
          evaluatePeerPriorityOrientation(
            priority(
              "COMPANY-B",
              "COMPANY-A"
            )
          );

        expect(
          direct.pairKey
        ).toBe(
          reverse.pairKey
        );
      }
    );

    it(
      "does not mutate peer priority semantics",
      () => {
        const input =
          priority(
            "COMPANY-B",
            "COMPANY-A"
          );

        const before =
          structuredClone(
            input
          );

        evaluatePeerPriorityOrientation(
          input
        );

        expect(
          input
        ).toEqual(
          before
        );
      }
    );
  }
);
