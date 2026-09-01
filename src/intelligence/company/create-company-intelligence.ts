import type {
  RXCompanyIntelligence,
  RXCommodityContextIntelligenceEvidence,
  RXDirectCompanyIntelligenceEvidence,
  RXMarketContextIntelligenceEvidence,
} from "./company-intelligence";

import type {
  RXIntelligenceEvidenceRelationship,
  RXRelatedIntelligenceEvidence,
} from "../context/intelligence-relationship";

import type {
  RXIntelligenceSubject,
} from "../context/intelligence-context";

export interface CreateRXCompanyIntelligenceInput {
  subject:
    RXIntelligenceSubject;

  relationships:
    RXIntelligenceEvidenceRelationship[];
}

function subjectsMatch(
  left:
    RXIntelligenceSubject,
  right:
    RXIntelligenceSubject
): boolean {
  return (
    left.companyId ===
      right.companyId &&
    left.commodity ===
      right.commodity &&
    left.periodLabel ===
      right.periodLabel
  );
}

function cloneRelatedEvidence(
  relationship:
    RXRelatedIntelligenceEvidence
): RXRelatedIntelligenceEvidence {
  return structuredClone(
    relationship
  );
}

export function createRXCompanyIntelligence(
  input:
    CreateRXCompanyIntelligenceInput
): RXCompanyIntelligence {
  const companyEvidence:
    RXDirectCompanyIntelligenceEvidence[] =
      [];

  const commodityContext:
    RXCommodityContextIntelligenceEvidence[] =
      [];

  const marketContext:
    RXMarketContextIntelligenceEvidence[] =
      [];

  for (
    const relationship
    of input.relationships
  ) {
    if (
      relationship.status !==
      "RELATED"
    ) {
      continue;
    }

    if (
      !subjectsMatch(
        input.subject,
        relationship.subject
      )
    ) {
      continue;
    }

    const cloned =
      cloneRelatedEvidence(
        relationship
      );

    switch (
      cloned.relationship
    ) {
      case "DIRECT_COMPANY":
        companyEvidence.push(
          cloned as
            RXDirectCompanyIntelligenceEvidence
        );
        break;

      case "COMMODITY_CONTEXT":
        commodityContext.push(
          cloned as
            RXCommodityContextIntelligenceEvidence
        );
        break;

      case "MARKET_CONTEXT":
        marketContext.push(
          cloned as
            RXMarketContextIntelligenceEvidence
        );
        break;
    }
  }

  return {
    subject:
      structuredClone(
        input.subject
      ),

    companyEvidence,

    commodityContext,

    marketContext,

    causalConclusion:
      "UNKNOWN",
  };
}