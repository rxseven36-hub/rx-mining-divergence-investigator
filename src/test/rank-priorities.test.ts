import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXPriorityResult,
} from "../intelligence/priority/priority-result";

import {
  rankPriorities,
} from "../intelligence/priority/rank-priorities";

function priority(
  companyId: string,
  score: number | null,
  status:
    | "SCORABLE"
    | "UNSCORABLE" =
    "SCORABLE"
): RXPriorityResult {
  return {
    detector:
      "PRODUCTION_VS_SALES",

    detectorStatus:
      status === "SCORABLE"
        ? "DETECTED"
        : "SKIPPED",

    companyId,

    commodity: "COAL",

    periodLabel: "2024",

    sourceObservationIds: [
      `${companyId}-production`,
      `${companyId}-sales`,
    ],

    status,

    score,

    divergenceRatio:
      score === null
        ? null
        : score / 100,

    unscorableReasons:
      status === "SCORABLE"
        ? []
        : [
            "DETECTOR_NOT_DETECTED",
          ],

    causalExplanation:
      "UNKNOWN",
  };
}

describe("rankPriorities", () => {
  it("ranks highest deterministic score first", () => {
    const ranked =
      rankPriorities([
        priority("LOW.JK", 10),
        priority("HIGH.JK", 80),
        priority("MID.JK", 40),
      ]);

    expect(
      ranked.map(
        (item) => item.companyId
      )
    ).toEqual([
      "HIGH.JK",
      "MID.JK",
      "LOW.JK",
    ]);

    expect(
      ranked.map(
        (item) => item.rank
      )
    ).toEqual([1, 2, 3]);
  });

  it("excludes unscorable cases from the ranked queue", () => {
    const ranked =
      rankPriorities([
        priority("GOOD.JK", 30),

        priority(
          "SKIP.JK",
          null,
          "UNSCORABLE"
        ),
      ]);

    expect(ranked).toHaveLength(1);

    expect(
      ranked[0].companyId
    ).toBe("GOOD.JK");
  });

  it("uses deterministic company tie-breaking", () => {
    const ranked =
      rankPriorities([
        priority("ZZZZ.JK", 50),
        priority("AAAA.JK", 50),
      ]);

    expect(
      ranked.map(
        (item) => item.companyId
      )
    ).toEqual([
      "AAAA.JK",
      "ZZZZ.JK",
    ]);
  });

  it("does not mutate the original priority results", () => {
    const first =
      priority("A.JK", 20);

    const second =
      priority("B.JK", 50);

    const input = [
      first,
      second,
    ];

    rankPriorities(input);

    expect(first.rank).toBeUndefined();
    expect(second.rank).toBeUndefined();

    expect(input[0]).toBe(first);
    expect(input[1]).toBe(second);
  });
});