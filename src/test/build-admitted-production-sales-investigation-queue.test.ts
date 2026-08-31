import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXNormalizedObservation,
} from "../data/normalization/normalized-observation";

import type {
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
} from "../investigation/admit-mining-historical-performance-evidence";

import {
  buildAdmittedProductionSalesInvestigationQueue,
} from "../investigation/build-admitted-production-sales-investigation-queue";

type AdmittedResult = Extract<
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
  { status: "ADMITTED" }
>;

type RejectedResult = Extract<
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
  { status: "REJECTED" }
>;

function observation(
  input: {
    id: string;
    companyId: string;
    metric: "PRODUCTION" | "SALES";
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
      input.metric === "PRODUCTION"
        ? "Coal production"
        : "Coal sales",

    semantic: {
      state: "KNOWN",

      description:
        input.metric === "PRODUCTION"
          ? "Coal production"
          : "Coal sales",

      basis:
        "Regression test fixture",
    },
  };
}

function admittedResult(
  input: {
    companyId: string;
    production: number | null;
    sales: number | null;
  }
): AdmittedResult {
  const observations = [
    observation({
      id: `${input.companyId}-production`,
      companyId: input.companyId,
      metric: "PRODUCTION",
      value: input.production,
    }),

    observation({
      id: `${input.companyId}-sales`,
      companyId: input.companyId,
      metric: "SALES",
      value: input.sales,
    }),
  ];

  return {
    status: "ADMITTED",

    collection: {
      requestId:
        `${input.companyId}-request`,

      requirementId:
        `${input.companyId}-requirement`,

      capability:
        "MINING_HISTORICAL_PERFORMANCE",

      status: "AVAILABLE",

      evidence: [],

      issues: [],

      causalConclusion:
        "UNKNOWN",
    },

    observations:
      [...observations],

    admittedObservations:
      [...observations],
  };
}

function rejectedResult(
  companyId: string
): RejectedResult {
  return {
    status: "REJECTED",

    collection: {
      requestId:
        `${companyId}-request`,

      requirementId:
        `${companyId}-requirement`,

      capability:
        "MINING_HISTORICAL_PERFORMANCE",

      status: "INVALID",

      evidence: [],

      issues: [
        "INVALID_RESPONSE",
      ],

      causalConclusion:
        "UNKNOWN",
    },

    observations: [],

    admittedObservations: [],
  };
}

describe(
  "buildAdmittedProductionSalesInvestigationQueue",
  () => {
    it("builds a deterministic investigation queue from admitted evidence", () => {
      const result =
        buildAdmittedProductionSalesInvestigationQueue([
          admittedResult({
            companyId: "LOW.JK",
            production: 100,
            sales: 110,
          }),

          admittedResult({
            companyId: "HIGH.JK",
            production: 100,
            sales: 180,
          }),
        ]);

      expect(
        result.queue.cases.map(
          (item) => item.companyId
        )
      ).toEqual([
        "HIGH.JK",
        "LOW.JK",
      ]);

      expect(
        result.queue.cases.map(
          (item) => item.trigger.rank
        )
      ).toEqual([1, 2]);

      expect(
        result.admissionCount
      ).toBe(2);

      expect(
        result.scoringRunCount
      ).toBe(2);

      expect(
        result.scoringNotRunCount
      ).toBe(0);

      expect(
        result.scorablePriorityCount
      ).toBe(2);

      expect(
        result.unscorablePriorityCount
      ).toBe(0);
    });

    it("does not open a case from rejected evidence", () => {
      const result =
        buildAdmittedProductionSalesInvestigationQueue([
          admittedResult({
            companyId: "VALID.JK",
            production: 100,
            sales: 150,
          }),

          rejectedResult(
            "REJECTED.JK"
          ),
        ]);

      expect(
        result.queue.cases.map(
          (item) => item.companyId
        )
      ).toEqual([
        "VALID.JK",
      ]);

      expect(
        result.admissionCount
      ).toBe(2);

      expect(
        result.scoringRunCount
      ).toBe(1);

      expect(
        result.scoringNotRunCount
      ).toBe(1);

      expect(
        result.scorablePriorityCount
      ).toBe(1);

      expect(
        result.unscorablePriorityCount
      ).toBe(0);
    });

    it("accounts for unscorable results without inventing an investigation case", () => {
      const result =
        buildAdmittedProductionSalesInvestigationQueue([
          admittedResult({
            companyId: "VALID.JK",
            production: 100,
            sales: 150,
          }),

          admittedResult({
            companyId: "ZERO.JK",
            production: 0,
            sales: 10,
          }),
        ]);

      expect(
        result.queue.cases.map(
          (item) => item.companyId
        )
      ).toEqual([
        "VALID.JK",
      ]);

      expect(
        result.scoringRunCount
      ).toBe(2);

      expect(
        result.scoringNotRunCount
      ).toBe(0);

      expect(
        result.scorablePriorityCount
      ).toBe(1);

      expect(
        result.unscorablePriorityCount
      ).toBe(1);

      expect(
        result.queue.rejectedPriorityCount
      ).toBe(0);
    });

    it("returns an empty queue when no admitted evidence can run scoring", () => {
      const result =
        buildAdmittedProductionSalesInvestigationQueue([
          rejectedResult(
            "FIRST.JK"
          ),

          rejectedResult(
            "SECOND.JK"
          ),
        ]);

      expect(
        result.queue.cases
      ).toEqual([]);

      expect(
        result.admissionCount
      ).toBe(2);

      expect(
        result.scoringRunCount
      ).toBe(0);

      expect(
        result.scoringNotRunCount
      ).toBe(2);

      expect(
        result.scorablePriorityCount
      ).toBe(0);

      expect(
        result.unscorablePriorityCount
      ).toBe(0);

      expect(
        result.queue.rejectedPriorityCount
      ).toBe(0);
    });
  }
);