import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXIntelligenceEvidencePack,
} from "../intelligence/context/intelligence-evidence-pack";

import type {
  RXEvidenceBoundedHypothesis,
} from "../intelligence/hypothesis/evidence-bounded-hypothesis";

import {
  validateEvidenceBoundedHypothesisChallenge,
} from "../intelligence/hypothesis/validate-evidence-bounded-hypothesis-challenge";

function createPack():
  RXIntelligenceEvidencePack {
  return {
    planId:
      "PLAN-001",

    caseId:
      "CASE-001",

    evidence: [
      {
        evidenceId:
          "EVIDENCE-001",

        requestId:
          "REQUEST-001",

        companyId:
          "COMPANY-001",

        source:
          "SECTORS",

        sourceReference:
          "source:first",

        truthClass:
          "SOURCE_FACT",

        description:
          "First company evidence",
      },

      {
        evidenceId:
          "EVIDENCE-002",

        requestId:
          "REQUEST-002",

        companyId:
          "COMPANY-002",

        source:
          "SECTORS",

        sourceReference:
          "source:second",

        truthClass:
          "SOURCE_FACT",

        description:
          "Second company evidence",
      },

      {
        evidenceId:
          "EVIDENCE-003",

        requestId:
          "REQUEST-003",

        companyId:
          null,

        source:
          "SECTORS",

        sourceReference:
          "source:shared",

        truthClass:
          "SOURCE_FACT",

        description:
          "Shared evidence",
      },
    ],

    causalConclusion:
      "UNKNOWN",
  };
}

function createHypothesis():
  RXEvidenceBoundedHypothesis {
  return {
    caseId:
      "CASE-001",

    planId:
      "PLAN-001",

    hypothesisId:
      "HYPOTHESIS-001",

    statement:
      "Operational evidence may explain the observed divergence.",

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
      "Commodity conditions may also contribute.",
    ],

    uncertainties: [
      "The available evidence does not establish causality.",
    ],

    causalConclusion:
      "UNKNOWN",
  };
}

function createCandidate() {
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
      "The hypothesis does not fully account for the counter-evidence.",

    challengingEvidence: [
      {
        evidenceId:
          "EVIDENCE-002",

        requestId:
          "REQUEST-002",
      },
    ],

    unresolvedConcerns: [
      "Another explanation remains possible.",
    ],

    causalConclusion:
      "UNKNOWN" as const,
  };
}

