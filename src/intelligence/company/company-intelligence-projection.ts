import type {
  RXIntelligenceSubject,
} from "../context/intelligence-context";

import type {
  RXCommodityContextIntelligenceEvidence,
  RXDirectCompanyIntelligenceEvidence,
  RXMarketContextIntelligenceEvidence,
} from "./company-intelligence";

export type RXCompanyIdentityFactName =
  | "name"
  | "symbol"
  | "companyType";

export type RXCompanyOperationFactName =
  | "keyOperation"
  | "activities"
  | "commodityTypes"
  | "operationProvince"
  | "operationDistrict"
  | "miningSiteCount"
  | "miningLicenses"
  | "miningContracts";

export type RXCompanyIdentityEvidence =
  RXDirectCompanyIntelligenceEvidence & {
    evidence: {
      kind:
        "OPERATIONAL_FACT";

      fact:
        RXCompanyIdentityFactName;
    };
  };

export type RXCompanyOperationEvidence =
  RXDirectCompanyIntelligenceEvidence & {
    evidence: {
      kind:
        "OPERATIONAL_FACT";

      fact:
        RXCompanyOperationFactName;
    };
  };

export type RXCompanyPerformanceEvidence =
  RXDirectCompanyIntelligenceEvidence & {
    evidence: {
      kind:
        "PERFORMANCE_OBSERVATION";
    };
  };

export interface RXCompanyIntelligenceProjection {
  subject:
    RXIntelligenceSubject;

  identity:
    RXCompanyIdentityEvidence[];

  operations:
    RXCompanyOperationEvidence[];

  performance:
    RXCompanyPerformanceEvidence[];

  commodityContext:
    RXCommodityContextIntelligenceEvidence[];

  marketContext:
    RXMarketContextIntelligenceEvidence[];

  causalConclusion:
    "UNKNOWN";
}