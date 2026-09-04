import {
  describe,
  expect,
  it,
} from "vitest";

import {
  RXEvidenceBoundedHypothesisSchema,
} from "../intelligence/hypothesis/evidence-bounded-hypothesis-schema";

function createValidCandidate() {
  return {
    caseId:
      "CASE-001",

    planId:
      "PLAN-001",

    hypothesisId:
      "HYPOTHESIS-001",

    statement:
      "Operational conditions may explain the observed peer divergence.",

    supportingEvidence: [
      {
        evidenceId:
          "EVIDENCE-001",

        requestId:
          "REQUEST-001",
      },
    ],

    counterEvidence: [
      {
        evidenceId:
          "EVIDENCE-002",

        requestId:
          "REQUEST-002",
      },
    ],

    alternativeExplanations: [
      "Commodity conditions may also contribute to the divergence.",
    ],

    uncertainties: [
      "The available evidence does not establish causality.",
    ],

    causalConclusion:
      "UNKNOWN" as const,
  };
}

describe(
  "RXEvidenceBoundedHypothesisSchema",
  () => {
    it(
      "accepts a structurally valid evidence-bounded hypothesis",
      () => {
        const candidate =
          createValidCandidate();

        const result =
          RXEvidenceBoundedHypothesisSchema
            .safeParse(candidate);

        expect(result.success)
          .toBe(true);
      }
    );

    it(
      "accepts empty evidence and reasoning arrays",
      () => {
        const candidate = {
          ...createValidCandidate(),

          supportingEvidence: [],
          counterEvidence: [],
          alternativeExplanations: [],
          uncertainties: [],
        };

        const result =
          RXEvidenceBoundedHypothesisSchema
            .safeParse(candidate);

        expect(result.success)
          .toBe(true);
      }
    );

    it(
      "rejects missing required hypothesis identity",
      () => {
        const candidate:
          Record<string, unknown> = {
            ...createValidCandidate(),
          };

        delete candidate.hypothesisId;

        const result =
          RXEvidenceBoundedHypothesisSchema
            .safeParse(candidate);

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects empty identity values",
      () => {
        const candidate = {
          ...createValidCandidate(),

          caseId:
            "",
        };

        const result =
          RXEvidenceBoundedHypothesisSchema
            .safeParse(candidate);

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects blank hypothesis statements after trimming",
      () => {
        const candidate = {
          ...createValidCandidate(),

          statement:
            "   ",
        };

        const result =
          RXEvidenceBoundedHypothesisSchema
            .safeParse(candidate);

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects malformed supporting evidence references",
      () => {
        const candidate = {
          ...createValidCandidate(),

          supportingEvidence: [
            {
              evidenceId:
                "EVIDENCE-001",
            },
          ],
        };

        const result =
          RXEvidenceBoundedHypothesisSchema
            .safeParse(candidate);

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects blank narrative entries",
      () => {
        const candidate = {
          ...createValidCandidate(),

          uncertainties: [
            "   ",
          ],
        };

        const result =
          RXEvidenceBoundedHypothesisSchema
            .safeParse(candidate);

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects causal conclusions other than UNKNOWN",
      () => {
        const candidate = {
          ...createValidCandidate(),

          causalConclusion:
            "ESTABLISHED",
        };

        const result =
          RXEvidenceBoundedHypothesisSchema
            .safeParse(candidate);

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects extra fields on the hypothesis object",
      () => {
        const candidate = {
          ...createValidCandidate(),

          confidence:
            0.92,
        };

        const result =
          RXEvidenceBoundedHypothesisSchema
            .safeParse(candidate);

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects extra fields on evidence references",
      () => {
        const candidate = {
          ...createValidCandidate(),

          supportingEvidence: [
            {
              evidenceId:
                "EVIDENCE-001",

              requestId:
                "REQUEST-001",

              inventedFact:
                "not allowed",
            },
          ],
        };

        const result =
          RXEvidenceBoundedHypothesisSchema
            .safeParse(candidate);

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "does not perform semantic evidence validation",
      () => {
        const candidate = {
          ...createValidCandidate(),

          supportingEvidence: [
            {
              evidenceId:
                "NONEXISTENT-EVIDENCE",

              requestId:
                "WRONG-REQUEST",
            },
          ],
        };

        const result =
          RXEvidenceBoundedHypothesisSchema
            .safeParse(candidate);

        expect(result.success)
          .toBe(true);
      }
    );
  }
);
