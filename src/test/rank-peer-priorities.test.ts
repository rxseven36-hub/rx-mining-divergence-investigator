import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXPeerDivergencePriorityResult,
} from "../intelligence/priority/peer-divergence-priority";

import {
  rankPeerPriorities,
} from "../intelligence/priority/rank-peer-priorities";

function priority(
  leftCompanyId:
    string,
  rightCompanyId:
    string,
  score:
    number | null,
  status:
    | "SCORABLE"
    | "UNSCORABLE" =
    "SCORABLE"
): RXPeerDivergencePriorityResult {
  return {
    leftCompanyId,

    rightCompanyId,

    leftObservationId:
      `${leftCompanyId}-production-2024`,

    rightObservationId:
      `${rightCompanyId}-production-2024`,

    metric:
      "PRODUCTION",

    commodity:
      "COAL",

    leftCommoditySubtype:
      undefined,

    rightCommoditySubtype:
      undefined,

    leftUnit: {
      dimension:
        "MASS",
      symbol:
        "MT",
    },

    rightUnit: {
      dimension:
        "MASS",
      symbol:
        "MT",
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

    status,

    score,

    divergenceMagnitude:
      score === null
        ? null
        : score / 100,

    unscorableReasons:
      status ===
        "SCORABLE"
        ? []
        : [
            "SIGNAL_NOT_COMPARABLE",
          ],

    causalConclusion:
      "UNKNOWN",
  };
}

describe(
  "rankPeerPriorities",
  () => {
    it(
      "ranks highest deterministic peer priority score first",
      () => {
        const ranked =
          rankPeerPriorities([
            priority(
              "A",
              "B",
              10
            ),

            priority(
              "C",
              "D",
              80
            ),

            priority(
              "E",
              "F",
              40
            ),
          ]);

        expect(
          ranked.map(
            (item) =>
              item.score
          )
        ).toEqual([
          80,
          40,
          10,
        ]);

        expect(
          ranked.map(
            (item) =>
              item.rank
          )
        ).toEqual([
          1,
          2,
          3,
        ]);
      }
    );

    it(
      "excludes unscorable and non-finite peer priorities",
      () => {
        const invalidFinite =
          priority(
            "E",
            "F",
            10
          );

        invalidFinite.score =
          Number.POSITIVE_INFINITY;

        const ranked =
          rankPeerPriorities([
            priority(
              "A",
              "B",
              30
            ),

            priority(
              "C",
              "D",
              null,
              "UNSCORABLE"
            ),

            invalidFinite,
          ]);

        expect(
          ranked
        ).toHaveLength(
          1
        );

        expect(
          ranked[0].leftCompanyId
        ).toBe(
          "A"
        );

        expect(
          ranked[0].rightCompanyId
        ).toBe(
          "B"
        );
      }
    );

    it(
      "uses deterministic peer comparison identity for equal scores",
      () => {
        const ranked =
          rankPeerPriorities([
            priority(
              "C",
              "D",
              50
            ),

            priority(
              "A",
              "B",
              50
            ),
          ]);

        expect(
          ranked.map(
            (item) => [
              item.leftCompanyId,
              item.rightCompanyId,
            ]
          )
        ).toEqual([
          [
            "A",
            "B",
          ],
          [
            "C",
            "D",
          ],
        ]);
      }
    );

    it(
      "produces deterministic ordering for shuffled equal-score input",
      () => {
        const first =
          priority(
            "A",
            "B",
            50
          );

        const second =
          priority(
            "C",
            "D",
            50
          );

        const direct =
          rankPeerPriorities([
            first,
            second,
          ]);

        const reverse =
          rankPeerPriorities([
            second,
            first,
          ]);

        expect(
          reverse.map(
            (item) => [
              item.leftCompanyId,
              item.rightCompanyId,
              item.rank,
            ]
          )
        ).toEqual(
          direct.map(
            (item) => [
              item.leftCompanyId,
              item.rightCompanyId,
              item.rank,
            ]
          )
        );
      }
    );

    it(
      "does not mutate source peer priorities or nested context",
      () => {
        const first =
          priority(
            "A",
            "B",
            20
          );

        const second =
          priority(
            "C",
            "D",
            50
          );

        const originalFirstUnit =
          first.leftUnit;

        const originalFirstPeriod =
          first.leftPeriod;

        const input = [
          first,
          second,
        ];

        const ranked =
          rankPeerPriorities(
            input
          );

        expect(
          input[0]
        ).toBe(
          first
        );

        expect(
          input[1]
        ).toBe(
          second
        );

        expect(
          "rank" in first
        ).toBe(
          false
        );

        expect(
          ranked[1].leftUnit
        ).not.toBe(
          originalFirstUnit
        );

        expect(
          ranked[1].leftPeriod
        ).not.toBe(
          originalFirstPeriod
        );

        expect(
          first.causalConclusion
        ).toBe(
          "UNKNOWN"
        );

        expect(
          ranked[1].causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );
  }
);