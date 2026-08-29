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

function observation(
  input: {
    id: string;
    companyId: string;
    productionOrSales:
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
      input.productionOrSales,

    value: input.value,

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
      input.productionOrSales ===
      "PRODUCTION"
        ? "Coal production"
        : "Coal sales",
    semantic: {
    state: "KNOWN",
    description:
         input.productionOrSales ===
         "PRODUCTION"
             ? "Coal production"
             : "Coal sales",
        basis:
         "Test fixture with explicitly validated mining-performance semantics.",
},
  };
}

describe(
  "DETECT -> PRIORITIZE pipeline",
  () => {
    it("ranks only valid detected divergences", () => {
      const companyA =
        detectProductionSalesDivergence(
          observation({
            id: "a-production",
            companyId: "A.JK",
            productionOrSales:
              "PRODUCTION",
            value: 100,
          }),

          observation({
            id: "a-sales",
            companyId: "A.JK",
            productionOrSales:
              "SALES",
            value: 120,
          })
        );

      const companyB =
        detectProductionSalesDivergence(
          observation({
            id: "b-production",
            companyId: "B.JK",
            productionOrSales:
              "PRODUCTION",
            value: 100,
          }),

          observation({
            id: "b-sales",
            companyId: "B.JK",
            productionOrSales:
              "SALES",
            value: 160,
          })
        );

      const missingSales =
        detectProductionSalesDivergence(
          observation({
            id: "c-production",
            companyId: "C.JK",
            productionOrSales:
              "PRODUCTION",
            value: 100,
          }),

          observation({
            id: "c-sales",
            companyId: "C.JK",
            productionOrSales:
              "SALES",
            value: null,
          })
        );

      const noDivergence =
        detectProductionSalesDivergence(
          observation({
            id: "d-production",
            companyId: "D.JK",
            productionOrSales:
              "PRODUCTION",
            value: 100,
          }),

          observation({
            id: "d-sales",
            companyId: "D.JK",
            productionOrSales:
              "SALES",
            value: 100,
          })
        );

      const priorities = [
        companyA,
        companyB,
        missingSales,
        noDivergence,
      ].map(scoreDivergence);

      const ranked =
        rankPriorities(
          priorities
        );

      expect(
        ranked.map(
          (item) => item.companyId
        )
      ).toEqual([
        "B.JK",
        "A.JK",
      ]);

      expect(
        ranked.map(
          (item) => item.rank
        )
      ).toEqual([1, 2]);

      expect(
        ranked.every(
          (item) =>
            item.status ===
            "SCORABLE"
        )
      ).toBe(true);
    });
  }
);