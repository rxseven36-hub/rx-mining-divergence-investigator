import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXContextBoundPeerInvestigationEvidenceItem,
} from "../investigation/bind-admitted-peer-investigation-evidence-contexts";

import type {
  RXPeerInvestigationEvidenceContext,
} from "../investigation/create-peer-investigation-evidence-context";

import {
  createPeerIntelligenceEvidencePack,
} from "../intelligence/context/create-peer-intelligence-evidence-pack";

function createBoundItem(
  overrides:
    Partial<RXContextBoundPeerInvestigationEvidenceItem> = {}
): RXContextBoundPeerInvestigationEvidenceItem {
  return {
    requestId:
      "REQUEST-1",

    target:
      "FIRST_COMPANY",

    companyId:
      "COMPANY-A",

    sourceReference:
      "SOURCE-REQUEST-1",

    commodity:
      "COAL" as never,

    period: {
      kind:
        "YEAR",
      year:
        2025,
    },

    collection: {
      requestId:
        "REQUEST-1",

      requirementId:
        "REQUIREMENT-1",

      capability:
        "MINING_OPERATIONAL_CONTEXT" as never,

      status:
        "AVAILABLE",

      evidence: [
        {
          evidenceId:
            "EVIDENCE-1",

          source:
            "SECTORS",

          sourceReference:
            "SOURCE-EVIDENCE-1",

          truthClass:
            "SOURCE_FACT",

          description:
            "Canonical evidence one",
        },
      ],

      issues: [],

      causalConclusion:
        "UNKNOWN",
    },

    ...overrides,
  };
}

function createContext(
  overrides:
    Partial<RXPeerInvestigationEvidenceContext> = {}
): RXPeerInvestigationEvidenceContext {
  return {
    planId:
      "PLAN-1",

    caseId:
      "CASE-1",

    firstCompany: [
      createBoundItem(),
    ],

    secondCompany: [],

    shared: [],

    evidenceCount:
      1,

    causalConclusion:
      "UNKNOWN",

    ...overrides,
  };
}

