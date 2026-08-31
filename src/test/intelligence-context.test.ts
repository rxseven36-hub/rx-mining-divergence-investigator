import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXEvidenceCollectionResult,
} from "../investigation/evidence-collection";

import {
  createRXIntelligenceContext,
} from "../intelligence/context/create-intelligence-context";

function createCollection(
  overrides:
    Partial<RXEvidenceCollectionResult> = {}
): RXEvidenceCollectionResult {
  return {
    requestId:
      "REQUEST-1",

    requirementId:
      "REQUIREMENT-1",

    capability:
      "MINING_OPERATIONAL_CONTEXT",

    status:
      "AVAILABLE",

    evidence: [
      {
        evidenceId:
          "EVIDENCE-1",

        source:
          "SECTORS",

        sourceReference:
          "sectors:test",

        truthClass:
          "SOURCE_FACT",

        description:
          "source fact",
      },
    ],

    issues: [],

    causalConclusion:
      "UNKNOWN",

    ...overrides,
  };
}

describe(
  "createRXIntelligenceContext",
  () => {
    it(
      "groups admitted available evidence without changing its truth boundary",
      () => {
        const collection =
          createCollection();

        const result =
          createRXIntelligenceContext({
            subject: {
              companyId:
                "company-aadi",

              commodity:
                "Coal",

              periodLabel:
                "2024",
            },

            evidence: [
              {
                scope:
                  "OPERATIONAL",

                admissionStatus:
                  "ADMITTED",

                collection,
              },
            ],
          });

        expect(
          result.subject
        ).toEqual({
          companyId:
            "company-aadi",

          commodity:
            "Coal",

          periodLabel:
            "2024",
        });

        expect(
          result.evidenceGroups
        ).toHaveLength(1);

        expect(
          result.evidenceGroups[0]
            ?.scope
        ).toBe(
          "OPERATIONAL"
        );

        expect(
          result.evidenceGroups[0]
            ?.relationship
        ).toBe(
          "ADMITTED_FOR_CONTEXT"
        );

        expect(
          result.evidenceGroups[0]
            ?.collection.evidence[0]
            ?.truthClass
        ).toBe(
          "SOURCE_FACT"
        );

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "excludes rejected evidence even when its collection says available",
      () => {
        const result =
          createRXIntelligenceContext({
            subject: {
              companyId:
                "company-aadi",

              commodity:
                "Coal",

              periodLabel:
                "2024",
            },

            evidence: [
              {
                scope:
                  "HISTORICAL",

                admissionStatus:
                  "REJECTED",

                collection:
                  createCollection(),
              },
            ],
          });

        expect(
          result.evidenceGroups
        ).toEqual([]);
      }
    );

    it(
      "excludes admitted evidence whose collection is not available",
      () => {
        const result =
          createRXIntelligenceContext({
            subject: {
              companyId:
                "company-aadi",

              commodity:
                "Coal",

              periodLabel:
                "2024",
            },

            evidence: [
              {
                scope:
                  "COMMODITY",

                admissionStatus:
                  "ADMITTED",

                collection:
                  createCollection({
                    status:
                      "UNAVAILABLE",

                    evidence: [],

                    issues: [
                      "NO_DATA",
                    ],
                  }),
              },
            ],
          });

        expect(
          result.evidenceGroups
        ).toEqual([]);
      }
    );

    it(
      "keeps evidence scopes separate",
      () => {
        const operational =
          createCollection({
            requestId:
              "REQUEST-OPERATIONAL",

            capability:
              "MINING_OPERATIONAL_CONTEXT",
          });

        const commodity =
          createCollection({
            requestId:
              "REQUEST-COMMODITY",

            capability:
              "COMMODITY_PRICE_HISTORY",
          });

        const market =
          createCollection({
            requestId:
              "REQUEST-MARKET",

            capability:
              "COMPANY_MARKET_TRANSACTION_HISTORY",
          });

        const result =
          createRXIntelligenceContext({
            subject: {
              companyId:
                "company-aadi",

              commodity:
                "Coal",

              periodLabel:
                "2024",
            },

            evidence: [
              {
                scope:
                  "OPERATIONAL",

                admissionStatus:
                  "ADMITTED",

                collection:
                  operational,
              },
              {
                scope:
                  "COMMODITY",

                admissionStatus:
                  "ADMITTED",

                collection:
                  commodity,
              },
              {
                scope:
                  "MARKET",

                admissionStatus:
                  "ADMITTED",

                collection:
                  market,
              },
            ],
          });

        expect(
          result.evidenceGroups.map(
            (group) =>
              group.scope
          )
        ).toEqual([
          "OPERATIONAL",
          "COMMODITY",
          "MARKET",
        ]);
      }
    );

    it(
      "does not mutate the source admission collection",
      () => {
        const collection =
          createCollection();

        const original =
          structuredClone(
            collection
          );

        const result =
          createRXIntelligenceContext({
            subject: {
              companyId:
                "company-aadi",

              commodity:
                "Coal",

              periodLabel:
                "2024",
            },

            evidence: [
              {
                scope:
                  "OPERATIONAL",

                admissionStatus:
                  "ADMITTED",

                collection,
              },
            ],
          });

        result.evidenceGroups[0]
          ?.collection.issues.push(
            "NO_DATA"
          );

        expect(
          collection
        ).toEqual(
          original
        );
      }
    );

    it(
      "never manufactures a causal conclusion",
      () => {
        const result =
          createRXIntelligenceContext({
            subject: {
              companyId:
                "company-aadi",

              commodity:
                "Coal",

              periodLabel:
                "2024",
            },

            evidence: [],
          });

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );
  }
);