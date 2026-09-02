import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXPeerDivergenceSignal,
} from "../intelligence/comparability/peer-divergence-signal";

import {
  scorePeerDivergence,
} from "../intelligence/priority/score-peer-divergence";

function signal(
  overrides:
    Partial<RXPeerDivergenceSignal> = {}
): RXPeerDivergenceSignal {
  return {
    status:
      "COMPARABLE",

    leftCompanyId:
      "COMPANY-A",

    rightCompanyId:
      "COMPANY-B",

    leftObservationId:
      "obs-a",

    rightObservationId:
      "obs-b",

    metric:
      "PRODUCTION",

    commodity:
      "COAL",

    leftCommoditySubtype:
      "Sub-bituminous Coal",

    rightCommoditySubtype:
      "Sub-bituminous Coal",

    leftUnit: {
      symbol:
        "Mt",

      dimension:
        "MASS",
    },

    rightUnit: {
      symbol:
        "Mt",

      dimension:
        "MASS",
    },

    leftPeriod: {
      kind:
        "YEAR",

      year:
        2024,
    },

    rightPeriod: {
      kind:
        "YEAR",

      year:
        2024,
    },

    leftValue:
      60,

    rightValue:
      50,

    absoluteDifference:
      10,

    relativeDifference:
      0.2,

    comparability: {
      eligible:
        true,

      issues:
        [],

      causalConclusion:
        "UNKNOWN",
    },

    causalConclusion:
      "UNKNOWN",

    ...overrides,
  };
}

describe(
  "scorePeerDivergence",
  () => {
    it(
      "scores a comparable peer divergence deterministically",
      () => {
        const result =
          scorePeerDivergence(
            signal()
          );

        expect(
          result.status
        ).toBe(
          "SCORABLE"
        );

        expect(
          result.leftCompanyId
        ).toBe(
          "COMPANY-A"
        );

        expect(
          result.rightCompanyId
        ).toBe(
          "COMPANY-B"
        );

        expect(
          result.metric
        ).toBe(
          "PRODUCTION"
        );

        expect(
          result.commodity
        ).toBe(
          "COAL"
        );

        expect(
          result.divergenceMagnitude
        ).toBeCloseTo(
          0.2
        );

        expect(
          result.score
        ).toBeCloseTo(
          (100 * 0.2) /
            (1 + 0.2)
        );

        expect(
          result.unscorableReasons
        ).toEqual(
          []
        );

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "uses magnitude for scoring while preserving signed direction only in the source signal",
      () => {
        const result =
          scorePeerDivergence(
            signal({
              relativeDifference:
                -0.5,
            })
          );

        expect(
          result.status
        ).toBe(
          "SCORABLE"
        );

        expect(
          result.divergenceMagnitude
        ).toBeCloseTo(
          0.5
        );

        expect(
          result.score
        ).toBeCloseTo(
          (100 * 0.5) /
            (1 + 0.5)
        );
      }
    );

    it(
      "does not score a non-comparable peer signal",
      () => {
        const result =
          scorePeerDivergence(
            signal({
              status:
                "NOT_COMPARABLE",

              relativeDifference:
                null,
            })
          );

        expect(
          result.status
        ).toBe(
          "UNSCORABLE"
        );

        expect(
          result.score
        ).toBeNull();

        expect(
          result.divergenceMagnitude
        ).toBeNull();

        expect(
          result.unscorableReasons
        ).toEqual([
          "SIGNAL_NOT_COMPARABLE",
        ]);

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "does not invent a ratio when relative difference is undefined",
      () => {
        const result =
          scorePeerDivergence(
            signal({
              relativeDifference:
                null,
            })
          );

        expect(
          result.status
        ).toBe(
          "UNSCORABLE"
        );

        expect(
          result.score
        ).toBeNull();

        expect(
          result.divergenceMagnitude
        ).toBeNull();

        expect(
          result.unscorableReasons
        ).toEqual([
          "RELATIVE_DIFFERENCE_UNDEFINED",
        ]);
      }
    );

    it(
      "rejects a non-finite relative difference",
      () => {
        const result =
          scorePeerDivergence(
            signal({
              relativeDifference:
                Number.POSITIVE_INFINITY,
            })
          );

        expect(
          result.status
        ).toBe(
          "UNSCORABLE"
        );

        expect(
          result.score
        ).toBeNull();

        expect(
          result.divergenceMagnitude
        ).toBeNull();

        expect(
          result.unscorableReasons
        ).toEqual([
          "RELATIVE_DIFFERENCE_INVALID",
        ]);
      }
    );

    it(
      "does not prioritize comparable observations with zero divergence",
      () => {
        const result =
          scorePeerDivergence(
            signal({
              leftValue:
                50,

              rightValue:
                50,

              absoluteDifference:
                0,

              relativeDifference:
                0,
            })
          );

        expect(
          result.status
        ).toBe(
          "UNSCORABLE"
        );

        expect(
          result.score
        ).toBeNull();

        expect(
          result.divergenceMagnitude
        ).toBe(
          0
        );

        expect(
          result.unscorableReasons
        ).toEqual([
          "NO_DIVERGENCE",
        ]);

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );
  }
);
