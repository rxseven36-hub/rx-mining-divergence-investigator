import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createTypedIntelligenceEvidence,
} from "../intelligence/context/create-typed-intelligence-evidence";

import type {
  RXMiningOperationalContextEvidenceAdmissionResult,
} from "../investigation/admit-mining-operational-context-evidence";

import type {
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
} from "../investigation/admit-mining-historical-performance-evidence";

import type {
  RXCommodityPriceEvidenceAdmissionResult,
} from "../investigation/admit-commodity-price-evidence";

import type {
  RXMarketTransactionEvidenceAdmissionResult,
} from "../investigation/admit-market-transaction-evidence";

import type {
  RXNormalizedObservation,
} from "../data/normalization/normalized-observation";

import type {
  RXNormalizedCommodityPriceObservation,
} from "../data/normalization/normalized-commodity-price";

import type {
  RXNormalizedMarketTransactionObservation,
} from "../data/normalization/normalized-market-transaction";

import type {
  RXNormalizedOperationalContext,
  RXOperationalFact,
} from "../data/normalization/normalized-operational-context";

import type {
  RXEvidenceCollectionResult,
} from "../investigation/evidence-collection";

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

function knownFact<T>(
  sourceField:
    string,
  value:
    T
): RXOperationalFact<T> {
  return {
    sourceField,
    value,
    semantic: {
      state:
        "KNOWN",
      basis:
        `known:${sourceField}`,
    },
    evidence: [
      sourceEvidence(
        `operational:${sourceField}`
      ),
    ],
  };
}

function operationalContext():
  RXNormalizedOperationalContext {
  const evidence =
    sourceEvidence(
      "operational-context"
    );

  return {
    companyId:
      "COMPANY-AADI",

    sectorsSlug:
      "pt-adaro-andalan-indonesia-tbk",

    name:
      knownFact(
        "name",
        "PT Adaro Andalan Indonesia Tbk"
      ),

    symbol:
      knownFact(
        "symbol",
        "AADI.JK"
      ),

    companyType:
      knownFact(
        "company_type",
        "Holding"
      ),

    keyOperation:
      knownFact(
        "key_operation",
        "Coal Trading"
      ),

    activities:
      knownFact(
        "activities",
        [
          "Coal Trading",
        ]
      ),

    commodityTypes:
      knownFact(
        "commodity_type",
        [
          "Coal",
        ]
      ),

    operationProvince:
      knownFact(
        "operation_province",
        null
      ),

    operationDistrict:
      knownFact(
        "operation_district",
        null
      ),

    miningSiteCount:
      knownFact(
        "mining_site_count",
        1
      ),

    miningLicenses:
      knownFact(
        "mining_license",
        []
      ),

    miningContracts:
      knownFact(
        "mining_contract",
        []
      ),

    evidence: [
      evidence,
    ],
  };
}

function collection(
  capability:
    RXEvidenceCollectionResult["capability"],
  status:
    RXEvidenceCollectionResult["status"] =
      "AVAILABLE"
): RXEvidenceCollectionResult {
  return {
    requestId:
      `REQUEST-${capability}`,

    requirementId:
      `REQUIREMENT-${capability}`,

    capability,

    status,

    evidence: [
      {
        evidenceId:
          `EVIDENCE-${capability}`,

        source:
          "SECTORS",

        sourceReference:
          `source:${capability}`,

        truthClass:
          "SOURCE_FACT",

        description:
          "THIS TEXT MUST NEVER BE PARSED",
      },
    ],

    issues:
      [],

    causalConclusion:
      "UNKNOWN",
  };
}

function historicalObservation(
  id:
    string,
  metric:
    "PRODUCTION" | "SALES",
  value:
    number | null
): RXNormalizedObservation {
  return {
    id,

    companyId:
      "COMPANY-AADI",

    commodity:
      "COAL",

    metric,

    value,

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
        `historical:${id}`
      ),
    ],

    semanticDescription:
      `${metric} observation`,

    semantic: {
      state:
        "KNOWN",
      basis:
        `known:${metric}`,
    },
  };
}

