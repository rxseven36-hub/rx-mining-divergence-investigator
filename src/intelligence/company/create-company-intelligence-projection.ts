import type {
  RXCompanyIntelligence,
} from "./company-intelligence";

import type {
  RXCompanyIdentityEvidence,
  RXCompanyIdentityFactName,
  RXCompanyIntelligenceProjection,
  RXCompanyOperationEvidence,
  RXCompanyOperationFactName,
  RXCompanyPerformanceEvidence,
} from "./company-intelligence-projection";

const IDENTITY_FACTS =
  new Set<RXCompanyIdentityFactName>([
    "name",
    "symbol",
    "companyType",
  ]);

const OPERATION_FACTS =
  new Set<RXCompanyOperationFactName>([
    "keyOperation",
    "activities",
    "commodityTypes",
    "operationProvince",
    "operationDistrict",
    "miningSiteCount",
    "miningLicenses",
    "miningContracts",
  ]);

function isIdentityFact(
  fact:
    string
): fact is RXCompanyIdentityFactName {
  return IDENTITY_FACTS.has(
    fact as RXCompanyIdentityFactName
  );
}

function isOperationFact(
  fact:
    string
): fact is RXCompanyOperationFactName {
  return OPERATION_FACTS.has(
    fact as RXCompanyOperationFactName
  );
}

export function createRXCompanyIntelligenceProjection(
  intelligence:
    RXCompanyIntelligence
): RXCompanyIntelligenceProjection {
  const identity:
    RXCompanyIdentityEvidence[] =
      [];

  const operations:
    RXCompanyOperationEvidence[] =
      [];

  const performance:
    RXCompanyPerformanceEvidence[] =
      [];

  for (
    const relationship
    of intelligence.companyEvidence
  ) {
    const evidence =
      relationship.evidence;

    if (
      evidence.kind ===
      "PERFORMANCE_OBSERVATION"
    ) {
      performance.push(
        structuredClone(
          relationship
        ) as RXCompanyPerformanceEvidence
      );

      continue;
    }

    if (
      evidence.kind !==
      "OPERATIONAL_FACT"
    ) {
      continue;
    }

    if (
      isIdentityFact(
        evidence.fact
      )
    ) {
      identity.push(
        structuredClone(
          relationship
        ) as RXCompanyIdentityEvidence
      );

      continue;
    }

    if (
      isOperationFact(
        evidence.fact
      )
    ) {
      operations.push(
        structuredClone(
          relationship
        ) as RXCompanyOperationEvidence
      );
    }
  }

  return {
    subject:
      structuredClone(
        intelligence.subject
      ),

    identity,

    operations,

    performance,

    commodityContext:
      structuredClone(
        intelligence.commodityContext
      ),

    marketContext:
      structuredClone(
        intelligence.marketContext
      ),

    causalConclusion:
      "UNKNOWN",
  };
}