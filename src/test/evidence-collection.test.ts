import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXInvestigationDataRequest,
} from "../investigation/investigation-plan";

import {
  createEvidenceCollectionResult,
} from "../investigation/create-evidence-collection-result";

function request():
  RXInvestigationDataRequest {
  return {
    requestId: "R1",

    requirementId: "E1",

    source: "SECTORS",

    capability:
      "MINING_OPERATIONAL_CONTEXT",

    purpose:
      "Collect operational evidence.",

    status: "PLANNED",
  };
}

describe(
  "createEvidenceCollectionResult",
  () => {
    it("creates available evidence without changing truth into a causal conclusion", () => {
      const result =
        createEvidenceCollectionResult({
          request: request(),

          status: "AVAILABLE",

          evidence: [
            {
              evidenceId: "EV1",

              source: "SECTORS",

              sourceReference:
                "observation-1",

              truthClass:
                "SOURCE_FACT",

              description:
                "Production observation.",
            },
          ],
        });

      expect(
        result.status
      ).toBe("AVAILABLE");

      expect(
        result.evidence
      ).toHaveLength(1);

      expect(
        result.causalConclusion
      ).toBe("UNKNOWN");
    });

    it("preserves unavailable as unavailable instead of converting it to zero or absence of event", () => {
      const result =
        createEvidenceCollectionResult({
          request: request(),

          status:
            "UNAVAILABLE",

          issues: ["NO_DATA"],
        });

      expect(
        result.status
      ).toBe("UNAVAILABLE");

      expect(
        result.evidence
      ).toEqual([]);

      expect(
        result.issues
      ).toEqual(["NO_DATA"]);
    });

    it("copies evidence and issue arrays", () => {
      const evidence = [
        {
          evidenceId: "EV1",

          source:
            "SECTORS" as const,

          sourceReference:
            "source-1",

          truthClass:
            "SOURCE_FACT" as const,

          description:
            "Source evidence.",
        },
      ];

      const issues: [] = [];

      const result =
        createEvidenceCollectionResult({
          request: request(),
          status: "AVAILABLE",
          evidence,
          issues,
        });

      expect(
        result.evidence
      ).not.toBe(evidence);

      expect(
        result.issues
      ).not.toBe(issues);
    });
  }
);