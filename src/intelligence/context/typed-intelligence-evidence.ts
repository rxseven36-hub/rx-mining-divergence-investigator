import type {
  RXNormalizedCommodityPriceObservation,
} from "../../data/normalization/normalized-commodity-price";

import type {
  RXNormalizedMarketTransactionObservation,
} from "../../data/normalization/normalized-market-transaction";

import type {
  RXNormalizedObservation,
} from "../../data/normalization/normalized-observation";

import type {
  RXOperationalFact,
} from "../../data/normalization/normalized-operational-context";

import type {
  RXSourceEvidence,
} from "../../truth/evidence";

export type RXOperationalIntelligenceFactName =
  | "name"
  | "symbol"
  | "companyType"
  | "keyOperation"
  | "activities"
  | "commodityTypes"
  | "operationProvince"
  | "operationDistrict"
  | "miningSiteCount"
  | "miningLicenses"
  | "miningContracts";

export interface RXOperationalIntelligenceEvidence {
  kind:
    "OPERATIONAL_FACT";

  scope:
    "OPERATIONAL";

  companyId:
    string;

  fact:
    RXOperationalIntelligenceFactName;

  sourceField:
    string;

  value:
    RXOperationalFact<unknown>["value"];

  evidence:
    RXSourceEvidence[];

  truthClass:
    "SOURCE_FACT";
}

export interface RXPerformanceIntelligenceEvidence {
  kind:
    "PERFORMANCE_OBSERVATION";

  scope:
    "HISTORICAL";

  observation:
    RXNormalizedObservation;

  truthClass:
    "SOURCE_FACT";
}

export interface RXCommodityIntelligenceEvidence {
  kind:
    "COMMODITY_OBSERVATION";

  scope:
    "COMMODITY";

  observation:
    RXNormalizedCommodityPriceObservation;

  truthClass:
    "SOURCE_FACT";
}

export interface RXMarketIntelligenceEvidence {
  kind:
    "MARKET_OBSERVATION";

  scope:
    "MARKET";

  observation:
    RXNormalizedMarketTransactionObservation;

  truthClass:
    "SOURCE_FACT";
}

export type RXTypedIntelligenceEvidence =
  | RXOperationalIntelligenceEvidence
  | RXPerformanceIntelligenceEvidence
  | RXCommodityIntelligenceEvidence
  | RXMarketIntelligenceEvidence;