describe(
  "createPeerIntelligenceEvidencePack",
  () => {
    it(
      "projects only allowlisted evidence fields",
      () => {
        const result =
          createPeerIntelligenceEvidencePack(
            createContext()
          );

        expect(result.status)
          .toBe("CREATED");

        if (result.status !== "CREATED") {
          throw new Error(
            "Expected CREATED result"
          );
        }

        expect(
          result.pack.firstCompany
        ).toEqual([
          {
            evidenceId:
              "EVIDENCE-1",
            requestId:
              "REQUEST-1",
            target:
              "FIRST_COMPANY",
            companyId:
              "COMPANY-A",
            source:
              "SECTORS",
            sourceReference:
              "SOURCE-EVIDENCE-1",
            truthClass:
              "SOURCE_FACT",
            description:
              "Canonical evidence one",
          },
        ]);

        expect(
          Object.keys(
            result.pack.firstCompany[0]
          ).sort()
        ).toEqual([
          "companyId",
          "description",
          "evidenceId",
          "requestId",
          "source",
          "sourceReference",
          "target",
          "truthClass",
        ]);
      }
    );

    it(
      "preserves canonical peer target identity",
      () => {
        const second =
          createBoundItem({
            requestId:
              "REQUEST-2",
            target:
              "SECOND_COMPANY",
            companyId:
              "COMPANY-B",
          });

        const shared =
          createBoundItem({
            requestId:
              "REQUEST-3",
            target:
              "SHARED",
            companyId:
              null,
          });

        const result =
          createPeerIntelligenceEvidencePack(
            createContext({
              firstCompany: [],
              secondCompany: [
                second,
              ],
              shared: [
                shared,
              ],
            })
          );

        expect(result.status)
          .toBe("CREATED");

        if (result.status !== "CREATED") {
          throw new Error(
            "Expected CREATED result"
          );
        }

        expect(
          result.pack.secondCompany[0]
        ).toMatchObject({
          requestId:
            "REQUEST-2",
          target:
            "SECOND_COMPANY",
          companyId:
            "COMPANY-B",
        });

        expect(
          result.pack.shared[0]
        ).toMatchObject({
          requestId:
            "REQUEST-3",
          target:
            "SHARED",
          companyId:
            null,
        });
      }
    );

    it(
      "preserves evidence-level provenance instead of outer source reference",
      () => {
        const result =
          createPeerIntelligenceEvidencePack(
            createContext()
          );

        if (result.status !== "CREATED") {
          throw new Error(
            "Expected CREATED result"
          );
        }

        expect(
          result.pack.firstCompany[0]
            .sourceReference
        ).toBe(
          "SOURCE-EVIDENCE-1"
        );

        expect(
          result.pack.firstCompany[0]
            .sourceReference
        ).not.toBe(
          "SOURCE-REQUEST-1"
        );
      }
    );

    it(
      "flattens individual evidence while preserving collection and evidence order",
      () => {
        const item =
          createBoundItem({
            collection: {
              ...createBoundItem()
                .collection,

              evidence: [
                {
                  evidenceId:
                    "EVIDENCE-1",
                  source:
                    "SECTORS",
                  sourceReference:
                    "SOURCE-1",
                  truthClass:
                    "SOURCE_FACT",
                  description:
                    "One",
                },
                {
                  evidenceId:
                    "EVIDENCE-2",
                  source:
                    "SECTORS",
                  sourceReference:
                    "SOURCE-2",
                  truthClass:
                    "COMPUTED_FACT",
                  description:
                    "Two",
                },
              ],
            },
          });

        const secondItem =
          createBoundItem({
            requestId:
              "REQUEST-2",

            collection: {
              ...createBoundItem()
                .collection,

              requestId:
                "REQUEST-2",

              evidence: [
                {
                  evidenceId:
                    "EVIDENCE-3",
                  source:
                    "SECTORS",
                  sourceReference:
                    "SOURCE-3",
                  truthClass:
                    "SOURCE_FACT",
                  description:
                    "Three",
                },
              ],
            },
          });

        const result =
          createPeerIntelligenceEvidencePack(
            createContext({
              firstCompany: [
                item,
                secondItem,
              ],
            })
          );

        if (result.status !== "CREATED") {
          throw new Error(
            "Expected CREATED result"
          );
        }

        expect(
          result.pack.firstCompany.map(
            (item) =>
              item.evidenceId
          )
        ).toEqual([
          "EVIDENCE-1",
          "EVIDENCE-2",
          "EVIDENCE-3",
        ]);
      }
    );

    it(
      "derives evidence count from projected evidence rather than upstream collection count",
      () => {
        const item =
          createBoundItem({
            collection: {
              ...createBoundItem()
                .collection,

              evidence: [
                {
                  evidenceId:
                    "EVIDENCE-1",
                  source:
                    "SECTORS",
                  sourceReference:
                    "SOURCE-1",
                  truthClass:
                    "SOURCE_FACT",
                  description:
                    "One",
                },
                {
                  evidenceId:
                    "EVIDENCE-2",
                  source:
                    "SECTORS",
                  sourceReference:
                    "SOURCE-2",
                  truthClass:
                    "SOURCE_FACT",
                  description:
                    "Two",
                },
              ],
            },
          });

        const result =
          createPeerIntelligenceEvidencePack(
            createContext({
              firstCompany: [
                item,
              ],

              evidenceCount:
                999,
            })
          );

        if (result.status !== "CREATED") {
          throw new Error(
            "Expected CREATED result"
          );
        }

        expect(
          result.pack.evidenceCount
        ).toBe(2);
      }
    );

    it(
      "preserves canonical commodity and clones canonical period",
      () => {
        const context =
          createContext();

        const canonicalPeriod =
          context.firstCompany[0]
            .period;

        const result =
          createPeerIntelligenceEvidencePack(
            context
          );

        if (result.status !== "CREATED") {
          throw new Error(
            "Expected CREATED result"
          );
        }

        expect(result.pack.commodity)
          .toBe(
            context.firstCompany[0]
              .commodity
          );

        expect(result.pack.period)
          .toEqual(
            canonicalPeriod
          );

        expect(result.pack.period)
          .not.toBe(
            canonicalPeriod
          );
      }
    );

    it(
      "rejects an empty peer evidence context",
      () => {
        const result =
          createPeerIntelligenceEvidencePack(
            createContext({
              firstCompany: [],
              secondCompany: [],
              shared: [],
              evidenceCount:
                0,
            })
          );

        expect(result).toEqual({
          status:
            "REJECTED",
          pack:
            null,
          issue:
            "PEER_EVIDENCE_CONTEXT_EMPTY",
        });
      }
    );

    it(
      "allows an existing canonical collection with zero projected evidence",
      () => {
        const item =
          createBoundItem({
            collection: {
              ...createBoundItem()
                .collection,
              evidence: [],
            },
          });

        const result =
          createPeerIntelligenceEvidencePack(
            createContext({
              firstCompany: [
                item,
              ],
            })
          );

        expect(result.status)
          .toBe("CREATED");

        if (result.status !== "CREATED") {
          throw new Error(
            "Expected CREATED result"
          );
        }

        expect(
          result.pack.firstCompany
        ).toEqual([]);

        expect(
          result.pack.evidenceCount
        ).toBe(0);
      }
    );

    it(
      "preserves plan and case identity and keeps causal conclusion unknown",
      () => {
        const result =
          createPeerIntelligenceEvidencePack(
            createContext({
              planId:
                "PLAN-CANONICAL",
              caseId:
                "CASE-CANONICAL",
            })
          );

        if (result.status !== "CREATED") {
          throw new Error(
            "Expected CREATED result"
          );
        }

        expect(result.pack.planId)
          .toBe("PLAN-CANONICAL");

        expect(result.pack.caseId)
          .toBe("CASE-CANONICAL");

        expect(
          result.pack.causalConclusion
        ).toBe("UNKNOWN");
      }
    );

    it(
      "does not mutate the canonical peer evidence context",
      () => {
        const context =
          createContext();

        const snapshot =
          structuredClone(
            context
          );

        createPeerIntelligenceEvidencePack(
          context
        );

        expect(context)
          .toEqual(snapshot);
      }
    );
  }
);
