import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createRXCompanyIntelligenceProjection,
} from "../intelligence/company/create-company-intelligence-projection";

import type {
  RXCompanyIntelligence,
  RXCommodityContextIntelligenceEvidence,
  RXDirectCompanyIntelligenceEvidence,
  RXMarketContextIntelligenceEvidence,
} from "../intelligence/company/company-intelligence";

import type {
  RXIntelligenceSubject,
} from "../intelligence/context/intelligence-context";

function createSubject():
  RXIntelligenceSubject {
  return {
    companyId:
      "COMPANY-AADI",

    commodity:
      "COAL",

    periodLabel:
      "2024",
  };
}

function createOperationalEvidence(
  fact:
    "name" |
    "keyOperation"
): RXDirectCompanyIntelligenceEvidence {
  return {
    status:
      "RELATED",

    relationship:
      "DIRECT_COMPANY",

    subject:
      createSubject(),

    evidence: {
      kind:
        "OPERATIONAL_FACT",

      scope:
        "OPERATIONAL",

      companyId:
        "COMPANY-AADI",

      fact,

      sourceField:
        fact === "name"
          ? "name"
          : "key_operation",

      value:
        fact === "name"
          ? "PT Adaro Andalan Indonesia Tbk"
          : "Coal Trading",

      evidence: [
        {
          id:
            `source:${fact}`,

          provider:
            "SECTORS",

          source:
            "mining-company-detail",

          truthClass:
            "SOURCE_FACT",
        },
      ],

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

function createPerformanceEvidence():
  RXDirectCompanyIntelligenceEvidence {
  return {
    status:
      "RELATED",

    relationship:
      "DIRECT_COMPANY",

    subject:
      createSubject(),

    evidence: {
      kind:
        "PERFORMANCE_OBSERVATION",

      scope:
        "HISTORICAL",

      observation: {
        id:
          "AADI-COAL-PRODUCTION-2024",

        companyId:
          "COMPANY-AADI",

        commodity:
          "COAL",

        metric:
          "PRODUCTION",

        value:
          48.11,

        unit: {
          symbol:
            "MT",
          dimension:
            "MASS",
        },

        period: {
          kind:
            "YEAR",
          year:
            2024,
        },

        evidence: [
          {
            id:
              "source:production",

            provider:
              "SECTORS",

            source:
              "mining-performance",

            truthClass:
              "SOURCE_FACT",
          },
        ],

        sourceField:
          "production",

        semantic: {
          state:
            "KNOWN",

          basis:
            "Official mining performance field",
        },
      },

      truthClass:
        "SOURCE_FACT",
    },

    operation: {
      operation:
        "GET_MINING_HISTORICAL_PERFORMANCE",

      params: {
        sectorsSlug:
          "pt-adaro-andalan-indonesia-tbk",

        period: {
          kind:
            "YEAR",
          year:
            2024,
        },
      },

      purpose:
        "Collect historical performance",
    },

    issues:
      [],

    causalConclusion:
      "UNKNOWN",
  };
}

function createCommodityContext():
  RXCommodityContextIntelligenceEvidence {
  return {
    status:
      "RELATED",

    relationship:
      "COMMODITY_CONTEXT",

    subject:
      createSubject(),

    evidence: {
      kind:
        "COMMODITY_OBSERVATION",

      scope:
        "COMMODITY",

      observation: {
        id:
          "COAL-PRICE-2024",

        commodity:
          "COAL",

        metric:
          "PRICE",

        value:
          120,

        unit: {
          symbol:
            "USD/t",

          dimension:
            "PRICE",
        },

        period: {
          kind:
            "YEAR",

          year:
            2024,
        },

        evidence: [
          {
            id:
              "source:coal-price",

            provider:
              "SECTORS",

            source:
              "commodity-price",

            truthClass:
              "SOURCE_FACT",
          },
        ],

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

function createMarketContext():
  RXMarketContextIntelligenceEvidence {
  return {
    status:
      "RELATED",

    relationship:
      "MARKET_CONTEXT",

    subject:
      createSubject(),

    evidence: {
      kind:
        "MARKET_OBSERVATION",

      scope:
        "MARKET",

      observation: {
        id:
          "AADI-MARKET-2024",

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

        evidence: [
          {
            id:
              "source:market",

            provider:
              "SECTORS",

            source:
              "daily-market",

            truthClass:
              "SOURCE_FACT",
          },
        ],

        sourceField:
          "close",

        semanticDescription:
          "AADI daily closing price",

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

function createIntelligence():
  RXCompanyIntelligence {
  return {
    subject:
      createSubject(),

    companyEvidence: [
      createOperationalEvidence(
        "name"
      ),

      createOperationalEvidence(
        "keyOperation"
      ),

      createPerformanceEvidence(),
    ],

    commodityContext: [
      createCommodityContext(),
    ],

    marketContext: [
      createMarketContext(),
    ],

    causalConclusion:
      "UNKNOWN",
  };
}

describe(
  "createRXCompanyIntelligenceProjection",
  () => {
    it(
      "projects direct evidence into identity, operations, and performance",
      () => {
        const result =
          createRXCompanyIntelligenceProjection(
            createIntelligence()
          );

        expect(
          result.identity
        ).toHaveLength(
          1
        );

        expect(
          result.operations
        ).toHaveLength(
          1
        );

        expect(
          result.performance
        ).toHaveLength(
          1
        );

        expect(
          result.identity[0]
            ?.evidence.kind
        ).toBe(
          "OPERATIONAL_FACT"
        );

        expect(
          result.operations[0]
            ?.evidence.kind
        ).toBe(
          "OPERATIONAL_FACT"
        );

        expect(
          result.performance[0]
            ?.evidence.kind
        ).toBe(
          "PERFORMANCE_OBSERVATION"
        );
      }
    );

    it(
      "keeps commodity and market evidence contextual",
      () => {
        const result =
          createRXCompanyIntelligenceProjection(
            createIntelligence()
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
      "preserves source provenance and truth class",
      () => {
        const result =
          createRXCompanyIntelligenceProjection(
            createIntelligence()
          );

        const identity =
          result.identity[0];

        if (
          identity?.evidence.kind !==
          "OPERATIONAL_FACT"
        ) {
          throw new Error(
            "Expected identity evidence"
          );
        }

        expect(
          identity.evidence.truthClass
        ).toBe(
          "SOURCE_FACT"
        );

        expect(
          identity.evidence.evidence[0]
            ?.provider
        ).toBe(
          "SECTORS"
        );

        expect(
          identity.evidence.sourceField
        ).toBe(
          "name"
        );
      }
    );

    it(
      "preserves typed performance values and periods",
      () => {
        const result =
          createRXCompanyIntelligenceProjection(
            createIntelligence()
          );

        const performance =
          result.performance[0];

        if (
          performance?.evidence.kind !==
          "PERFORMANCE_OBSERVATION"
        ) {
          throw new Error(
            "Expected performance evidence"
          );
        }

        expect(
          performance.evidence
            .observation.value
        ).toBe(
          48.11
        );

        expect(
          performance.evidence
            .observation.period
        ).toEqual({
          kind:
            "YEAR",

          year:
            2024,
        });
      }
    );

    it(
      "keeps causal conclusion unknown",
      () => {
        const result =
          createRXCompanyIntelligenceProjection(
            createIntelligence()
          );

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "does not mutate company intelligence input",
      () => {
        const intelligence =
          createIntelligence();

        const before =
          structuredClone(
            intelligence
          );

        createRXCompanyIntelligenceProjection(
          intelligence
        );

        expect(
          intelligence
        ).toEqual(
          before
        );
      }
    );

    it(
      "returns cloned projected evidence",
      () => {
        const intelligence =
          createIntelligence();

        const result =
          createRXCompanyIntelligenceProjection(
            intelligence
          );

        expect(
          result.subject
        ).not.toBe(
          intelligence.subject
        );

        expect(
          result.identity[0]
        ).not.toBe(
          intelligence.companyEvidence[0]
        );

        expect(
          result.commodityContext[0]
        ).not.toBe(
          intelligence.commodityContext[0]
        );

        expect(
          result.marketContext[0]
        ).not.toBe(
          intelligence.marketContext[0]
        );
      }
    );
  }
);