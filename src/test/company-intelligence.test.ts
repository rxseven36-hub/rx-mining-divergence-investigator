import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createRXCompanyIntelligence,
} from "../intelligence/company/create-company-intelligence";

import type {
  RXIntelligenceSubject,
} from "../intelligence/context/intelligence-context";

import type {
  RXIntelligenceEvidenceRelationship,
  RXIntelligenceRelationshipKind,
  RXRelatedIntelligenceEvidence,
} from "../intelligence/context/intelligence-relationship";

function subject(
  companyId:
    string =
      "COMPANY-AADI"
): RXIntelligenceSubject {
  return {
    companyId,
    commodity:
      "COAL",
    periodLabel:
      "2024",
  };
}

function related(
  relationship:
    RXIntelligenceRelationshipKind,
  companyId:
    string =
      "COMPANY-AADI"
): RXRelatedIntelligenceEvidence {
  const relationshipSubject =
    subject(
      companyId
    );

  if (
    relationship ===
    "DIRECT_COMPANY"
  ) {
    return {
      status:
        "RELATED",

      relationship,

      subject:
        relationshipSubject,

      evidence: {
        kind:
          "OPERATIONAL_FACT",

        scope:
          "OPERATIONAL",

        companyId,

        fact:
          "name",

        sourceField:
          "name",

        value:
          "PT Adaro Andalan Indonesia Tbk",

        evidence:
          [],

        truthClass:
          "SOURCE_FACT",
      },

      operation: {
        operation:
          "GET_MINING_OPERATIONAL_CONTEXT",

        params: {
          sectorsSlug:
            "pt-adaro-andalan-indonesia-tbk",
        },

        purpose:
          "Collect operational context",
      },

      issues:
        [],

      causalConclusion:
        "UNKNOWN",
    };
  }

  if (
    relationship ===
    "COMMODITY_CONTEXT"
  ) {
    return {
      status:
        "RELATED",

      relationship,

      subject:
        relationshipSubject,

      evidence: {
        kind:
          "COMMODITY_OBSERVATION",

        scope:
          "COMMODITY",

        observation: {
          id:
            "COMMODITY-COAL-2024-01-01",

          commodity:
            "COAL",

          metric:
            "PRICE",

          value:
            123.45,

          unit: {
            symbol:
              "USD/t",
            dimension:
              "PRICE",
          },

          period: {
            kind:
              "DATE",
            start:
              "2024-01-01",
            end:
              "2024-01-01",
          },

          evidence:
            [],

          sourceField:
            "price_usd_per_ton",

          semanticDescription:
            "Coal commodity price",

          semantic: {
            state:
              "KNOWN",
            basis:
              "Official commodity price field",
          },
        },

        truthClass:
          "SOURCE_FACT",
      },

      operation: {
        operation:
          "GET_COMMODITY_PRICE_HISTORY",

        params: {
          commodity:
            "COAL",

          period: {
            kind:
              "YEAR",
            year:
              2024,
          },
        },

        purpose:
          "Collect commodity context",
      },

      issues:
        [],

      causalConclusion:
        "UNKNOWN",
    };
  }

  return {
    status:
      "RELATED",

    relationship:
      "MARKET_CONTEXT",

    subject:
      relationshipSubject,

    evidence: {
      kind:
        "MARKET_OBSERVATION",

      scope:
        "MARKET",

      observation: {
        id:
          "MARKET-AADI-2024-01-02",

        symbol:
          "AADI.JK",

        metric:
          "PRICE",

        value:
          8500,

        unit: {
          symbol:
            "IDR",
          dimension:
            "CURRENCY",
        },

        period: {
          kind:
            "DATE",
          start:
            "2024-01-02",
          end:
            "2024-01-02",
        },

        evidence:
          [],

        sourceField:
          "close",

        semanticDescription:
          "AADI closing price",

        semantic: {
          state:
            "KNOWN",
          basis:
            "Official daily close field",
        },
      },

      truthClass:
        "SOURCE_FACT",
    },

    operation: {
      operation:
        "GET_COMPANY_MARKET_TRANSACTION_HISTORY",

      params: {
        ticker:
          "AADI.JK",

        period: {
          kind:
            "RANGE",
          start:
            "2024-01-01",
          end:
            "2024-03-30",
        },
      },

      purpose:
        "Collect market context",
    },

    issues:
      [],

    causalConclusion:
      "UNKNOWN",
  };
}

