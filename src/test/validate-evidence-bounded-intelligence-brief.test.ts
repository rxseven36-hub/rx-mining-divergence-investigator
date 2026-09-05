import {
  describe,
  expect,
  it,
} from "vitest";

import {
  validateEvidenceBoundedIntelligenceBrief,
} from "../intelligence/synthesis/validate-evidence-bounded-intelligence-brief";

import type {
  RXIntelligenceEvidencePack,
} from "../intelligence/context/intelligence-evidence-pack";

import type {
  RXEvidenceBoundedHypothesis,
} from "../intelligence/hypothesis/evidence-bounded-hypothesis";

import type {
  RXEvidenceBoundedHypothesisChallenge,
} from "../intelligence/hypothesis/evidence-bounded-hypothesis-challenge";

function createPack():
  RXIntelligenceEvidencePack {
  return {
    planId:
      "PLAN-017N",

    caseId:
      "CASE-017N",

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
      "CASE-017N",

    planId:
      "PLAN-017N",

    hypothesisId:
      "HYPOTHESIS-017N",

    statement:
      "A bounded interpretation of the admitted evidence.",

    supportingEvidence: [
      {
        evidenceId:
          "EVIDENCE-001",

        requestId:
          "REQUEST-001",
      },
    ],

    counterEvidence: [],

    alternativeExplanations: [
      "Another operational explanation remains plausible.",
    ],

    uncertainties: [
      "Material uncertainty remains.",
    ],

    causalConclusion:
      "UNKNOWN",
  };
}

function createChallenge():
  RXEvidenceBoundedHypothesisChallenge {
  return {
    caseId:
      "CASE-017N",

    planId:
      "PLAN-017N",

    hypothesisId:
      "HYPOTHESIS-017N",

    challengeId:
      "CHALLENGE-017N",

    critique:
      "The hypothesis remains vulnerable to counter-evidence.",

    challengingEvidence: [
      {
        evidenceId:
          "EVIDENCE-002",

        requestId:
          "REQUEST-002",
      },
    ],

    unresolvedConcerns: [
      "The observed divergence remains unresolved.",
    ],

    causalConclusion:
      "UNKNOWN",
  };
}

function createBrief() {
  return {
    caseId:
      "CASE-017N",

    planId:
      "PLAN-017N",

    briefId:
      "BRIEF-017N",

    hypothesisId:
      "HYPOTHESIS-017N",

    challengeId:
      "CHALLENGE-017N",

    executiveSummary:
      "The validated reasoning supports a bounded interpretation while the adversarial challenge remains material.",

    evidenceReferences: [
      {
        evidenceId:
          "EVIDENCE-001",

        requestId:
          "REQUEST-001",
      },
      {
        evidenceId:
          "EVIDENCE-002",

        requestId:
          "REQUEST-002",
      },
    ],

    alternativeExplanations: [
      "Another operational explanation remains plausible.",
    ],

    uncertainties: [
      "Material uncertainty remains.",
    ],

    unresolvedConcerns: [
      "The observed divergence remains unresolved.",
    ],

    causalConclusion:
      "UNKNOWN" as const,
  };
}

