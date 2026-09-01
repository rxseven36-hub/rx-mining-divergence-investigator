import type {
  RXIntelligenceSubject,
} from "../context/intelligence-context";

import type {
  RXRelatedIntelligenceEvidence,
} from "../context/intelligence-relationship";

export type RXDirectCompanyIntelligenceEvidence =
  RXRelatedIntelligenceEvidence & {
    relationship:
      "DIRECT_COMPANY";
  };

export type RXCommodityContextIntelligenceEvidence =
  RXRelatedIntelligenceEvidence & {
    relationship:
      "COMMODITY_CONTEXT";
  };

export type RXMarketContextIntelligenceEvidence =
  RXRelatedIntelligenceEvidence & {
    relationship:
      "MARKET_CONTEXT";
  };

export interface RXCompanyIntelligence {
  subject:
    RXIntelligenceSubject;

  companyEvidence:
    RXDirectCompanyIntelligenceEvidence[];

  commodityContext:
    RXCommodityContextIntelligenceEvidence[];

  marketContext:
    RXMarketContextIntelligenceEvidence[];

  causalConclusion:
    "UNKNOWN";
}