function rejected():
  RXIntelligenceEvidenceRelationship {
  return {
    status:
      "REJECTED",

    relationship:
      null,

    subject:
      subject(),

    evidence:
      null,

    operation: {
      operation:
        "GET_COMMODITY_PRICE_HISTORY",

      params: {
        commodity:
          "COAL",

        period: {
          kind:
            "YEAR",
          year:
            2024,
        },
      },

      purpose:
        "Collect commodity context",
    },

    issues: [
      "COMMODITY_MISMATCH",
    ],

    causalConclusion:
      "UNKNOWN",
  };
}

describe(
  "createRXCompanyIntelligence",
  () => {
    it(
      "separates direct company evidence from contextual evidence",
      () => {
        const result =
          createRXCompanyIntelligence({
            subject:
              subject(),

            relationships: [
              related(
                "DIRECT_COMPANY"
              ),
              related(
                "COMMODITY_CONTEXT"
              ),
              related(
                "MARKET_CONTEXT"
              ),
            ],
          });

        expect(
          result.companyEvidence
        ).toHaveLength(
          1
        );

        expect(
          result.commodityContext
        ).toHaveLength(
          1
        );

        expect(
          result.marketContext
        ).toHaveLength(
          1
        );

        expect(
          result.companyEvidence[0]
            ?.relationship
        ).toBe(
          "DIRECT_COMPANY"
        );

        expect(
          result.commodityContext[0]
            ?.relationship
        ).toBe(
          "COMMODITY_CONTEXT"
        );

        expect(
          result.marketContext[0]
            ?.relationship
        ).toBe(
          "MARKET_CONTEXT"
        );
      }
    );

    it(
      "excludes rejected relationships from company intelligence",
      () => {
        const result =
          createRXCompanyIntelligence({
            subject:
              subject(),

            relationships: [
              rejected(),
            ],
          });

        expect(
          result.companyEvidence
        ).toEqual(
          []
        );

        expect(
          result.commodityContext
        ).toEqual(
          []
        );

        expect(
          result.marketContext
        ).toEqual(
          []
        );
      }
    );

    it(
      "isolates intelligence by subject",
      () => {
        const result =
          createRXCompanyIntelligence({
            subject:
              subject(),

            relationships: [
              related(
                "DIRECT_COMPANY",
                "COMPANY-AADI"
              ),

              related(
                "DIRECT_COMPANY",
                "COMPANY-OTHER"
              ),
            ],
          });

        expect(
          result.companyEvidence
        ).toHaveLength(
          1
        );

        expect(
          result.companyEvidence[0]
            ?.subject.companyId
        ).toBe(
          "COMPANY-AADI"
        );
      }
    );

    it(
      "keeps causal conclusion unknown",
      () => {
        const result =
          createRXCompanyIntelligence({
            subject:
              subject(),

            relationships: [
              related(
                "DIRECT_COMPANY"
              ),
            ],
          });

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "does not manufacture company identity onto commodity or market observations",
      () => {
        const result =
          createRXCompanyIntelligence({
            subject:
              subject(),

            relationships: [
              related(
                "COMMODITY_CONTEXT"
              ),
              related(
                "MARKET_CONTEXT"
              ),
            ],
          });

        const commodity =
          result.commodityContext[0];

        const market =
          result.marketContext[0];

        if (
          commodity?.evidence.kind !==
          "COMMODITY_OBSERVATION"
        ) {
          throw new Error(
            "Expected commodity context"
          );
        }

        if (
          market?.evidence.kind !==
          "MARKET_OBSERVATION"
        ) {
          throw new Error(
            "Expected market context"
          );
        }

        expect(
          "companyId" in
            commodity.evidence.observation
        ).toBe(false);

        expect(
          "companyId" in
            market.evidence.observation
        ).toBe(false);

        expect(
          "commodity" in
            market.evidence.observation
        ).toBe(false);
      }
    );

    it(
      "does not mutate relationship inputs",
      () => {
        const relationships:
          RXIntelligenceEvidenceRelationship[] =
            [
              related(
                "DIRECT_COMPANY"
              ),
              related(
                "COMMODITY_CONTEXT"
              ),
            ];

        const before =
          structuredClone(
            relationships
          );

        createRXCompanyIntelligence({
          subject:
            subject(),

          relationships,
        });

        expect(
          relationships
        ).toEqual(
          before
        );
      }
    );

    it(
      "returns cloned subject and relationship evidence",
      () => {
        const inputSubject =
          subject();

        const relationship =
          related(
            "DIRECT_COMPANY"
          );

        const result =
          createRXCompanyIntelligence({
            subject:
              inputSubject,

            relationships: [
              relationship,
            ],
          });

        expect(
          result.subject
        ).not.toBe(
          inputSubject
        );

        expect(
          result.companyEvidence[0]
        ).not.toBe(
          relationship
        );
      }
    );
  }
);