import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXEvidenceCollectionResult,
} from "../investigation/evidence-collection";

import type {
  RXAdmittedPeerInvestigationEvidence,
  RXAdmittedPeerInvestigationEvidenceItem,
} from "../investigation/extract-admitted-peer-investigation-evidence";

import type {
  RXPeerInvestigationTargetContexts,
} from "../investigation/resolve-peer-investigation-target-contexts";

import {
  bindAdmittedPeerInvestigationEvidenceContexts,
} from "../investigation/bind-admitted-peer-investigation-evidence-contexts";

function createCollection(
  requestId:
    string
): RXEvidenceCollectionResult {
  return {
    requestId,

    requirementId:
      `REQUIREMENT-${requestId}`,

    capability:
      "MINING_OPERATIONAL_CONTEXT",

    status:
      "AVAILABLE",

    evidence: [
      {
        evidenceId:
          `EVIDENCE-${requestId}`,

        source:
          "SECTORS",

        sourceReference:
          `sectors:test:${requestId}`,

        truthClass:
          "SOURCE_FACT",

        description:
          `Evidence for ${requestId}`,
      },
    ],

    issues: [],

    causalConclusion:
      "UNKNOWN",
  };
}

function createContexts():
  RXPeerInvestigationTargetContexts {
  return {
    firstCompany: {
      companyId:
        "COMPANY-FIRST",

      sectorsSlug:
        "company-first",

      ticker:
        "FIRST",

      commodity:
        "COAL",

      period: {
        kind:
          "YEAR",

        year:
          2024,
      },
    },

    secondCompany: {
      companyId:
        "COMPANY-SECOND",

      sectorsSlug:
        "company-second",

      ticker:
        "SECOND",

      commodity:
        "COAL",

      period: {
        kind:
          "YEAR",

        year:
          2024,
      },
    },

    shared: {
      commodity:
        "COAL",

      period: {
        kind:
          "YEAR",

        year:
          2024,
      },
    },
  } as RXPeerInvestigationTargetContexts;
}

function createItem(
  requestId:
    string,
  target:
    RXAdmittedPeerInvestigationEvidenceItem["target"],
  companyId:
    string | null
): RXAdmittedPeerInvestigationEvidenceItem {
  return {
    requestId,

    target,

    companyId,

    sourceReference:
      `sectors:peer:${requestId}`,

    collection:
      createCollection(
        requestId
      ),
  };
}

function createAdmitted(
  evidence:
    RXAdmittedPeerInvestigationEvidenceItem[]
): RXAdmittedPeerInvestigationEvidence {
  return {
    planId:
      "PLAN-016N",

    caseId:
      "CASE-016N",

    evidence,

    admittedCount:
      evidence.length,

    causalConclusion:
      "UNKNOWN",
  };
}

