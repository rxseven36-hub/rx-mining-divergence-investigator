import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXNormalizedObservation,
} from "../data/normalization/normalized-observation";

import {
  detectProductionSalesDivergence,
} from "../intelligence/detectors/production-sales-divergence";

import {
  scoreDivergence,
} from "../intelligence/priority/score-divergence";

import {
  rankPriorities,
} from "../intelligence/priority/rank-priorities";

import {
  buildInvestigationQueue,
} from "../investigation/investigation-queue";

function observation(
  input: {
    id: string;
    companyId: string;
    metric:
      | "PRODUCTION"
      | "SALES";
    value: number | null;
  }
): RXNormalizedObservation {
  return {
    id: input.id,

    companyId:
      input.companyId,

    commodity: "COAL",

    commoditySubtype:
      "Thermal Coal",

    metric:
      input.metric,

    value:
      input.value,

    unit: {
      symbol: "Mt",
      dimension: "MASS",
    },

    period: {
      kind: "YEAR",
      year: 2024,
    },

    evidence: [],

    semanticDescription:
      input.metric ===
      "PRODUCTION"
        ? "Coal production"
        : "Coal sales",
     semantic: {
    state: "KNOWN",
    description:
        input.metric ===
        "PRODUCTION"
            ? "Coal production"
            : "Coal sales",
    basis:
       "Test fixture with explicitly validated mining-performance semantics.",
},
  };
}

describe(
  "DETECT -> PRIORITIZE -> QUEUE",
  () => {
    it("opens investigation cases only for ranked valid divergences", () => {
      const high =
        detectProductionSalesDivergence(
          observation({
            id: "high-p",
            companyId: "HIGH.JK",
            metric: "PRODUCTION",
            value: 100,
          }),

          observation({
            id: "high-s",
            companyId: "HIGH.JK",
            metric: "SALES",
            value: 180,
          })
        );

      const low =
        detectProductionSalesDivergence(
          observation({
            id: "low-p",
            companyId: "LOW.JK",
            metric: "PRODUCTION",
            value: 100,
          }),

          observation({
            id: "low-s",
            companyId: "LOW.JK",
            metric: "SALES",
            value: 110,
          })
        );

      const missing =
        detectProductionSalesDivergence(
          observation({
            id: "missing-p",
            companyId:
              "MISSING.JK",
            metric:
              "PRODUCTION",
            value: 100,
          }),

          observation({
            id: "missing-s",
            companyId:
              "MISSING.JK",
            metric: "SALES",
            value: null,
          })
        );

      const priorities = [
        high,
        low,
        missing,
      ].map(scoreDivergence);

      const ranked =
        rankPriorities(
          priorities
        );

      const queue =
        buildInvestigationQueue(
          ranked
        );

      expect(
        queue.cases.map(
          (item) =>
            item.companyId
        )
      ).toEqual([
        "HIGH.JK",
        "LOW.JK",
      ]);

      expect(
        queue.cases.map(
          (item) =>
            item.trigger.rank
        )
      ).toEqual([1, 2]);

      expect(
        queue.cases.every(
          (item) =>
            item.status ===
              "QUEUED" &&
            item.truthState ===
              "UNINVESTIGATED" &&
            item
              .causalExplanation ===
              "UNKNOWN"
        )
      ).toBe(true);
    });
  }
);