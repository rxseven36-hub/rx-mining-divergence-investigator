import type {
  RXPeerInvestigationCase,
} from "./peer-investigation-case";

import type {
  RXInvestigationCapability,
} from "./capability";

import type {
  RXPeerInvestigationPlan,
  RXPeerInvestigationQuestion,
  RXPeerEvidenceRequirement,
  RXPeerInvestigationDataRequest,
  RXPeerInvestigationTarget,
} from "./peer-investigation-plan";

function normalizeIdPart(
  value: string
): string {
  return value
    .trim()
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();
}

function question(
  questionId: string,
  kind:
    RXPeerInvestigationQuestion["kind"],
  text: string
): RXPeerInvestigationQuestion {
  return {
    questionId,
    kind,
    question: text,
    causalClaim: "NONE",
  };
}

function requirement(
  requirementId: string,
  questionId: string,
  kind:
    RXPeerEvidenceRequirement["kind"],
  description: string,
  required: boolean
): RXPeerEvidenceRequirement {
  return {
    requirementId,
    questionId,
    kind,
    description,
    required,
  };
}

function request(
  requestId: string,
  requirementId: string,
  capability:
    RXInvestigationCapability,
  purpose: string,
  target:
    RXPeerInvestigationTarget,
  targetCompanyId:
    string | null
): RXPeerInvestigationDataRequest {
  return {
    requestId,
    requirementId,
    source: "SECTORS",
    capability,
    purpose,
    status: "PLANNED",
    target,
    targetCompanyId,
  };
}

/**
 * Creates the deterministic baseline investigation plan
 * for a canonical peer divergence case.
 *
 * IMPORTANT:
 * - No API call occurs here.
 * - No LLM call occurs here.
 * - No request binding occurs here.
 * - No request execution occurs here.
 * - No evidence is collected here.
 * - No materiality or causality is inferred here.
 *
 * Company-specific evidence requirements are bilateral.
 * Commodity context is shared by the comparison.
 */
export function createPeerInvestigationPlan(
  investigationCase:
    RXPeerInvestigationCase
): RXPeerInvestigationPlan {
  const prefix =
    normalizeIdPart(
      investigationCase.caseId
    );

  const firstCompanyId =
    investigationCase.subject
      .firstCompanyId;

  const secondCompanyId =
    investigationCase.subject
      .secondCompanyId;

  const questions:
    RXPeerInvestigationQuestion[] = [
      question(
        `${prefix}-Q1`,
        "BILATERAL_OPERATIONAL_CONTEXT",
        "What operational evidence from both companies can explain or challenge the observed peer divergence?"
      ),

      question(
        `${prefix}-Q2`,
        "BILATERAL_HISTORICAL_CONTEXT",
        "Is the observed peer divergence persistent or unusual across comparable historical periods for both companies?"
      ),

      question(
        `${prefix}-Q3`,
        "SHARED_COMMODITY_CONTEXT",
        "What shared commodity context coincides with the observed peer divergence?"
      ),

      question(
        `${prefix}-Q4`,
        "BILATERAL_MARKET_CONTEXT",
        "What market reaction context for each company, if any, coincides with the peer divergence period?"
      ),
    ];

  const evidenceRequirements:
    RXPeerEvidenceRequirement[] = [
      requirement(
        `${prefix}-E1`,
        `${prefix}-Q1`,
        "FIRST_COMPANY_OPERATIONAL",
        "Operational evidence for the first canonical peer company aligned to the relevant commodity and period.",
        true
      ),

      requirement(
        `${prefix}-E2`,
        `${prefix}-Q1`,
        "SECOND_COMPANY_OPERATIONAL",
        "Operational evidence for the second canonical peer company aligned to the relevant commodity and period.",
        true
      ),

      requirement(
        `${prefix}-E3`,
        `${prefix}-Q2`,
        "FIRST_COMPANY_HISTORICAL",
        "Comparable historical performance evidence for the first canonical peer company.",
        true
      ),

      requirement(
        `${prefix}-E4`,
        `${prefix}-Q2`,
        "SECOND_COMPANY_HISTORICAL",
        "Comparable historical performance evidence for the second canonical peer company.",
        true
      ),

      requirement(
        `${prefix}-E5`,
        `${prefix}-Q3`,
        "SHARED_COMMODITY_PRICE",
        "Commodity price context shared by the peer comparison where coverage exists.",
        false
      ),

      requirement(
        `${prefix}-E6`,
        `${prefix}-Q4`,
        "FIRST_COMPANY_MARKET",
        "Market transaction context for the first canonical peer company where coverage exists.",
        false
      ),

      requirement(
        `${prefix}-E7`,
        `${prefix}-Q4`,
        "SECOND_COMPANY_MARKET",
        "Market transaction context for the second canonical peer company where coverage exists.",
        false
      ),
    ];

  const dataRequests:
    RXPeerInvestigationDataRequest[] = [
      request(
        `${prefix}-R1`,
        `${prefix}-E1`,
        "MINING_OPERATIONAL_CONTEXT",
        "Collect operational context for the first canonical peer company.",
        "FIRST_COMPANY",
        firstCompanyId
      ),

      request(
        `${prefix}-R2`,
        `${prefix}-E2`,
        "MINING_OPERATIONAL_CONTEXT",
        "Collect operational context for the second canonical peer company.",
        "SECOND_COMPANY",
        secondCompanyId
      ),

      request(
        `${prefix}-R3`,
        `${prefix}-E3`,
        "MINING_HISTORICAL_PERFORMANCE",
        "Collect comparable historical performance for the first canonical peer company.",
        "FIRST_COMPANY",
        firstCompanyId
      ),

      request(
        `${prefix}-R4`,
        `${prefix}-E4`,
        "MINING_HISTORICAL_PERFORMANCE",
        "Collect comparable historical performance for the second canonical peer company.",
        "SECOND_COMPANY",
        secondCompanyId
      ),

      request(
        `${prefix}-R5`,
        `${prefix}-E5`,
        "COMMODITY_PRICE_HISTORY",
        "Collect shared commodity price context without asserting causality.",
        "SHARED",
        null
      ),

      request(
        `${prefix}-R6`,
        `${prefix}-E6`,
        "COMPANY_MARKET_TRANSACTION_HISTORY",
        "Collect market context for the first canonical peer company without asserting causality.",
        "FIRST_COMPANY",
        firstCompanyId
      ),

      request(
        `${prefix}-R7`,
        `${prefix}-E7`,
        "COMPANY_MARKET_TRANSACTION_HISTORY",
        "Collect market context for the second canonical peer company without asserting causality.",
        "SECOND_COMPANY",
        secondCompanyId
      ),
    ];

  return {
    planId:
      `PEER-PLAN-${prefix}`,

    caseId:
      investigationCase.caseId,

    status:
      "PLANNED",

    questions,

    evidenceRequirements,

    dataRequests,

    stopConditions: [
      "REQUIRED_EVIDENCE_COLLECTED",
      "REQUIRED_EVIDENCE_UNAVAILABLE",
      "REQUEST_BUDGET_REACHED",
    ],

    causalConclusion:
      "UNKNOWN",
  };
}