function commodityObservation():
  RXNormalizedCommodityPriceObservation {
  return {
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

    evidence: [
      sourceEvidence(
        "commodity:coal"
      ),
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
  };
}

function marketObservation():
  RXNormalizedMarketTransactionObservation {
  return {
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

describe(
  "createTypedIntelligenceEvidence",
  () => {
    it(
      "creates typed operational facts from admitted operational context",
      () => {
        const admission:
          RXMiningOperationalContextEvidenceAdmissionResult =
          {
            status:
              "ADMITTED",

            collection:
              collection(
                "MINING_OPERATIONAL_CONTEXT"
              ),

            context:
              operationalContext(),
          };

        const result =
          createTypedIntelligenceEvidence({
            kind:
              "OPERATIONAL",
            admission,
          });

        expect(
          result.length
        ).toBeGreaterThan(
          0
        );

        expect(
          result[0]
        ).toMatchObject({
          kind:
            "OPERATIONAL_FACT",
          scope:
            "OPERATIONAL",
          companyId:
            "COMPANY-AADI",
          fact:
            "name",
          sourceField:
            "name",
          value:
            "PT Adaro Andalan Indonesia Tbk",
          truthClass:
            "SOURCE_FACT",
        });
      }
    );

    it(
      "uses only admitted historical observations",
      () => {
        const admitted =
          historicalObservation(
            "ADMITTED-PRODUCTION",
            "PRODUCTION",
            48.11
          );

        const broaderOnly =
          historicalObservation(
            "BROADER-SALES",
            "SALES",
            55.8
          );

        const admission:
          RXMiningHistoricalPerformanceEvidenceAdmissionResult =
          {
            status:
              "ADMITTED",

            collection:
              collection(
                "MINING_HISTORICAL_PERFORMANCE"
              ),

            observations: [
              admitted,
              broaderOnly,
            ],

            admittedObservations: [
              admitted,
            ],
          };

        const result =
          createTypedIntelligenceEvidence({
            kind:
              "HISTORICAL",
            admission,
          });

        expect(result).toHaveLength(
          1
        );

        expect(
          result[0]
        ).toMatchObject({
          kind:
            "PERFORMANCE_OBSERVATION",
          scope:
            "HISTORICAL",
          truthClass:
            "SOURCE_FACT",
        });

        if (
          result[0]?.kind ===
          "PERFORMANCE_OBSERVATION"
        ) {
          expect(
            result[0]
              .observation.id
          ).toBe(
            "ADMITTED-PRODUCTION"
          );
        }
      }
    );

    it(
      "preserves null historical values instead of converting them to zero",
      () => {
        const observation =
          historicalObservation(
            "NULL-PRODUCTION",
            "PRODUCTION",
            null
          );

        const admission:
          RXMiningHistoricalPerformanceEvidenceAdmissionResult =
          {
            status:
              "ADMITTED",

            collection:
              collection(
                "MINING_HISTORICAL_PERFORMANCE"
              ),

            observations: [
              observation,
            ],

            admittedObservations: [
              observation,
            ],
          };

        const result =
          createTypedIntelligenceEvidence({
            kind:
              "HISTORICAL",
            admission,
          });

        expect(result).toHaveLength(
          1
        );

        if (
          result[0]?.kind ===
          "PERFORMANCE_OBSERVATION"
        ) {
          expect(
            result[0]
              .observation.value
          ).toBeNull();
        }
      }
    );

    it(
      "creates commodity evidence without manufacturing company identity",
      () => {
        const admission:
          RXCommodityPriceEvidenceAdmissionResult =
          {
            status:
              "ADMITTED",

            collection:
              collection(
                "COMMODITY_PRICE_HISTORY"
              ),

            observations: [
              commodityObservation(),
            ],
          };

        const result =
          createTypedIntelligenceEvidence({
            kind:
              "COMMODITY",
            admission,
          });

        expect(result).toHaveLength(
          1
        );

        expect(
          result[0]
        ).toMatchObject({
          kind:
            "COMMODITY_OBSERVATION",
          scope:
            "COMMODITY",
          truthClass:
            "SOURCE_FACT",
        });

        if (
          result[0]?.kind ===
          "COMMODITY_OBSERVATION"
        ) {
          expect(
            result[0]
              .observation.commodity
          ).toBe(
            "COAL"
          );

          expect(
            "companyId" in
              result[0].observation
          ).toBe(false);
        }
      }
    );

    it(
      "creates market evidence without manufacturing company or commodity relationship",
      () => {
        const admission:
          RXMarketTransactionEvidenceAdmissionResult =
          {
            status:
              "ADMITTED",

            collection:
              collection(
                "COMPANY_MARKET_TRANSACTION_HISTORY"
              ),

            observations: [
              marketObservation(),
            ],
          };

        const result =
          createTypedIntelligenceEvidence({
            kind:
              "MARKET",
            admission,
          });

        expect(result).toHaveLength(
          1
        );

        if (
          result[0]?.kind ===
          "MARKET_OBSERVATION"
        ) {
          expect(
            result[0]
              .observation.symbol
          ).toBe(
            "AADI.JK"
          );

          expect(
            "companyId" in
              result[0].observation
          ).toBe(false);

          expect(
            "commodity" in
              result[0].observation
          ).toBe(false);
        }
      }
    );

    it(
      "returns no typed evidence for rejected admissions",
      () => {
        const admission:
          RXCommodityPriceEvidenceAdmissionResult =
          {
            status:
              "REJECTED",

            collection:
              collection(
                "COMMODITY_PRICE_HISTORY",
                "NOT_COMPARABLE"
              ),

            observations: [
              commodityObservation(),
            ],
          };

        const result =
          createTypedIntelligenceEvidence({
            kind:
              "COMMODITY",
            admission,
          });

        expect(result).toEqual(
          []
        );
      }
    );

    it(
      "preserves provenance and truth classification",
      () => {
        const observation =
          marketObservation();

        const admission:
          RXMarketTransactionEvidenceAdmissionResult =
          {
            status:
              "ADMITTED",

            collection:
              collection(
                "COMPANY_MARKET_TRANSACTION_HISTORY"
              ),

            observations: [
              observation,
            ],
          };

        const result =
          createTypedIntelligenceEvidence({
            kind:
              "MARKET",
            admission,
          });

        if (
          result[0]?.kind !==
          "MARKET_OBSERVATION"
        ) {
          throw new Error(
            "Expected market observation"
          );
        }

        expect(
          result[0].truthClass
        ).toBe(
          "SOURCE_FACT"
        );

        expect(
          result[0]
            .observation.evidence
        ).toEqual(
          observation.evidence
        );

        expect(
          result[0]
            .observation.evidence
        ).not.toBe(
          observation.evidence
        );
      }
    );

    it(
      "does not mutate admission input",
      () => {
        const observation =
          commodityObservation();

        const admission:
          RXCommodityPriceEvidenceAdmissionResult =
          {
            status:
              "ADMITTED",

            collection:
              collection(
                "COMMODITY_PRICE_HISTORY"
              ),

            observations: [
              observation,
            ],
          };

        const before =
          structuredClone(
            admission
          );

        createTypedIntelligenceEvidence({
          kind:
            "COMMODITY",
          admission,
        });

        expect(admission).toEqual(
          before
        );
      }
    );

    it(
      "does not depend on human-readable collection descriptions",
      () => {
        const admission:
          RXMarketTransactionEvidenceAdmissionResult =
          {
            status:
              "ADMITTED",

            collection: {
              ...collection(
                "COMPANY_MARKET_TRANSACTION_HISTORY"
              ),

              evidence: [
                {
                  evidenceId:
                    "DO-NOT-PARSE",

                  source:
                    "SECTORS",

                  sourceReference:
                    "opaque-reference",

                  truthClass:
                    "SOURCE_FACT",

                  description:
                    "THIS TEXT MUST NEVER BE PARSED: companyId=WRONG commodity=WRONG value=999999",
                },
              ],
            },

            observations: [
              marketObservation(),
            ],
          };

        const result =
          createTypedIntelligenceEvidence({
            kind:
              "MARKET",
            admission,
          });

        if (
          result[0]?.kind !==
          "MARKET_OBSERVATION"
        ) {
          throw new Error(
            "Expected market observation"
          );
        }

        expect(
          result[0]
            .observation.symbol
        ).toBe(
          "AADI.JK"
        );

        expect(
          result[0]
            .observation.value
        ).toBe(
          8500
        );
      }
    );
  }
);
