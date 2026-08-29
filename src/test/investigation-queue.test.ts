import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXPriorityResult,
} from "../intelligence/priority/priority-result";

import {
  buildInvestigationQueue,
} from "../investigation/investigation-queue";

function rankedPriority(
  input: {
    companyId: string;
    rank: number;
    score: number;
  }
): RXPriorityResult {
  return {
    detector:
      "PRODUCTION_VS_SALES",

    detectorStatus:
      "DETECTED",

    companyId:
      input.companyId,

    commodity: "COAL",

    periodLabel: "2024",

    sourceObservationIds: [
      `${input.companyId}-production`,
      `${input.companyId}-sales`,
    ],

    status: "SCORABLE",

    score: input.score,

    divergenceRatio:
      input.score / 100,

    rank: input.rank,

    unscorableReasons: [],

    causalExplanation:
      "UNKNOWN",
  };
}

describe(
  "buildInvestigationQueue",
  () => {
    it("builds cases in rank order even when input is shuffled", () => {
      const queue =
        buildInvestigationQueue([
          rankedPriority({
            companyId: "C.JK",
            rank: 3,
            score: 20,
          }),

          rankedPriority({
            companyId: "A.JK",
            rank: 1,
            score: 80,
          }),

          rankedPriority({
            companyId: "B.JK",
            rank: 2,
            score: 50,
          }),
        ]);

      expect(
        queue.cases.map(
          (item) =>
            item.companyId
        )
      ).toEqual([
        "A.JK",
        "B.JK",
        "C.JK",
      ]);

      expect(
        queue.cases.map(
          (item) =>
            item.trigger.rank
        )
      ).toEqual([1, 2, 3]);
    });

    it("rejects invalid priorities instead of inventing cases", () => {
      const invalid:
        RXPriorityResult = {
        detector:
          "PRODUCTION_VS_SALES",

        detectorStatus:
          "SKIPPED",

        companyId: "AMMN.JK",

        commodity: "COPPER",

        periodLabel: "2024",

        sourceObservationIds: [
          "production",
          "sales",
        ],

        status:
          "UNSCORABLE",

        score: null,

        divergenceRatio:
          null,

        unscorableReasons: [
          "DETECTOR_NOT_DETECTED",
        ],

        causalExplanation:
          "UNKNOWN",
      };

      const queue =
        buildInvestigationQueue([
          rankedPriority({
            companyId: "A.JK",
            rank: 1,
            score: 50,
          }),

          invalid,
        ]);

      expect(
        queue.cases
      ).toHaveLength(1);

      expect(
        queue.rejectedPriorityCount
      ).toBe(1);

      expect(
        queue.cases[0].companyId
      ).toBe("A.JK");
    });

    it("returns an empty queue when nothing is eligible", () => {
      const queue =
        buildInvestigationQueue(
          []
        );

      expect(
        queue.cases
      ).toEqual([]);

      expect(
        queue.rejectedPriorityCount
      ).toBe(0);
    });
  }
);