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
  getCapabilityDefinition,
} from "../investigation/capability-registry";

function investigationCase():
  RXInvestigationCase {
  return {
    caseId:
      "RX-AADI-JK-COAL-2024-1",

    companyId: "AADI.JK",

    commodity: "COAL",

    periodLabel: "2024",

    detector:
      "PRODUCTION_VS_SALES",

    trigger: {
      detector:
        "PRODUCTION_VS_SALES",

      priorityScore: 15,

      divergenceRatio: 0.18,

      rank: 1,

      triggerType:
        "DETERMINISTIC_DIVERGENCE_PRIORITY",
    },

    sourceObservationIds: [
      "production",
      "sales",
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
  "plan capability contract",
  () => {
    it("ensures every planned data request resolves to an official capability", () => {
      const plan =
        createInvestigationPlan(
          investigationCase()
        );

      expect(
        plan.dataRequests.every(
          (request) =>
            getCapabilityDefinition(
              request.capability
            ) !== undefined
        )
      ).toBe(true);
    });
  }
);