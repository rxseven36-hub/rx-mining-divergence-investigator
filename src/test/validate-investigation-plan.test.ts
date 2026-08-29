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

import {
  validateInvestigationPlan,
} from "../investigation/validate-investigation-plan";

function investigationCase():
  RXInvestigationCase {
  return {
    caseId:
      "RX-TEST-JK-COAL-2024-1",

    companyId: "TEST.JK",

    commodity: "COAL",

    periodLabel: "2024",

    detector:
      "PRODUCTION_VS_SALES",

    trigger: {
      detector:
        "PRODUCTION_VS_SALES",

      priorityScore: 20,

      divergenceRatio: 0.25,

      rank: 1,

      triggerType:
        "DETERMINISTIC_DIVERGENCE_PRIORITY",
    },

    sourceObservationIds: [
      "p",
      "s",
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
  "validateInvestigationPlan",
  () => {
    it("accepts the baseline deterministic plan", () => {
      const plan =
        createInvestigationPlan(
          investigationCase()
        );

      const validation =
        validateInvestigationPlan(
          plan
        );

      expect(
        validation.valid
      ).toBe(true);

      expect(
        validation.issues
      ).toEqual([]);
    });

    it("rejects a plan without questions", () => {
      const plan =
        createInvestigationPlan(
          investigationCase()
        );

      plan.questions = [];

      const validation =
        validateInvestigationPlan(
          plan
        );

      expect(
        validation.valid
      ).toBe(false);

      expect(
        validation.issues
      ).toContain(
        "NO_QUESTIONS"
      );

      expect(
        validation.issues
      ).toContain(
        "ORPHAN_EVIDENCE_REQUIREMENT"
      );
    });

    it("detects orphan evidence requirements", () => {
      const plan =
        createInvestigationPlan(
          investigationCase()
        );

      plan.evidenceRequirements[0] = {
        ...plan.evidenceRequirements[0],
        questionId:
          "DOES-NOT-EXIST",
      };

      const validation =
        validateInvestigationPlan(
          plan
        );

      expect(
        validation.issues
      ).toContain(
        "ORPHAN_EVIDENCE_REQUIREMENT"
      );
    });

    it("detects orphan data requests", () => {
      const plan =
        createInvestigationPlan(
          investigationCase()
        );

      plan.dataRequests[0] = {
        ...plan.dataRequests[0],
        requirementId:
          "DOES-NOT-EXIST",
      };

      const validation =
        validateInvestigationPlan(
          plan
        );

      expect(
        validation.issues
      ).toContain(
        "ORPHAN_DATA_REQUEST"
      );
    });

    it("rejects a plan without required evidence", () => {
      const plan =
        createInvestigationPlan(
          investigationCase()
        );

      plan.evidenceRequirements =
        plan.evidenceRequirements.map(
          (item) => ({
            ...item,
            required: false,
          })
        );

      const validation =
        validateInvestigationPlan(
          plan
        );

      expect(
        validation.issues
      ).toContain(
        "NO_REQUIRED_EVIDENCE"
      );
    });
  }
);