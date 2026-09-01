import type {
  RXCommodity,
} from "../../types/commodity";
import type {
  RXOperationalIntelligenceEvidence,
} from "../context/typed-intelligence-evidence";

export type RXPeerEligibilityIssue =
  | "SAME_COMPANY"
  | "LEFT_COMMODITY_EVIDENCE_MISSING"
  | "RIGHT_COMMODITY_EVIDENCE_MISSING"
  | "LEFT_COMMODITY_EVIDENCE_AMBIGUOUS"
  | "RIGHT_COMMODITY_EVIDENCE_AMBIGUOUS"
  | "LEFT_COMMODITY_VALUE_INVALID"
  | "RIGHT_COMMODITY_VALUE_INVALID"
  | "NO_SHARED_COMMODITY";

export interface RXPeerDescriptiveEvidence {
  companyType:
    RXOperationalIntelligenceEvidence[];

  keyOperation:
    RXOperationalIntelligenceEvidence[];

  activities:
    RXOperationalIntelligenceEvidence[];
}

export interface RXPeerEligibilityResult {
  status:
    "ELIGIBLE" | "REJECTED";

  leftCompanyId:
    string;

  rightCompanyId:
    string;

  sharedCommodities:
    RXCommodity[];

  leftCommodityEvidence:
    RXOperationalIntelligenceEvidence | null;

  rightCommodityEvidence:
    RXOperationalIntelligenceEvidence | null;

  descriptiveEvidence: {
    left:
      RXPeerDescriptiveEvidence;

    right:
      RXPeerDescriptiveEvidence;
  };

  issues:
    RXPeerEligibilityIssue[];

  causalConclusion:
    "UNKNOWN";
}