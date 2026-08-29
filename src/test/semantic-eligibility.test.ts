import {
  describe,
  expect,
  it,
} from "vitest";

import {
  evaluateSemanticEligibility,
} from "../data/normalization/semantic-eligibility";

describe(
  "evaluateSemanticEligibility",
  () => {
    it("allows explicitly known semantics with a basis", () => {
      expect(
        evaluateSemanticEligibility({
          metric: "PRODUCTION",
          sourceField: "production",
          semantic: {
            state: "KNOWN",
            description:
              "Mining production.",
            basis:
              "Validated source-field mapping.",
          },
        })
      ).toEqual({
        eligible: true,
        reason:
          "EXPLICITLY_KNOWN",
      });
    });

    it("rejects unknown semantics even when description exists", () => {
      expect(
        evaluateSemanticEligibility({
          metric: "PRODUCTION",
          sourceField: "mystery_field",
          semantic: {
            state: "UNKNOWN",
            description:
              "Generated production description.",
          },
        })
      ).toEqual({
        eligible: false,
        reason:
          "SEMANTICS_UNKNOWN",
      });
    });

    it("rejects KNOWN state without an explicit basis", () => {
      expect(
        evaluateSemanticEligibility({
          metric: "SALES",
          sourceField: "sales",
          semantic: {
            state: "KNOWN",
            description:
              "Mining sales.",
          },
        })
      ).toEqual({
        eligible: false,
        reason:
          "KNOWN_BASIS_MISSING",
      });
    });
  }
);