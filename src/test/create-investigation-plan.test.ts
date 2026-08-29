import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXInvestigationCase,
} from "../investigation/investigation-case";

import {
  createInvestigationPlan,
} from "../investigation/create-investigation-plan";

function investigationCase():
  RXInvestigationCase {
  return {
    caseId:
      "RX-AADI-JK-COAL-THERMAL-COAL-2024-1",

    companyId: "AADI.JK",

    commodity: "COAL",

    commoditySubtype:
      "Thermal Coal",

    periodLabel: "2024",

    detector:
      "PRODUCTION_VS_SALES",

    trigger: {
      detector:
        "PRODUCTION_VS_SALES",

      priorityScore: 13.78,

      divergenceRatio:
        7.69 / 48.11,

      rank: 1,

      triggerType:
        "DETERMINISTIC_DIVERGENCE_PRIORITY",
    },

    sourceObservationIds: [
      "production-2024",
      "sales-2024",
    ],

    status: "QUEUED",

    truthState:
      "UNINVESTIGATED",

    unknowns: [],

    causalExplanation:
      "UNKNOWN",
  };
}

describe(
  "createInvestigationPlan",
  () => {
    it("creates a deterministic plan for an investigation case", () => {
      const first =
        createInvestigationPlan(
          investigationCase()
        );

      const second =
        createInvestigationPlan(
          investigationCase()
        );

      expect(first).toEqual(second);

      expect(first.planId).toBe(
        "PLAN-RX-AADI-JK-COAL-THERMAL-COAL-2024-1"
      );
    });

    it("starts without a causal conclusion", () => {
      const plan =
        createInvestigationPlan(
          investigationCase()
        );

      expect(
        plan.causalConclusion
      ).toBe("UNKNOWN");

      expect(
        plan.questions.every(
          (item) =>
            item.causalClaim ===
            "NONE"
        )
      ).toBe(true);
    });

    it("creates four investigation questions", () => {
      const plan =
        createInvestigationPlan(
          investigationCase()
        );

      expect(
        plan.questions
      ).toHaveLength(4);

      expect(
        plan.questions.map(
          (item) => item.kind
        )
      ).toEqual([
        "OPERATIONAL_CONTEXT",
        "HISTORICAL_COMPARISON",
        "COMMODITY_CONTEXT",
        "MARKET_REACTION",
      ]);
    });

    it("marks operational and historical evidence as required", () => {
      const plan =
        createInvestigationPlan(
          investigationCase()
        );

      const required =
        plan.evidenceRequirements
          .filter(
            (item) =>
              item.required
          )
          .map(
            (item) => item.kind
          );

      expect(required).toEqual([
        "COMPANY_OPERATIONAL",
        "HISTORICAL_PERFORMANCE",
      ]);
    });

    it("keeps commodity and market context optional", () => {
      const plan =
        createInvestigationPlan(
          investigationCase()
        );

      const optional =
        plan.evidenceRequirements
          .filter(
            (item) =>
              !item.required
          )
          .map(
            (item) => item.kind
          );

      expect(optional).toEqual([
        "COMMODITY_PRICE",
        "MARKET_TRANSACTION",
      ]);
    });

    it("creates only planned Sectors data requests", () => {
      const plan =
        createInvestigationPlan(
          investigationCase()
        );

      expect(
        plan.dataRequests
      ).toHaveLength(4);

      expect(
        plan.dataRequests.every(
          (item) =>
            item.source ===
              "SECTORS" &&
            item.status ===
              "PLANNED"
        )
      ).toBe(true);
    });

    it("contains explicit stop conditions", () => {
      const plan =
        createInvestigationPlan(
          investigationCase()
        );

      expect(
        plan.stopConditions
      ).toContain(
        "REQUIRED_EVIDENCE_COLLECTED"
      );

      expect(
        plan.stopConditions
      ).toContain(
        "REQUIRED_EVIDENCE_UNAVAILABLE"
      );

      expect(
        plan.stopConditions
      ).toContain(
        "REQUEST_BUDGET_REACHED"
      );
    });
  }
);