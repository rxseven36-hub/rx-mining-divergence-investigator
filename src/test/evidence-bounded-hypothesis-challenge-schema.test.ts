import {
  describe,
  expect,
  it,
} from "vitest";

import {
  RXEvidenceBoundedHypothesisChallengeSchema,
} from "../intelligence/hypothesis/evidence-bounded-hypothesis-challenge-schema";

function createValidCandidate() {
  return {
    caseId:
      "CASE-001",

    planId:
      "PLAN-001",

    hypothesisId:
      "HYPOTHESIS-001",

    challengeId:
      "CHALLENGE-001",

    critique:
      "The hypothesis does not fully account for the available counter-pressure.",

    challengingEvidence: [
      {
        evidenceId:
          "EVIDENCE-002",

        requestId:
          "REQUEST-002",
      },
    ],

    unresolvedConcerns: [
      "The observed divergence may still have another explanation.",
    ],

    causalConclusion:
      "UNKNOWN" as const,
  };
}

describe(
  "RXEvidenceBoundedHypothesisChallengeSchema",
  () => {
    it(
      "accepts a structurally valid challenge",
      () => {
        const result =
          RXEvidenceBoundedHypothesisChallengeSchema
            .safeParse(
              createValidCandidate()
            );

        expect(result.success)
          .toBe(true);
      }
    );

    it(
      "accepts empty challenge evidence and concern arrays",
      () => {
        const result =
          RXEvidenceBoundedHypothesisChallengeSchema
            .safeParse({
              ...createValidCandidate(),

              challengingEvidence:
                [],

              unresolvedConcerns:
                [],
            });

        expect(result.success)
          .toBe(true);
      }
    );

    it(
      "rejects an empty case id",
      () => {
        const result =
          RXEvidenceBoundedHypothesisChallengeSchema
            .safeParse({
              ...createValidCandidate(),

              caseId:
                "",
            });

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects an empty plan id",
      () => {
        const result =
          RXEvidenceBoundedHypothesisChallengeSchema
            .safeParse({
              ...createValidCandidate(),

              planId:
                "",
            });

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects an empty hypothesis id",
      () => {
        const result =
          RXEvidenceBoundedHypothesisChallengeSchema
            .safeParse({
              ...createValidCandidate(),

              hypothesisId:
                "",
            });

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects an empty challenge id",
      () => {
        const result =
          RXEvidenceBoundedHypothesisChallengeSchema
            .safeParse({
              ...createValidCandidate(),

              challengeId:
                "",
            });

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects a blank critique",
      () => {
        const result =
          RXEvidenceBoundedHypothesisChallengeSchema
            .safeParse({
              ...createValidCandidate(),

              critique:
                "   ",
            });

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects malformed challenge evidence references",
      () => {
        const result =
          RXEvidenceBoundedHypothesisChallengeSchema
            .safeParse({
              ...createValidCandidate(),

              challengingEvidence: [
                {
                  evidenceId:
                    "",
                  requestId:
                    "REQUEST-002",
                },
              ],
            });

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects blank unresolved concerns",
      () => {
        const result =
          RXEvidenceBoundedHypothesisChallengeSchema
            .safeParse({
              ...createValidCandidate(),

              unresolvedConcerns: [
                "   ",
              ],
            });

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects causal conclusions other than UNKNOWN",
      () => {
        const result =
          RXEvidenceBoundedHypothesisChallengeSchema
            .safeParse({
              ...createValidCandidate(),

              causalConclusion:
                "ESTABLISHED",
            });

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "rejects extra challenge fields",
      () => {
        const result =
          RXEvidenceBoundedHypothesisChallengeSchema
            .safeParse({
              ...createValidCandidate(),

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
        const candidate =
          createValidCandidate();

        const result =
          RXEvidenceBoundedHypothesisChallengeSchema
            .safeParse({
              ...candidate,

              challengingEvidence: [
                {
                  ...candidate
                    .challengingEvidence[0],

                  sourceReference:
                    "AI-SHOULD-NOT-ADD-THIS",
                },
              ],
            });

        expect(result.success)
          .toBe(false);
      }
    );

    it(
      "structurally accepts nonexistent evidence and unrelated identities",
      () => {
        const result =
          RXEvidenceBoundedHypothesisChallengeSchema
            .safeParse({
              ...createValidCandidate(),

              caseId:
                "UNRELATED-CASE",

              planId:
                "UNRELATED-PLAN",

              hypothesisId:
                "UNRELATED-HYPOTHESIS",

              challengingEvidence: [
                {
                  evidenceId:
                    "NONEXISTENT-EVIDENCE",

                  requestId:
                    "WRONG-REQUEST",
                },
              ],
            });

        expect(result.success)
          .toBe(true);
      }
    );
  }
);
