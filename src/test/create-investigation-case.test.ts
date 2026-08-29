import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXPriorityResult,
} from "../intelligence/priority/priority-result";

import {
  createInvestigationCase,
} from "../investigation/create-investigation-case";

function validPriority(
  overrides:
    Partial<RXPriorityResult> = {}
): RXPriorityResult {
  return {
    detector:
      "PRODUCTION_VS_SALES",

    detectorStatus:
      "DETECTED",

    companyId: "AADI.JK",

    commodity: "COAL",

    commoditySubtype:
      "Thermal Coal",

    periodLabel: "2024",

    sourceObservationIds: [
      "production-2024",
      "sales-2024",
    ],

    status: "SCORABLE",

    score: 13.78,

    divergenceRatio:
      7.69 / 48.11,

    rank: 1,

    unscorableReasons: [],

    causalExplanation:
      "UNKNOWN",

    ...overrides,
  };
}

describe(
  "createInvestigationCase",
  () => {
    it("creates a queued investigation from a valid ranked priority", () => {
      const result =
        createInvestigationCase(
          validPriority()
        );

      expect(result.ok).toBe(true);

      if (!result.ok) {
        throw new Error(
          "Expected case creation to succeed"
        );
      }

      expect(
        result.case.status
      ).toBe("QUEUED");

      expect(
        result.case.truthState
      ).toBe("UNINVESTIGATED");

      expect(
        result.case.trigger.rank
      ).toBe(1);

      expect(
        result.case.causalExplanation
      ).toBe("UNKNOWN");

      expect(
        result.case.unknowns
      ).toEqual([]);
    });

    it("creates a deterministic case id", () => {
      const first =
        createInvestigationCase(
          validPriority()
        );

      const second =
        createInvestigationCase(
          validPriority()
        );

      expect(first.ok).toBe(true);
      expect(second.ok).toBe(true);

      if (
        !first.ok ||
        !second.ok
      ) {
        throw new Error(
          "Expected deterministic case creation"
        );
      }

      expect(
        first.case.caseId
      ).toBe(
        second.case.caseId
      );

      expect(
        first.case.caseId
      ).toBe(
        "RX-AADI-JK-COAL-THERMAL-COAL-2024-1"
      );
    });

    it("copies source observation ids instead of sharing the same array", () => {
      const priority =
        validPriority();

      const result =
        createInvestigationCase(
          priority
        );

      expect(result.ok).toBe(true);

      if (!result.ok) {
        throw new Error(
          "Expected case creation to succeed"
        );
      }

      expect(
        result.case
          .sourceObservationIds
      ).toEqual(
        priority.sourceObservationIds
      );

      expect(
        result.case
          .sourceObservationIds
      ).not.toBe(
        priority.sourceObservationIds
      );
    });

    it("rejects an unscorable priority", () => {
      const result =
        createInvestigationCase(
          validPriority({
            status:
              "UNSCORABLE",

            score: null,

            divergenceRatio:
              null,

            rank: undefined,

            unscorableReasons: [
              "RATIO_UNDEFINED",
            ],
          })
        );

      expect(result.ok).toBe(false);

      if (result.ok) {
        throw new Error(
          "Expected rejection"
        );
      }

      expect(
        result.reasons
      ).toContain(
        "PRIORITY_NOT_SCORABLE"
      );
    });

    it("rejects a scorable priority without rank", () => {
      const result =
        createInvestigationCase(
          validPriority({
            rank: undefined,
          })
        );

      expect(result.ok).toBe(false);

      if (result.ok) {
        throw new Error(
          "Expected rejection"
        );
      }

      expect(
        result.reasons
      ).toContain("RANK_MISSING");
    });

    it("rejects invalid rank zero", () => {
      const result =
        createInvestigationCase(
          validPriority({
            rank: 0,
          })
        );

      expect(result.ok).toBe(false);

      if (result.ok) {
        throw new Error(
          "Expected rejection"
        );
      }

      expect(
        result.reasons
      ).toContain("RANK_INVALID");
    });
  }
);