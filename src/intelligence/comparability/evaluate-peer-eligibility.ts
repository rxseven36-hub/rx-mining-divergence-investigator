import {
  normalizeCommodity,
} from "../../data/normalization/normalize-commodity";

import type {
  RXCommodity,
} from "../../types/commodity";
import type {
  RXOperationalIntelligenceEvidence,
  RXTypedIntelligenceEvidence,
} from "../context/typed-intelligence-evidence";

import type {
  RXPeerDescriptiveEvidence,
  RXPeerEligibilityIssue,
  RXPeerEligibilityResult,
} from "./peer-eligibility";

export interface EvaluatePeerEligibilityInput {
  leftCompanyId:
    string;

  rightCompanyId:
    string;

  evidence:
    RXTypedIntelligenceEvidence[];
}

function operationalEvidenceForCompany(
  evidence:
    RXTypedIntelligenceEvidence[],
  companyId:
    string
): RXOperationalIntelligenceEvidence[] {
  return evidence.filter(
    (
      item
    ): item is RXOperationalIntelligenceEvidence =>
      item.kind ===
        "OPERATIONAL_FACT" &&
      item.scope ===
        "OPERATIONAL" &&
      item.companyId ===
        companyId &&
      item.truthClass ===
        "SOURCE_FACT"
  );
}

function commodityEvidence(
  evidence:
    RXOperationalIntelligenceEvidence[]
): RXOperationalIntelligenceEvidence[] {
  return evidence.filter(
    (item) =>
      item.fact ===
        "commodityTypes"
  );
}

function descriptiveEvidence(
  evidence:
    RXOperationalIntelligenceEvidence[]
): RXPeerDescriptiveEvidence {
  return {
    companyType:
      evidence
        .filter(
          (item) =>
            item.fact ===
              "companyType"
        )
        .map(
          (item) =>
            structuredClone(
              item
            )
        ),

    keyOperation:
      evidence
        .filter(
          (item) =>
            item.fact ===
              "keyOperation"
        )
        .map(
          (item) =>
            structuredClone(
              item
            )
        ),

    activities:
      evidence
        .filter(
          (item) =>
            item.fact ===
              "activities"
        )
        .map(
          (item) =>
            structuredClone(
              item
            )
        ),
  };
}

function readCommodityValues(
  evidence:
    RXOperationalIntelligenceEvidence
): RXCommodity[] | null {
  if (
    !Array.isArray(
      evidence.value
    )
  ) {
    return null;
  }

  if (
    !evidence.value.every(
      (value) =>
        typeof value ===
          "string"
    )
  ) {
    return null;
  }

  const normalized =
    evidence.value.map(
      (value) =>
        normalizeCommodity(
          value
        )
    );

  if (
    normalized.some(
      (commodity) =>
        commodity === null
    )
  ) {
    return null;
  }

  return normalized as RXCommodity[];
}

function sharedCommodityValues(
  left:
    RXCommodity[],
  right:
    RXCommodity[]
): RXCommodity[] {
  const rightValues =
    new Set(
      right
    );

  return [
    ...new Set(
      left.filter(
        (commodity) =>
          rightValues.has(
            commodity
          )
      )
    ),
  ];
}

export function evaluatePeerEligibility(
  input:
    EvaluatePeerEligibilityInput
): RXPeerEligibilityResult {
  const issues:
    RXPeerEligibilityIssue[] = [];

  if (
    input.leftCompanyId ===
    input.rightCompanyId
  ) {
    issues.push(
      "SAME_COMPANY"
    );
  }

  const leftOperationalEvidence =
    operationalEvidenceForCompany(
      input.evidence,
      input.leftCompanyId
    );

  const rightOperationalEvidence =
    operationalEvidenceForCompany(
      input.evidence,
      input.rightCompanyId
    );

  const leftCommodityCandidates =
    commodityEvidence(
      leftOperationalEvidence
    );

  const rightCommodityCandidates =
    commodityEvidence(
      rightOperationalEvidence
    );

  if (
    leftCommodityCandidates.length ===
    0
  ) {
    issues.push(
      "LEFT_COMMODITY_EVIDENCE_MISSING"
    );
  } else if (
    leftCommodityCandidates.length >
    1
  ) {
    issues.push(
      "LEFT_COMMODITY_EVIDENCE_AMBIGUOUS"
    );
  }

  if (
    rightCommodityCandidates.length ===
    0
  ) {
    issues.push(
      "RIGHT_COMMODITY_EVIDENCE_MISSING"
    );
  } else if (
    rightCommodityCandidates.length >
    1
  ) {
    issues.push(
      "RIGHT_COMMODITY_EVIDENCE_AMBIGUOUS"
    );
  }

  const leftCommodityEvidence =
    leftCommodityCandidates.length ===
    1
      ? leftCommodityCandidates[0]
      : null;

  const rightCommodityEvidence =
    rightCommodityCandidates.length ===
    1
      ? rightCommodityCandidates[0]
      : null;

  let leftCommodityValues:
  RXCommodity[] | null = null;

  let rightCommodityValues:
  RXCommodity[] | null = null;

  if (
    leftCommodityEvidence !==
    null
  ) {
    leftCommodityValues =
      readCommodityValues(
        leftCommodityEvidence
      );

    if (
      leftCommodityValues ===
      null
    ) {
      issues.push(
        "LEFT_COMMODITY_VALUE_INVALID"
      );
    }
  }

  if (
    rightCommodityEvidence !==
    null
  ) {
    rightCommodityValues =
      readCommodityValues(
        rightCommodityEvidence
      );

    if (
      rightCommodityValues ===
      null
    ) {
      issues.push(
        "RIGHT_COMMODITY_VALUE_INVALID"
      );
    }
  }

  let sharedCommodities:
    RXCommodity[] = [];

  if (
    leftCommodityValues !==
      null &&
    rightCommodityValues !==
      null
  ) {
    sharedCommodities =
      sharedCommodityValues(
        leftCommodityValues,
        rightCommodityValues
      );

    if (
      sharedCommodities.length ===
      0
    ) {
      issues.push(
        "NO_SHARED_COMMODITY"
      );
    }
  }

  return {
    status:
      issues.length === 0
        ? "ELIGIBLE"
        : "REJECTED",

    leftCompanyId:
      input.leftCompanyId,

    rightCompanyId:
      input.rightCompanyId,

    sharedCommodities,

    leftCommodityEvidence:
      leftCommodityEvidence ===
      null
        ? null
        : structuredClone(
            leftCommodityEvidence
          ),

    rightCommodityEvidence:
      rightCommodityEvidence ===
      null
        ? null
        : structuredClone(
            rightCommodityEvidence
          ),

    descriptiveEvidence: {
      left:
        descriptiveEvidence(
          leftOperationalEvidence
        ),

      right:
        descriptiveEvidence(
          rightOperationalEvidence
        ),
    },

    issues,

    causalConclusion:
      "UNKNOWN",
  };
}