describe(
  "bindAdmittedPeerInvestigationEvidenceContexts",
  () => {
    it(
      "binds first-company evidence to the canonical first-company context",
      () => {
        const result =
          bindAdmittedPeerInvestigationEvidenceContexts(
            createAdmitted([
              createItem(
                "REQUEST-FIRST",
                "FIRST_COMPANY",
                "COMPANY-FIRST"
              ),
            ]),
            createContexts()
          );

        expect(
          result.status
        ).toBe(
          "BOUND"
        );

        if (
          result.status !==
          "BOUND"
        ) {
          throw new Error(
            "Expected bound peer evidence"
          );
        }

        expect(
          result.evidence[0]
        ).toMatchObject({
          requestId:
            "REQUEST-FIRST",

          target:
            "FIRST_COMPANY",

          companyId:
            "COMPANY-FIRST",

          commodity:
            "COAL",

          period: {
            kind:
              "YEAR",

            year:
              2024,
          },
        });
      }
    );

    it(
      "binds second-company evidence to the canonical second-company context",
      () => {
        const result =
          bindAdmittedPeerInvestigationEvidenceContexts(
            createAdmitted([
              createItem(
                "REQUEST-SECOND",
                "SECOND_COMPANY",
                "COMPANY-SECOND"
              ),
            ]),
            createContexts()
          );

        expect(
          result.status
        ).toBe(
          "BOUND"
        );

        if (
          result.status !==
          "BOUND"
        ) {
          throw new Error(
            "Expected bound peer evidence"
          );
        }

        expect(
          result.evidence[0]
        ).toMatchObject({
          target:
            "SECOND_COMPANY",

          companyId:
            "COMPANY-SECOND",

          commodity:
            "COAL",
        });
      }
    );

    it(
      "keeps shared evidence deliberately companyless while binding shared canonical context",
      () => {
        const result =
          bindAdmittedPeerInvestigationEvidenceContexts(
            createAdmitted([
              createItem(
                "REQUEST-SHARED",
                "SHARED",
                null
              ),
            ]),
            createContexts()
          );

        expect(
          result.status
        ).toBe(
          "BOUND"
        );

        if (
          result.status !==
          "BOUND"
        ) {
          throw new Error(
            "Expected bound peer evidence"
          );
        }

        expect(
          result.evidence[0]
        ).toMatchObject({
          target:
            "SHARED",

          companyId:
            null,

          commodity:
            "COAL",

          period: {
            kind:
              "YEAR",

            year:
              2024,
          },
        });
      }
    );

    it(
      "preserves admitted evidence order",
      () => {
        const result =
          bindAdmittedPeerInvestigationEvidenceContexts(
            createAdmitted([
              createItem(
                "REQUEST-FIRST",
                "FIRST_COMPANY",
                "COMPANY-FIRST"
              ),

              createItem(
                "REQUEST-SHARED",
                "SHARED",
                null
              ),

              createItem(
                "REQUEST-SECOND",
                "SECOND_COMPANY",
                "COMPANY-SECOND"
              ),
            ]),
            createContexts()
          );

        expect(
          result.status
        ).toBe(
          "BOUND"
        );

        if (
          result.status !==
          "BOUND"
        ) {
          throw new Error(
            "Expected bound peer evidence"
          );
        }

        expect(
          result.evidence.map(
            (item) =>
              item.requestId
          )
        ).toEqual([
          "REQUEST-FIRST",
          "REQUEST-SHARED",
          "REQUEST-SECOND",
        ]);
      }
    );

    it(
      "preserves the exact already-admitted collection reference",
      () => {
        const item =
          createItem(
            "REQUEST-FIRST",
            "FIRST_COMPANY",
            "COMPANY-FIRST"
          );

        const result =
          bindAdmittedPeerInvestigationEvidenceContexts(
            createAdmitted([
              item,
            ]),
            createContexts()
          );

        expect(
          result.status
        ).toBe(
          "BOUND"
        );

        if (
          result.status !==
          "BOUND"
        ) {
          throw new Error(
            "Expected bound peer evidence"
          );
        }

        expect(
          result.evidence[0]
            ?.collection
        ).toBe(
          item.collection
        );
      }
    );

    it(
      "rejects first-company identity mismatch instead of repairing it",
      () => {
        const result =
          bindAdmittedPeerInvestigationEvidenceContexts(
            createAdmitted([
              createItem(
                "REQUEST-FIRST",
                "FIRST_COMPANY",
                "COMPANY-WRONG"
              ),
            ]),
            createContexts()
          );

        expect(
          result
        ).toEqual({
          status:
            "REJECTED",

          planId:
            "PLAN-016N",

          caseId:
            "CASE-016N",

          evidence: [],

          boundCount:
            0,

          rejections: [
            {
              requestId:
                "REQUEST-FIRST",

              target:
                "FIRST_COMPANY",

              issue:
                "FIRST_COMPANY_ID_MISMATCH",
            },
          ],

          causalConclusion:
            "UNKNOWN",
        });
      }
    );

    it(
      "rejects second-company identity mismatch instead of repairing it",
      () => {
        const result =
          bindAdmittedPeerInvestigationEvidenceContexts(
            createAdmitted([
              createItem(
                "REQUEST-SECOND",
                "SECOND_COMPANY",
                "COMPANY-WRONG"
              ),
            ]),
            createContexts()
          );

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.rejections
        ).toEqual([
          {
            requestId:
              "REQUEST-SECOND",

            target:
              "SECOND_COMPANY",

            issue:
              "SECOND_COMPANY_ID_MISMATCH",
          },
        ]);
      }
    );

    it(
      "rejects shared evidence that unexpectedly carries company identity",
      () => {
        const result =
          bindAdmittedPeerInvestigationEvidenceContexts(
            createAdmitted([
              createItem(
                "REQUEST-SHARED",
                "SHARED",
                "COMPANY-FIRST"
              ),
            ]),
            createContexts()
          );

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.rejections
        ).toEqual([
          {
            requestId:
              "REQUEST-SHARED",

            target:
              "SHARED",

            issue:
              "SHARED_COMPANY_ID_PRESENT",
          },
        ]);
      }
    );

    it(
      "rejects the complete binding when any admitted item has corrupted identity",
      () => {
        const result =
          bindAdmittedPeerInvestigationEvidenceContexts(
            createAdmitted([
              createItem(
                "REQUEST-FIRST",
                "FIRST_COMPANY",
                "COMPANY-FIRST"
              ),

              createItem(
                "REQUEST-SECOND",
                "SECOND_COMPANY",
                "COMPANY-WRONG"
              ),
            ]),
            createContexts()
          );

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.evidence
        ).toEqual([]);

        expect(
          result.boundCount
        ).toBe(
          0
        );
      }
    );

    it(
      "derives boundCount from actually bound evidence rather than upstream admittedCount",
      () => {
        const admitted =
          createAdmitted([
            createItem(
              "REQUEST-FIRST",
              "FIRST_COMPANY",
              "COMPANY-FIRST"
            ),

            createItem(
              "REQUEST-SHARED",
              "SHARED",
              null
            ),
          ]);

        admitted.admittedCount =
          999;

        const result =
          bindAdmittedPeerInvestigationEvidenceContexts(
            admitted,
            createContexts()
          );

        expect(
          result.status
        ).toBe(
          "BOUND"
        );

        expect(
          result.boundCount
        ).toBe(
          2
        );
      }
    );

    it(
      "preserves plan and case identity and never manufactures causality",
      () => {
        const result =
          bindAdmittedPeerInvestigationEvidenceContexts(
            createAdmitted([]),
            createContexts()
          );

        expect(
          result
        ).toMatchObject({
          status:
            "BOUND",

          planId:
            "PLAN-016N",

          caseId:
            "CASE-016N",

          evidence: [],

          boundCount:
            0,

          rejections: [],

          causalConclusion:
            "UNKNOWN",
        });
      }
    );

    it(
      "does not mutate admitted evidence or canonical target contexts",
      () => {
        const admitted =
          createAdmitted([
            createItem(
              "REQUEST-FIRST",
              "FIRST_COMPANY",
              "COMPANY-FIRST"
            ),
          ]);

        const contexts =
          createContexts();

        const admittedBefore =
          structuredClone(
            admitted
          );

        const contextsBefore =
          structuredClone(
            contexts
          );

        bindAdmittedPeerInvestigationEvidenceContexts(
          admitted,
          contexts
        );

        expect(
          admitted
        ).toEqual(
          admittedBefore
        );

        expect(
          contexts
        ).toEqual(
          contextsBefore
        );
      }
    );
  }
);
