import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createRXIntelligenceRelationship,
} from "../intelligence/context/create-intelligence-relationship";

import type {
  RXIntelligenceSubject,
} from "../intelligence/context/intelligence-context";

import type {
  RXTypedIntelligenceEvidence,
} from "../intelligence/context/typed-intelligence-evidence";

import type {
  RXSectorsTypedOperationRequest,
} from "../data/sectors/sectors-operation-request";

import type {
  RXNormalizedObservation,
} from "../data/normalization/normalized-observation";

import type {
  RXNormalizedCommodityPriceObservation,
} from "../data/normalization/normalized-commodity-price";

import type {
  RXNormalizedMarketTransactionObservation,
} from "../data/normalization/normalized-market-transaction";

function sourceEvidence(
  id:
    string
) {
  return {
    id,
    provider:
      "SECTORS" as const,
    source:
      `source:${id}`,
    retrievedAt:
      "2026-09-01T00:00:00.000Z",
    truthClass:
      "SOURCE_FACT" as const,
  };
}

function subject():
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

function operationalEvidence(
  companyId:
    string =
      "COMPANY-AADI"
): RXTypedIntelligenceEvidence {
  return {
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

    evidence: [
      sourceEvidence(
        "operational:name"
      ),
    ],

    truthClass:
      "SOURCE_FACT",
  };
}

function historicalObservation(
  companyId:
    string =
      "COMPANY-AADI",
  commodity:
    "COAL" | "GOLD" =
      "COAL"
): RXNormalizedObservation {
  return {
    id:
      "HISTORICAL-PRODUCTION",

    companyId,

    commodity,

    metric:
      "PRODUCTION",

    value:
      48.11,

    unit: {
      symbol:
        "Mt",
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
      sourceEvidence(
        "historical:production"
      ),
    ],

    semanticDescription:
      "Production observation",

    semantic: {
      state:
        "KNOWN",
      basis:
        "known:PRODUCTION",
    },
  };
}

function historicalEvidence(
  companyId:
    string =
      "COMPANY-AADI",
  commodity:
    "COAL" | "GOLD" =
      "COAL"
): RXTypedIntelligenceEvidence {
  return {
    kind:
      "PERFORMANCE_OBSERVATION",

    scope:
      "HISTORICAL",

    observation:
      historicalObservation(
        companyId,
        commodity
      ),

    truthClass:
      "SOURCE_FACT",
  };
}

function commodityObservation(
  commodity:
    "COAL" | "GOLD" =
      "COAL"
): RXNormalizedCommodityPriceObservation {
  return {
    id:
      `COMMODITY-${commodity}-2024-01-01`,

    commodity,

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

    evidence: [
      sourceEvidence(
        `commodity:${commodity}`
      ),
    ],

    sourceField:
      "price_usd_per_ton",

    semanticDescription:
      `${commodity} commodity price`,

    semantic: {
      state:
        "KNOWN",
      basis:
        "Official commodity price field",
    },
  };
}

function commodityEvidence(
  commodity:
    "COAL" | "GOLD" =
      "COAL"
): RXTypedIntelligenceEvidence {
  return {
    kind:
      "COMMODITY_OBSERVATION",

    scope:
      "COMMODITY",

    observation:
      commodityObservation(
        commodity
      ),

    truthClass:
      "SOURCE_FACT",
  };
}

function marketObservation(
  symbol:
    string =
      "AADI.JK"
): RXNormalizedMarketTransactionObservation {
  return {
    id:
      "MARKET-AADI-2024-01-02",

    symbol,

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
      sourceEvidence(
        "market:aadi"
      ),
    ],

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
  };
}

function marketEvidence(
  symbol:
    string =
      "AADI.JK"
): RXTypedIntelligenceEvidence {
  return {
    kind:
      "MARKET_OBSERVATION",

    scope:
      "MARKET",

    observation:
      marketObservation(
        symbol
      ),

    truthClass:
      "SOURCE_FACT",
  };
}

function operationalOperation():
  RXSectorsTypedOperationRequest {
  return {
    operation:
      "GET_MINING_OPERATIONAL_CONTEXT",

    purpose:
      "Collect operational context",

    params: {
      sectorsSlug:
        "pt-adaro-andalan-indonesia-tbk",
    },
  };
}