describe(
  "validateEvidenceBoundedIntelligenceBrief",
  () => {
    it(
      "accepts a brief bound to the validated reasoning chain",
      () => {
        const brief =
          createBrief();

        const result =
          validateEvidenceBoundedIntelligenceBrief(
            brief,
            createHypothesis(),
            createChallenge(),
            createPack()
          );

        expect(result)
          .toEqual({
            valid: true,
            brief,
            issues: [],
          });
      }
    );

    it(
      "rejects structurally invalid output",
      () => {
        const result =
          validateEvidenceBoundedIntelligenceBrief(
            {
              ...createBrief(),
              executiveSummary:
                "   ",
            },
            createHypothesis(),
            createChallenge(),
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            brief: null,
            issues: [
              "INVALID_OUTPUT",
            ],
          });
      }
    );

    it(
      "rejects case, plan, hypothesis, and challenge mismatches in deterministic order",
      () => {
        const result =
          validateEvidenceBoundedIntelligenceBrief(
            {
              ...createBrief(),
              caseId:
                "CASE-WRONG",
              planId:
                "PLAN-WRONG",
              hypothesisId:
                "HYPOTHESIS-WRONG",
              challengeId:
                "CHALLENGE-WRONG",
            },
            createHypothesis(),
            createChallenge(),
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            brief: null,
            issues: [
              "CASE_MISMATCH",
              "PLAN_MISMATCH",
              "HYPOTHESIS_MISMATCH",
              "CHALLENGE_MISMATCH",
            ],
          });
      }
    );

    it(
      "rejects an unknown evidence identity",
      () => {
        const result =
          validateEvidenceBoundedIntelligenceBrief(
            {
              ...createBrief(),
              evidenceReferences: [
                {
                  evidenceId:
                    "EVIDENCE-UNKNOWN",
                  requestId:
                    "REQUEST-UNKNOWN",
                },
              ],
            },
            createHypothesis(),
            createChallenge(),
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            brief: null,
            issues: [
              "UNKNOWN_EVIDENCE",
            ],
          });
      }
    );

    it(
      "rejects a request lineage mismatch",
      () => {
        const result =
          validateEvidenceBoundedIntelligenceBrief(
            {
              ...createBrief(),
              evidenceReferences: [
                {
                  evidenceId:
                    "EVIDENCE-001",
                  requestId:
                    "REQUEST-WRONG",
                },
              ],
            },
            createHypothesis(),
            createChallenge(),
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            brief: null,
            issues: [
              "EVIDENCE_REQUEST_MISMATCH",
            ],
          });
      }
    );

    it(
      "rejects canonical evidence outside the validated reasoning chain",
      () => {
        const result =
          validateEvidenceBoundedIntelligenceBrief(
            {
              ...createBrief(),
              evidenceReferences: [
                {
                  evidenceId:
                    "EVIDENCE-003",
                  requestId:
                    "REQUEST-003",
                },
              ],
            },
            createHypothesis(),
            createChallenge(),
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            brief: null,
            issues: [
              "EVIDENCE_OUTSIDE_REASONING_CHAIN",
            ],
          });
      }
    );

    it(
      "rejects duplicate brief evidence references",
      () => {
        const reference = {
          evidenceId:
            "EVIDENCE-001",
          requestId:
            "REQUEST-001",
        };

        const result =
          validateEvidenceBoundedIntelligenceBrief(
            {
              ...createBrief(),
              evidenceReferences: [
                reference,
                reference,
              ],
            },
            createHypothesis(),
            createChallenge(),
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            brief: null,
            issues: [
              "DUPLICATE_EVIDENCE_REFERENCE",
            ],
          });
      }
    );

    it(
      "accepts an empty brief evidence-reference set",
      () => {
        const brief = {
          ...createBrief(),
          evidenceReferences: [],
        };

        const result =
          validateEvidenceBoundedIntelligenceBrief(
            brief,
            createHypothesis(),
            createChallenge(),
            createPack()
          );

        expect(result)
          .toEqual({
            valid: true,
            brief,
            issues: [],
          });
      }
    );

    it(
      "aggregates independent issues in canonical order",
      () => {
        const result =
          validateEvidenceBoundedIntelligenceBrief(
            {
              ...createBrief(),

              caseId:
                "CASE-WRONG",

              planId:
                "PLAN-WRONG",

              hypothesisId:
                "HYPOTHESIS-WRONG",

              challengeId:
                "CHALLENGE-WRONG",

              evidenceReferences: [
                {
                  evidenceId:
                    "EVIDENCE-UNKNOWN",
                  requestId:
                    "REQUEST-UNKNOWN",
                },
                {
                  evidenceId:
                    "EVIDENCE-001",
                  requestId:
                    "REQUEST-WRONG",
                },
                {
                  evidenceId:
                    "EVIDENCE-003",
                  requestId:
                    "REQUEST-003",
                },
                {
                  evidenceId:
                    "EVIDENCE-001",
                  requestId:
                    "REQUEST-001",
                },
                {
                  evidenceId:
                    "EVIDENCE-001",
                  requestId:
                    "REQUEST-001",
                },
              ],
            },
            createHypothesis(),
            createChallenge(),
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            brief: null,
            issues: [
              "CASE_MISMATCH",
              "PLAN_MISMATCH",
              "HYPOTHESIS_MISMATCH",
              "CHALLENGE_MISMATCH",
              "UNKNOWN_EVIDENCE",
              "EVIDENCE_REQUEST_MISMATCH",
              "EVIDENCE_OUTSIDE_REASONING_CHAIN",
              "DUPLICATE_EVIDENCE_REFERENCE",
            ],
          });
      }
    );
  }
);