describe(
  "validateEvidenceBoundedHypothesisChallenge",
  () => {
    it(
      "accepts a structurally and relationally valid challenge",
      () => {
        const result =
          validateEvidenceBoundedHypothesisChallenge(
            createCandidate(),
            createHypothesis(),
            createPack()
          );

        expect(result.valid)
          .toBe(true);

        if (!result.valid) {
          throw new Error(
            "Expected valid challenge."
          );
        }

        expect(result.issues)
          .toEqual([]);

        expect(result.challenge)
          .toEqual(
            createCandidate()
          );
      }
    );

    it(
      "rejects structurally invalid output before relationship validation",
      () => {
        const result =
          validateEvidenceBoundedHypothesisChallenge(
            {
              ...createCandidate(),

              causalConclusion:
                "ESTABLISHED",
            },
            createHypothesis(),
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            challenge: null,
            issues: [
              "INVALID_OUTPUT",
            ],
          });
      }
    );

    it(
      "reports case plan and hypothesis mismatches in deterministic order",
      () => {
        const result =
          validateEvidenceBoundedHypothesisChallenge(
            {
              ...createCandidate(),

              caseId:
                "WRONG-CASE",

              planId:
                "WRONG-PLAN",

              hypothesisId:
                "WRONG-HYPOTHESIS",
            },
            createHypothesis(),
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            challenge: null,
            issues: [
              "CASE_MISMATCH",
              "PLAN_MISMATCH",
              "HYPOTHESIS_MISMATCH",
            ],
          });
      }
    );

    it(
      "rejects evidence that does not exist in the exact pack",
      () => {
        const result =
          validateEvidenceBoundedHypothesisChallenge(
            {
              ...createCandidate(),

              challengingEvidence: [
                {
                  evidenceId:
                    "UNKNOWN-EVIDENCE",

                  requestId:
                    "REQUEST-002",
                },
              ],
            },
            createHypothesis(),
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            challenge: null,
            issues: [
              "UNKNOWN_EVIDENCE",
            ],
          });
      }
    );

    it(
      "rejects request lineage that does not match canonical evidence",
      () => {
        const result =
          validateEvidenceBoundedHypothesisChallenge(
            {
              ...createCandidate(),

              challengingEvidence: [
                {
                  evidenceId:
                    "EVIDENCE-002",

                  requestId:
                    "WRONG-REQUEST",
                },
              ],
            },
            createHypothesis(),
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            challenge: null,
            issues: [
              "EVIDENCE_REQUEST_MISMATCH",
            ],
          });
      }
    );

    it(
      "rejects duplicate exact challenge evidence references",
      () => {
        const reference = {
          evidenceId:
            "EVIDENCE-002",

          requestId:
            "REQUEST-002",
        };

        const result =
          validateEvidenceBoundedHypothesisChallenge(
            {
              ...createCandidate(),

              challengingEvidence: [
                reference,
                reference,
              ],
            },
            createHypothesis(),
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            challenge: null,
            issues: [
              "DUPLICATE_EVIDENCE_REFERENCE",
            ],
          });
      }
    );

    it(
      "aggregates independent issues in canonical order",
      () => {
        const reference = {
          evidenceId:
            "EVIDENCE-001",

          requestId:
            "WRONG-REQUEST",
        };

        const result =
          validateEvidenceBoundedHypothesisChallenge(
            {
              ...createCandidate(),

              caseId:
                "WRONG-CASE",

              planId:
                "WRONG-PLAN",

              hypothesisId:
                "WRONG-HYPOTHESIS",

              challengingEvidence: [
                {
                  evidenceId:
                    "UNKNOWN-EVIDENCE",

                  requestId:
                    "UNKNOWN-REQUEST",
                },
                reference,
                reference,
              ],
            },
            createHypothesis(),
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            challenge: null,
            issues: [
              "CASE_MISMATCH",
              "PLAN_MISMATCH",
              "HYPOTHESIS_MISMATCH",
              "UNKNOWN_EVIDENCE",
              "EVIDENCE_REQUEST_MISMATCH",
              "DUPLICATE_EVIDENCE_REFERENCE",
            ],
          });
      }
    );

    it(
      "accepts a shared evidence reference",
      () => {
        const result =
          validateEvidenceBoundedHypothesisChallenge(
            {
              ...createCandidate(),

              challengingEvidence: [
                {
                  evidenceId:
                    "EVIDENCE-003",

                  requestId:
                    "REQUEST-003",
                },
              ],
            },
            createHypothesis(),
            createPack()
          );

        expect(result.valid)
          .toBe(true);
      }
    );

    it(
      "accepts a structurally valid challenge with no evidence references",
      () => {
        const result =
          validateEvidenceBoundedHypothesisChallenge(
            {
              ...createCandidate(),

              challengingEvidence:
                [],
            },
            createHypothesis(),
            createPack()
          );

        expect(result.valid)
          .toBe(true);
      }
    );

    it(
      "resolves duplicate evidence ids by exact request lineage without silent overwrite",
      () => {
        const pack =
          createPack();

        pack.evidence.push({
          evidenceId:
            "EVIDENCE-002",

          requestId:
            "REQUEST-SHARED",

          companyId:
            null,

          source:
            "SECTORS",

          sourceReference:
            "source:duplicate-id",

          truthClass:
            "SOURCE_FACT",

          description:
            "Same evidence id with distinct request lineage.",
        });

        const result =
          validateEvidenceBoundedHypothesisChallenge(
            {
              ...createCandidate(),

              challengingEvidence: [
                {
                  evidenceId:
                    "EVIDENCE-002",

                  requestId:
                    "REQUEST-SHARED",
                },
              ],
            },
            createHypothesis(),
            pack
          );

        expect(result.valid)
          .toBe(true);
      }
    );
  }
);
