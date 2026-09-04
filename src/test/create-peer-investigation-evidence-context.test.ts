import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXContextBoundPeerInvestigationEvidence,
  RXContextBoundPeerInvestigationEvidenceItem,
} from "../investigation/bind-admitted-peer-investigation-evidence-contexts";

import type {
  RXEvidenceCollectionResult,
} from "../investigation/evidence-collection";

import {
  createPeerInvestigationEvidenceContext,
} from "../investigation/create-peer-investigation-evidence-context";

function createCollection(
  sourceReference:
    string
): RXEvidenceCollectionResult {
  return {
    requestId:
      `REQUEST-${sourceReference}`,

    requirementId:
      `REQUIREMENT-${sourceReference}`,

    capability:
      "MINING_OPERATIONAL_CONTEXT" as never,

    status:
      "AVAILABLE",

    evidence: [
      {
        source:
          sourceReference,

        content:
          `Evidence from ${sourceReference}`,
      },
    ] as never,

    issues: [],

    causalConclusion:
      "UNKNOWN",
  };
}

function createEvidenceItem(
  requestId:
    string,
  target:
    | "FIRST_COMPANY"
    | "SECOND_COMPANY"
    | "SHARED",
  companyId:
    string | null,
  sourceReference:
    string
): RXContextBoundPeerInvestigationEvidenceItem {
  return {
    requestId,

    target,

    companyId,

    sourceReference,

    commodity:
      "COAL",

    period: {
      kind:
        "YEAR",

      year:
        2024,
    },

    collection:
      createCollection(
        sourceReference
      ),
  };
}

function createBoundEvidence(
  evidence:
    RXContextBoundPeerInvestigationEvidenceItem[]
): RXContextBoundPeerInvestigationEvidence {
  return {
    status:
      "BOUND",

    planId:
      "PLAN-016O",

    caseId:
      "CASE-016O",

    evidence,

    boundCount:
      evidence.length,

    rejections: [],

    causalConclusion:
      "UNKNOWN",
  };
}

