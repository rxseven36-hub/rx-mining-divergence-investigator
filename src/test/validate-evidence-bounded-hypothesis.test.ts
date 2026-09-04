import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXPeerIntelligenceEvidencePack,
} from "../intelligence/context/create-peer-intelligence-evidence-pack";

import {
  validateEvidenceBoundedHypothesis,
} from "../intelligence/hypothesis/validate-evidence-bounded-hypothesis";

function createPack():
  RXPeerIntelligenceEvidencePack {
  return {
    planId:
      "PLAN-001",

    caseId:
      "CASE-001",

    commodity:
      "GOLD",

    period: {
      kind:
        "RANGE",

      start:
        "2025-01-01",

      end:
        "2025-12-31",
    },

    firstCompany: [
      {
        evidenceId:
          "EVIDENCE-001",

        requestId:
          "REQUEST-001",

        target:
          "FIRST_COMPANY",

        companyId:
          "COMPANY-A",

        source:
          "SECTORS",

        sourceReference:
          "source:first",

        truthClass:
          "SOURCE_FACT",

        description:
          "First company evidence.",
      },
    ],

    secondCompany: [
      {
        evidenceId:
          "EVIDENCE-002",

        requestId:
          "REQUEST-002",

        target:
          "SECOND_COMPANY",

        companyId:
          "COMPANY-B",

        source:
          "SECTORS",

        sourceReference:
          "source:second",

        truthClass:
          "COMPUTED_FACT",

        description:
          "Second company evidence.",
      },
    ],

    shared: [
      {
        evidenceId:
          "EVIDENCE-003",

        requestId:
          "REQUEST-003",

        target:
          "SHARED",

        companyId:
          null,

        source:
          "SECTORS",

        sourceReference:
          "source:shared",

        truthClass:
          "SOURCE_FACT",

        description:
          "Shared evidence.",
      },
    ],

    evidenceCount:
      3,

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
      "UNKNOWN" as const,
  };
}

describe(
  "validateEvidenceBoundedHypothesis",
  () => {
    it(
      "accepts a structurally and relationally valid hypothesis",
      () => {
        const result =
          validateEvidenceBoundedHypothesis(
            createCandidate(),
            createPack()
          );

        expect(result.valid)
          .toBe(true);

        if (!result.valid) {
          throw new Error(
            "Expected valid hypothesis."
          );
        }

        expect(result.issues)
          .toEqual([]);

        expect(result.hypothesis)
          .toEqual(
            createCandidate()
          );
      }
    );

    it(
      "rejects structurally invalid output before relationship validation",
      () => {
        const result =
          validateEvidenceBoundedHypothesis(
            {
              ...createCandidate(),

              causalConclusion:
                "ESTABLISHED",
            },
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            hypothesis: null,
            issues: [
              "INVALID_OUTPUT",
            ],
          });
      }
    );

    it(
      "reports case and plan mismatches in deterministic order",
      () => {
        const result =
          validateEvidenceBoundedHypothesis(
            {
              ...createCandidate(),

              caseId:
                "WRONG-CASE",

              planId:
                "WRONG-PLAN",
            },
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            hypothesis: null,
            issues: [
              "CASE_MISMATCH",
              "PLAN_MISMATCH",
            ],
          });
      }
    );

    it(
      "rejects evidence that does not exist in the exact pack",
      () => {
        const candidate = {
          ...createCandidate(),

          supportingEvidence: [
            {
              evidenceId:
                "UNKNOWN-EVIDENCE",

              requestId:
                "REQUEST-001",
            },
          ],
        };

        const result =
          validateEvidenceBoundedHypothesis(
            candidate,
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            hypothesis: null,
            issues: [
              "UNKNOWN_EVIDENCE",
            ],
          });
      }
    );

    it(
      "rejects request lineage that does not match canonical evidence",
      () => {
        const candidate = {
          ...createCandidate(),

          supportingEvidence: [
            {
              evidenceId:
                "EVIDENCE-001",

              requestId:
                "WRONG-REQUEST",
            },
          ],
        };

        const result =
          validateEvidenceBoundedHypothesis(
            candidate,
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            hypothesis: null,
            issues: [
              "EVIDENCE_REQUEST_MISMATCH",
            ],
          });
      }
    );

    it(
      "rejects duplicate evidence references",
      () => {
        const candidate = {
          ...createCandidate(),

          supportingEvidence: [
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
        };

        const result =
          validateEvidenceBoundedHypothesis(
            candidate,
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            hypothesis: null,
            issues: [
              "DUPLICATE_EVIDENCE_REFERENCE",
            ],
          });
      }
    );

    it(
      "rejects evidence used as both support and counter-evidence",
      () => {
        const candidate = {
          ...createCandidate(),

          counterEvidence: [
            {
              evidenceId:
                "EVIDENCE-001",

              requestId:
                "REQUEST-001",
            },
          ],
        };

        const result =
          validateEvidenceBoundedHypothesis(
            candidate,
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            hypothesis: null,
            issues: [
              "DUPLICATE_EVIDENCE_REFERENCE",
              "CONFLICTING_EVIDENCE_REFERENCE",
            ],
          });
      }
    );

    it(
      "aggregates independent deterministic issues in canonical order",
      () => {
        const candidate = {
          ...createCandidate(),

          caseId:
            "WRONG-CASE",

          planId:
            "WRONG-PLAN",

          supportingEvidence: [
            {
              evidenceId:
                "UNKNOWN-EVIDENCE",

              requestId:
                "UNKNOWN-REQUEST",
            },
            {
              evidenceId:
                "EVIDENCE-001",

              requestId:
                "WRONG-REQUEST",
            },
            {
              evidenceId:
                "EVIDENCE-002",

              requestId:
                "REQUEST-002",
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
        };

        const result =
          validateEvidenceBoundedHypothesis(
            candidate,
            createPack()
          );

        expect(result)
          .toEqual({
            valid: false,
            hypothesis: null,
            issues: [
              "CASE_MISMATCH",
              "PLAN_MISMATCH",
              "UNKNOWN_EVIDENCE",
              "EVIDENCE_REQUEST_MISMATCH",
              "DUPLICATE_EVIDENCE_REFERENCE",
              "CONFLICTING_EVIDENCE_REFERENCE",
            ],
          });
      }
    );

    it(
      "accepts references from the shared evidence bucket",
      () => {
        const candidate = {
          ...createCandidate(),

          supportingEvidence: [
            {
              evidenceId:
                "EVIDENCE-003",

              requestId:
                "REQUEST-003",
            },
          ],

          counterEvidence: [],
        };

        const result =
          validateEvidenceBoundedHypothesis(
            candidate,
            createPack()
          );

        expect(result.valid)
          .toBe(true);
      }
    );

    it(
      "accepts a structurally valid hypothesis with no evidence references",
      () => {
        const candidate = {
          ...createCandidate(),

          supportingEvidence: [],
          counterEvidence: [],
        };

        const result =
          validateEvidenceBoundedHypothesis(
            candidate,
            createPack()
          );

        expect(result.valid)
          .toBe(true);
      }
    );
  }
);
