import {
  describe,
  expect,
  it,
} from "vitest";

import {
  RXEvidenceBoundedIntelligenceBriefSchema,
} from "../intelligence/synthesis/evidence-bounded-intelligence-brief-schema";

function createValidBrief() {
  return {
    caseId:
      "CASE-017M",

    planId:
      "PLAN-017M",

    briefId:
      "BRIEF-017M",

    hypothesisId:
      "HYPOTHESIS-017M",

    challengeId:
      "CHALLENGE-017M",

    executiveSummary:
      "The admitted evidence supports a bounded interpretation while material concerns remain unresolved.",

    evidenceReferences: [
      {
        evidenceId:
          "EVIDENCE-001",

        requestId:
          "REQUEST-001",
      },
    ],

    alternativeExplanations: [
      "The observed divergence may reflect a different operational condition.",
    ],

    uncertainties: [
      "The available evidence does not resolve every operational variable.",
    ],

    unresolvedConcerns: [
      "The adversarial challenge identifies a material unresolved concern.",
    ],

    causalConclusion:
      "UNKNOWN" as const,
  };
}

describe(
  "RXEvidenceBoundedIntelligenceBriefSchema",
  () => {
    it(
      "accepts a structurally valid evidence-bounded intelligence brief",
      () => {
        const result =
          RXEvidenceBoundedIntelligenceBriefSchema
            .safeParse(
              createValidBrief()
            );

        expect(result.success)
          .toBe(true);
      }
    );

    it(
      "accepts empty structural arrays",
      () => {
        const result =
          RXEvidenceBoundedIntelligenceBriefSchema
            .safeParse({
              ...createValidBrief(),

              evidenceReferences: [],
              alternativeExplanations: [],
              uncertainties: [],
              unresolvedConcerns: [],
            });

        expect(result.success)
          .toBe(true);
      }
    );

    it.each([
      "caseId",
      "planId",
      "briefId",
      "hypothesisId",
      "challengeId",
    ] as const)(
      "rejects an empty %s",
      (field) => {
        const result =
          RXEvidenceBoundedIntelligenceBriefSchema
            .safeParse({
              ...createValidBrief(),

              [field]:
                "",
            });

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects an empty executive summary after trimming",
      () => {
        const result =
          RXEvidenceBoundedIntelligenceBriefSchema
            .safeParse({
              ...createValidBrief(),

              executiveSummary:
                "   ",
            });

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects an empty evidenceId",
      () => {
        const brief =
          createValidBrief();

        const result =
          RXEvidenceBoundedIntelligenceBriefSchema
            .safeParse({
              ...brief,

              evidenceReferences: [
                {
                  ...brief.evidenceReferences[0],

                  evidenceId:
                    "",
                },
              ],
            });

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects an empty requestId",
      () => {
        const brief =
          createValidBrief();

        const result =
          RXEvidenceBoundedIntelligenceBriefSchema
            .safeParse({
              ...brief,

              evidenceReferences: [
                {
                  ...brief.evidenceReferences[0],

                  requestId:
                    "",
                },
              ],
            });

        expect(result.success)
          .toBe(false);
      }
    );

    it.each([
      "alternativeExplanations",
      "uncertainties",
      "unresolvedConcerns",
    ] as const)(
      "rejects an empty narrative in %s",
      (field) => {
        const result =
          RXEvidenceBoundedIntelligenceBriefSchema
            .safeParse({
              ...createValidBrief(),

              [field]: [
                "   ",
              ],
            });

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects a causal conclusion other than UNKNOWN",
      () => {
        const result =
          RXEvidenceBoundedIntelligenceBriefSchema
            .safeParse({
              ...createValidBrief(),

              causalConclusion:
                "ESTABLISHED",
            });

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects extra top-level fields",
      () => {
        const result =
          RXEvidenceBoundedIntelligenceBriefSchema
            .safeParse({
              ...createValidBrief(),

              confidence:
                0.95,
            });

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects extra evidence-reference fields",
      () => {
        const brief =
          createValidBrief();

        const result =
          RXEvidenceBoundedIntelligenceBriefSchema
            .safeParse({
              ...brief,

              evidenceReferences: [
                {
                  ...brief.evidenceReferences[0],

                  source:
                    "UNTRUSTED",
                },
              ],
            });

        expect(result.success)
          .toBe(false);
      }
    );
  }
);
