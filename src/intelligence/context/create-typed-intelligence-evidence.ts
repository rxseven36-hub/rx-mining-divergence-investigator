import type {
  RXMiningOperationalContextEvidenceAdmissionResult,
} from "../../investigation/admit-mining-operational-context-evidence";

import type {
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
} from "../../investigation/admit-mining-historical-performance-evidence";

import type {
  RXCommodityPriceEvidenceAdmissionResult,
} from "../../investigation/admit-commodity-price-evidence";

import type {
  RXMarketTransactionEvidenceAdmissionResult,
} from "../../investigation/admit-market-transaction-evidence";

import type {
  RXNormalizedOperationalContext,
  RXOperationalFact,
} from "../../data/normalization/normalized-operational-context";

import type {
  RXOperationalIntelligenceFactName,
  RXTypedIntelligenceEvidence,
} from "./typed-intelligence-evidence";

export type RXTypedIntelligenceEvidenceAdmissionInput =
  | {
      kind:
        "OPERATIONAL";

      admission:
        RXMiningOperationalContextEvidenceAdmissionResult;
    }
  | {
      kind:
        "HISTORICAL";

      admission:
        RXMiningHistoricalPerformanceEvidenceAdmissionResult;
    }
  | {
      kind:
        "COMMODITY";

      admission:
        RXCommodityPriceEvidenceAdmissionResult;
    }
  | {
      kind:
        "MARKET";

      admission:
        RXMarketTransactionEvidenceAdmissionResult;
    };

interface RXNamedOperationalFact {
  name:
    RXOperationalIntelligenceFactName;

  fact:
    RXOperationalFact<unknown>;
}

function cloneEvidence<T extends { evidence: unknown[] }>(
  input:
    T
): T {
  return {
    ...input,

    evidence:
      input.evidence.map(
        (item) =>
          typeof item === "object" &&
          item !== null
            ? {
                ...item,
              }
            : item
      ),
  };
}

function createOperationalEvidence(
  context:
    RXNormalizedOperationalContext
): RXTypedIntelligenceEvidence[] {
  const facts:
    RXNamedOperationalFact[] = [
      {
        name:
          "name",
        fact:
          context.name,
      },
      {
        name:
          "symbol",
        fact:
          context.symbol,
      },
      {
        name:
          "companyType",
        fact:
          context.companyType,
      },
      {
        name:
          "keyOperation",
        fact:
          context.keyOperation,
      },
      {
        name:
          "activities",
        fact:
          context.activities,
      },
      {
        name:
          "commodityTypes",
        fact:
          context.commodityTypes,
      },
      {
        name:
          "operationProvince",
        fact:
          context.operationProvince,
      },
      {
        name:
          "operationDistrict",
        fact:
          context.operationDistrict,
      },
      {
        name:
          "miningSiteCount",
        fact:
          context.miningSiteCount,
      },
      {
        name:
          "miningLicenses",
        fact:
          context.miningLicenses,
      },
      {
        name:
          "miningContracts",
        fact:
          context.miningContracts,
      },
    ];

  return facts
    .filter(
      ({ fact }) =>
        fact.semantic.state ===
          "KNOWN" &&
        typeof fact.semantic.basis ===
          "string" &&
        fact.semantic.basis.trim()
          .length > 0
    )
    .map(
      ({ name, fact }) => ({
        kind:
          "OPERATIONAL_FACT",

        scope:
          "OPERATIONAL",

        companyId:
          context.companyId,

        fact:
          name,

        sourceField:
          fact.sourceField,

        value:
          structuredClone(
            fact.value
          ),

        evidence:
          fact.evidence.map(
            (item) => ({
              ...item,
            })
          ),

        truthClass:
          "SOURCE_FACT",
      })
    );
}

export function createTypedIntelligenceEvidence(
  input:
    RXTypedIntelligenceEvidenceAdmissionInput
): RXTypedIntelligenceEvidence[] {
  switch (input.kind) {
    case "OPERATIONAL": {
      const admission =
        input.admission;

      if (
        admission.status !==
          "ADMITTED" ||
        admission.context === null
      ) {
        return [];
      }

      return createOperationalEvidence(
        admission.context
      );
    }

    case "HISTORICAL": {
      const admission =
        input.admission;

      if (
        admission.status !==
          "ADMITTED"
      ) {
        return [];
      }

      return admission
        .admittedObservations
        .map(
          (observation) => ({
            kind:
              "PERFORMANCE_OBSERVATION",

            scope:
              "HISTORICAL",

            observation:
              cloneEvidence(
                observation
              ),

            truthClass:
              "SOURCE_FACT",
          })
        );
    }

    case "COMMODITY": {
      const admission =
        input.admission;

      if (
        admission.status !==
          "ADMITTED"
      ) {
        return [];
      }

      return admission.observations.map(
        (observation) => ({
          kind:
            "COMMODITY_OBSERVATION",

          scope:
            "COMMODITY",

          observation:
            cloneEvidence(
              observation
            ),

          truthClass:
            "SOURCE_FACT",
        })
      );
    }

    case "MARKET": {
      const admission =
        input.admission;

      if (
        admission.status !==
          "ADMITTED"
      ) {
        return [];
      }

      return admission.observations.map(
        (observation) => ({
          kind:
            "MARKET_OBSERVATION",

          scope:
            "MARKET",

          observation:
            cloneEvidence(
              observation
            ),

          truthClass:
            "SOURCE_FACT",
        })
      );
    }
  }
}