describe(
  "createPeerInvestigationEvidenceContext",
  () => {
    it(
      "groups first-company evidence into the first-company context",
      () => {
        const first =
          createEvidenceItem(
            "REQ-FIRST",
            "FIRST_COMPANY",
            "COMPANY-FIRST",
            "first-source"
          );

        const result =
          createPeerInvestigationEvidenceContext(
            createBoundEvidence([
              first,
            ])
          );

        expect(result.status).toBe(
          "CREATED"
        );

        if (
          result.status !==
          "CREATED"
        ) {
          throw new Error(
            "Expected created context"
          );
        }

        expect(
          result.context.firstCompany
        ).toEqual([
          first,
        ]);

        expect(
          result.context.secondCompany
        ).toEqual([]);

        expect(
          result.context.shared
        ).toEqual([]);
      }
    );

    it(
      "groups second-company evidence into the second-company context",
      () => {
        const second =
          createEvidenceItem(
            "REQ-SECOND",
            "SECOND_COMPANY",
            "COMPANY-SECOND",
            "second-source"
          );

        const result =
          createPeerInvestigationEvidenceContext(
            createBoundEvidence([
              second,
            ])
          );

        expect(result.status).toBe(
          "CREATED"
        );

        if (
          result.status !==
          "CREATED"
        ) {
          throw new Error(
            "Expected created context"
          );
        }

        expect(
          result.context.firstCompany
        ).toEqual([]);

        expect(
          result.context.secondCompany
        ).toEqual([
          second,
        ]);

        expect(
          result.context.shared
        ).toEqual([]);
      }
    );

    it(
      "groups shared evidence while preserving companyless identity",
      () => {
        const shared =
          createEvidenceItem(
            "REQ-SHARED",
            "SHARED",
            null,
            "shared-source"
          );

        const result =
          createPeerInvestigationEvidenceContext(
            createBoundEvidence([
              shared,
            ])
          );

        expect(result.status).toBe(
          "CREATED"
        );

        if (
          result.status !==
          "CREATED"
        ) {
          throw new Error(
            "Expected created context"
          );
        }

        expect(
          result.context.shared
        ).toEqual([
          shared,
        ]);

        expect(
          result.context.shared[0]
            .companyId
        ).toBeNull();
      }
    );

    it(
      "preserves evidence order independently within each canonical target",
      () => {
        const firstA =
          createEvidenceItem(
            "REQ-FIRST-A",
            "FIRST_COMPANY",
            "COMPANY-FIRST",
            "first-a"
          );

        const sharedA =
          createEvidenceItem(
            "REQ-SHARED-A",
            "SHARED",
            null,
            "shared-a"
          );

        const secondA =
          createEvidenceItem(
            "REQ-SECOND-A",
            "SECOND_COMPANY",
            "COMPANY-SECOND",
            "second-a"
          );

        const firstB =
          createEvidenceItem(
            "REQ-FIRST-B",
            "FIRST_COMPANY",
            "COMPANY-FIRST",
            "first-b"
          );

        const sharedB =
          createEvidenceItem(
            "REQ-SHARED-B",
            "SHARED",
            null,
            "shared-b"
          );

        const result =
          createPeerInvestigationEvidenceContext(
            createBoundEvidence([
              firstA,
              sharedA,
              secondA,
              firstB,
              sharedB,
            ])
          );

        expect(result.status).toBe(
          "CREATED"
        );

        if (
          result.status !==
          "CREATED"
        ) {
          throw new Error(
            "Expected created context"
          );
        }

        expect(
          result.context.firstCompany.map(
            (item) =>
              item.requestId
          )
        ).toEqual([
          "REQ-FIRST-A",
          "REQ-FIRST-B",
        ]);

        expect(
          result.context.secondCompany.map(
            (item) =>
              item.requestId
          )
        ).toEqual([
          "REQ-SECOND-A",
        ]);

        expect(
          result.context.shared.map(
            (item) =>
              item.requestId
          )
        ).toEqual([
          "REQ-SHARED-A",
          "REQ-SHARED-B",
        ]);
      }
    );

    it(
      "preserves exact canonical evidence item and collection references",
      () => {
        const first =
          createEvidenceItem(
            "REQ-FIRST",
            "FIRST_COMPANY",
            "COMPANY-FIRST",
            "first-source"
          );

        const result =
          createPeerInvestigationEvidenceContext(
            createBoundEvidence([
              first,
            ])
          );

        expect(result.status).toBe(
          "CREATED"
        );

        if (
          result.status !==
          "CREATED"
        ) {
          throw new Error(
            "Expected created context"
          );
        }

        expect(
          result.context.firstCompany[0]
        ).toBe(first);

        expect(
          result.context.firstCompany[0]
            .collection
        ).toBe(
          first.collection
        );
      }
    );

    it(
      "rejects evidence that did not pass canonical binding",
      () => {
        const rejected:
          RXContextBoundPeerInvestigationEvidence =
          {
            status:
              "REJECTED",

            planId:
              "PLAN-016O",

            caseId:
              "CASE-016O",

            evidence: [],

            boundCount: 0,

            rejections: [
              {
                requestId:
                  "REQ-BAD",

                target:
                  "FIRST_COMPANY",

                issue:
                  "FIRST_COMPANY_ID_MISMATCH",
              },
            ],

            causalConclusion:
              "UNKNOWN",
          };

        const result =
          createPeerInvestigationEvidenceContext(
            rejected
          );

        expect(result).toEqual({
          status:
            "REJECTED",

          context:
            null,

          issue:
            "PEER_EVIDENCE_CONTEXT_NOT_BOUND",
        });
      }
    );

    it(
      "creates an empty deterministic context when bound evidence is empty",
      () => {
        const result =
          createPeerInvestigationEvidenceContext(
            createBoundEvidence([])
          );

        expect(result).toEqual({
          status:
            "CREATED",

          context: {
            planId:
              "PLAN-016O",

            caseId:
              "CASE-016O",

            firstCompany: [],

            secondCompany: [],

            shared: [],

            evidenceCount: 0,

            causalConclusion:
              "UNKNOWN",
          },

          issue:
            null,
        });
      }
    );

    it(
      "derives evidenceCount from actual grouped evidence rather than upstream boundCount",
      () => {
        const first =
          createEvidenceItem(
            "REQ-FIRST",
            "FIRST_COMPANY",
            "COMPANY-FIRST",
            "first-source"
          );

        const shared =
          createEvidenceItem(
            "REQ-SHARED",
            "SHARED",
            null,
            "shared-source"
          );

        const bound =
          createBoundEvidence([
            first,
            shared,
          ]);

        (
          bound as {
            boundCount:
              number;
          }
        ).boundCount =
          999;

        const result =
          createPeerInvestigationEvidenceContext(
            bound
          );

        expect(result.status).toBe(
          "CREATED"
        );

        if (
          result.status !==
          "CREATED"
        ) {
          throw new Error(
            "Expected created context"
          );
        }

        expect(
          result.context.evidenceCount
        ).toBe(2);
      }
    );

    it(
      "preserves plan and case identity and keeps causal conclusion unknown",
      () => {
        const result =
          createPeerInvestigationEvidenceContext(
            createBoundEvidence([])
          );

        expect(result.status).toBe(
          "CREATED"
        );

        if (
          result.status !==
          "CREATED"
        ) {
          throw new Error(
            "Expected created context"
          );
        }

        expect(
          result.context.planId
        ).toBe(
          "PLAN-016O"
        );

        expect(
          result.context.caseId
        ).toBe(
          "CASE-016O"
        );

        expect(
          result.context
            .causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "does not mutate canonically bound evidence",
      () => {
        const first =
          createEvidenceItem(
            "REQ-FIRST",
            "FIRST_COMPANY",
            "COMPANY-FIRST",
            "first-source"
          );

        const shared =
          createEvidenceItem(
            "REQ-SHARED",
            "SHARED",
            null,
            "shared-source"
          );

        const bound =
          createBoundEvidence([
            first,
            shared,
          ]);

        const snapshot =
          structuredClone(
            bound
          );

        createPeerInvestigationEvidenceContext(
          bound
        );

        expect(bound).toEqual(
          snapshot
        );
      }
    );
  }
);