function historicalOperation():
  RXSectorsTypedOperationRequest {
  return {
    operation:
      "GET_MINING_HISTORICAL_PERFORMANCE",

    purpose:
      "Collect historical performance",

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
  };
}

function commodityOperation(
  commodity:
    "COAL" | "GOLD" =
      "COAL"
): RXSectorsTypedOperationRequest {
  return {
    operation:
      "GET_COMMODITY_PRICE_HISTORY",

    purpose:
      "Collect commodity context",

    params: {
      commodity,

      period: {
        kind:
          "YEAR",
        year:
          2024,
      },
    },
  };
}

function marketOperation(
  ticker:
    string =
      "AADI.JK"
): RXSectorsTypedOperationRequest {
  return {
    operation:
      "GET_COMPANY_MARKET_TRANSACTION_HISTORY",

    purpose:
      "Collect market context",

    params: {
      ticker,

      period: {
        kind:
          "RANGE",
        start:
          "2024-01-01",
        end:
          "2024-03-30",
      },
    },
  };
}

describe(
  "createRXIntelligenceRelationship",
  () => {
    it(
      "classifies matching operational evidence as direct company evidence",
      () => {
        const result =
          createRXIntelligenceRelationship({
            subject:
              subject(),

            evidence:
              operationalEvidence(),

            operation:
              operationalOperation(),
          });

        expect(result).toMatchObject({
          status:
            "RELATED",

          relationship:
            "DIRECT_COMPANY",

          issues:
            [],

          causalConclusion:
            "UNKNOWN",
        });
      }
    );

    it(
      "rejects operational evidence for another company",
      () => {
        const result =
          createRXIntelligenceRelationship({
            subject:
              subject(),

            evidence:
              operationalEvidence(
                "COMPANY-OTHER"
              ),

            operation:
              operationalOperation(),
          });

        expect(result).toMatchObject({
          status:
            "REJECTED",

          relationship:
            null,

          evidence:
            null,

          issues: [
            "COMPANY_MISMATCH",
          ],

          causalConclusion:
            "UNKNOWN",
        });
      }
    );

    it(
      "classifies matching historical evidence as direct company evidence",
      () => {
        const result =
          createRXIntelligenceRelationship({
            subject:
              subject(),

            evidence:
              historicalEvidence(),

            operation:
              historicalOperation(),
          });

        expect(result).toMatchObject({
          status:
            "RELATED",

          relationship:
            "DIRECT_COMPANY",

          issues:
            [],
        });
      }
    );

    it(
      "rejects historical evidence for another company",
      () => {
        const result =
          createRXIntelligenceRelationship({
            subject:
              subject(),

            evidence:
              historicalEvidence(
                "COMPANY-OTHER"
              ),

            operation:
              historicalOperation(),
          });

        expect(result).toMatchObject({
          status:
            "REJECTED",

          issues: [
            "COMPANY_MISMATCH",
          ],
        });
      }
    );

    it(
      "rejects historical evidence for another commodity",
      () => {
        const result =
          createRXIntelligenceRelationship({
            subject:
              subject(),

            evidence:
              historicalEvidence(
                "COMPANY-AADI",
                "GOLD"
              ),

            operation:
              historicalOperation(),
          });

        expect(result).toMatchObject({
          status:
            "REJECTED",

          issues: [
            "COMMODITY_MISMATCH",
          ],
        });
      }
    );

    it(
      "classifies matching commodity evidence as commodity context",
      () => {
        const result =
          createRXIntelligenceRelationship({
            subject:
              subject(),

            evidence:
              commodityEvidence(),

            operation:
              commodityOperation(),
          });

        expect(result).toMatchObject({
          status:
            "RELATED",

          relationship:
            "COMMODITY_CONTEXT",

          issues:
            [],
        });

        if (
          result.status ===
          "RELATED" &&
          result.evidence.kind ===
          "COMMODITY_OBSERVATION"
        ) {
          expect(
            "companyId" in
              result.evidence.observation
          ).toBe(false);
        }
      }
    );

    it(
      "rejects commodity context when operation commodity does not match subject",
      () => {
        const result =
          createRXIntelligenceRelationship({
            subject:
              subject(),

            evidence:
              commodityEvidence(
                "GOLD"
              ),

            operation:
              commodityOperation(
                "GOLD"
              ),
          });

        expect(result).toMatchObject({
          status:
            "REJECTED",

          issues: [
            "COMMODITY_MISMATCH",
          ],
        });
      }
    );

    it(
      "rejects commodity evidence when observation and operation disagree",
      () => {
        const result =
          createRXIntelligenceRelationship({
            subject:
              subject(),

            evidence:
              commodityEvidence(
                "GOLD"
              ),

            operation:
              commodityOperation(
                "COAL"
              ),
          });

        expect(result).toMatchObject({
          status:
            "REJECTED",

          issues: [
            "COMMODITY_MISMATCH",
          ],
        });
      }
    );

    it(
      "classifies matching market evidence as market context",
      () => {
        const result =
          createRXIntelligenceRelationship({
            subject:
              subject(),

            evidence:
              marketEvidence(),

            operation:
              marketOperation(),
          });

        expect(result).toMatchObject({
          status:
            "RELATED",

          relationship:
            "MARKET_CONTEXT",

          issues:
            [],
        });

        if (
          result.status ===
          "RELATED" &&
          result.evidence.kind ===
          "MARKET_OBSERVATION"
        ) {
          expect(
            "companyId" in
              result.evidence.observation
          ).toBe(false);

          expect(
            "commodity" in
              result.evidence.observation
          ).toBe(false);
        }
      }
    );

    it(
      "uses the existing IDX symbol equivalence semantics for market relationship",
      () => {
        const result =
          createRXIntelligenceRelationship({
            subject:
              subject(),

            evidence:
              marketEvidence(
                "AADI.JK"
              ),

            operation:
              marketOperation(
                "aadi"
              ),
          });

        expect(result).toMatchObject({
          status:
            "RELATED",

          relationship:
            "MARKET_CONTEXT",
        });
      }
    );

    it(
      "rejects market evidence when source symbol does not match the prepared ticker",
      () => {
        const result =
          createRXIntelligenceRelationship({
            subject:
              subject(),

            evidence:
              marketEvidence(
                "OTHER.JK"
              ),

            operation:
              marketOperation(
                "AADI.JK"
              ),
          });

        expect(result).toMatchObject({
          status:
            "REJECTED",

          issues: [
            "MARKET_SYMBOL_MISMATCH",
          ],
        });
      }
    );

    it(
      "rejects evidence paired with the wrong typed operation",
      () => {
        const result =
          createRXIntelligenceRelationship({
            subject:
              subject(),

            evidence:
              commodityEvidence(),

            operation:
              marketOperation(),
          });

        expect(result).toMatchObject({
          status:
            "REJECTED",

          issues: [
            "EVIDENCE_OPERATION_MISMATCH",
          ],
        });
      }
    );

    it(
      "does not parse periodLabel as relationship proof",
      () => {
        const customSubject:
          RXIntelligenceSubject = {
          ...subject(),

          periodLabel:
            "THIS IS NOT A TYPED PERIOD",
        };

        const result =
          createRXIntelligenceRelationship({
            subject:
              customSubject,

            evidence:
              commodityEvidence(),

            operation:
              commodityOperation(),
          });

        expect(result).toMatchObject({
          status:
            "RELATED",

          relationship:
            "COMMODITY_CONTEXT",
        });
      }
    );

    it(
      "does not mutate subject evidence or operation inputs",
      () => {
        const input = {
          subject:
            subject(),

          evidence:
            marketEvidence(),

          operation:
            marketOperation(),
        };

        const before =
          structuredClone(
            input
          );

        createRXIntelligenceRelationship(
          input
        );

        expect(input).toEqual(
          before
        );
      }
    );

    it(
      "returns cloned related output instead of exposing mutable input references",
      () => {
        const input = {
          subject:
            subject(),

          evidence:
            commodityEvidence(),

          operation:
            commodityOperation(),
        };

        const result =
          createRXIntelligenceRelationship(
            input
          );

        if (
          result.status !==
          "RELATED"
        ) {
          throw new Error(
            "Expected related intelligence evidence"
          );
        }

        expect(
          result.subject
        ).not.toBe(
          input.subject
        );

        expect(
          result.evidence
        ).not.toBe(
          input.evidence
        );

        expect(
          result.operation
        ).not.toBe(
          input.operation
        );
      }
    );
  }
);