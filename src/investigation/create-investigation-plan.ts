import type {
  RXInvestigationCapability,
} from "./capability";
import type {
  RXInvestigationCase,
} from "./investigation-case";

import type {
  RXInvestigationPlan,
  RXInvestigationQuestion,
  RXEvidenceRequirement,
  RXInvestigationDataRequest,
} from "./investigation-plan";

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
  id: string,
  kind:
    RXInvestigationQuestion["kind"],
  text: string
): RXInvestigationQuestion {
  return {
    questionId: id,
    kind,
    question: text,
    causalClaim: "NONE",
  };
}

function requirement(
  requirementId: string,
  questionId: string,
  kind:
    RXEvidenceRequirement["kind"],
  description: string,
  required: boolean
): RXEvidenceRequirement {
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
  capability: RXInvestigationCapability,
  purpose: string
): RXInvestigationDataRequest {
  return {
    requestId,
    requirementId,
    source: "SECTORS",
    capability,
    purpose,
    status: "PLANNED",
  };
}

/**
 * Creates the deterministic baseline investigation plan
 * for the first RX detector.
 *
 * IMPORTANT:
 * - No API call occurs here.
 * - No LLM call occurs here.
 * - No cause is inferred here.
 * - Capabilities are logical data needs, not raw endpoints.
 */
export function createInvestigationPlan(
  investigationCase:
    RXInvestigationCase
): RXInvestigationPlan {
  const prefix =
    normalizeIdPart(
      investigationCase.caseId
    );

  const questions:
    RXInvestigationQuestion[] = [
      question(
        `${prefix}-Q1`,
        "OPERATIONAL_CONTEXT",
        "What operational evidence can explain or challenge the detected production-versus-sales divergence?"
      ),

      question(
        `${prefix}-Q2`,
        "HISTORICAL_COMPARISON",
        "Is the detected production-versus-sales divergence unusual relative to comparable historical periods?"
      ),

      question(
        `${prefix}-Q3`,
        "COMMODITY_CONTEXT",
        "What commodity context coincides with the detected divergence?"
      ),

      question(
        `${prefix}-Q4`,
        "MARKET_REACTION",
        "What market reaction, if any, coincides with the detected divergence period?"
      ),
    ];

  const evidenceRequirements:
    RXEvidenceRequirement[] = [
      requirement(
        `${prefix}-E1`,
        `${prefix}-Q1`,
        "COMPANY_OPERATIONAL",
        "Comparable company operational evidence for the same commodity and relevant period.",
        true
      ),

      requirement(
        `${prefix}-E2`,
        `${prefix}-Q2`,
        "HISTORICAL_PERFORMANCE",
        "Comparable production and sales observations from prior periods.",
        true
      ),

      requirement(
        `${prefix}-E3`,
        `${prefix}-Q3`,
        "COMMODITY_PRICE",
        "Commodity price context aligned to the relevant period where coverage exists.",
        false
      ),

      requirement(
        `${prefix}-E4`,
        `${prefix}-Q4`,
        "MARKET_TRANSACTION",
        "Company market transaction context aligned to the relevant period where coverage exists.",
        false
      ),
    ];

  const dataRequests:
    RXInvestigationDataRequest[] = [
      request(
        `${prefix}-R1`,
        `${prefix}-E1`,
        "MINING_OPERATIONAL_CONTEXT",
        "Collect operational evidence relevant to the detected divergence."
      ),

      request(
        `${prefix}-R2`,
        `${prefix}-E2`,
        "MINING_HISTORICAL_PERFORMANCE",
        "Collect comparable historical production and sales evidence."
      ),

      request(
        `${prefix}-R3`,
        `${prefix}-E3`,
        "COMMODITY_PRICE_HISTORY",
        "Collect commodity price context without asserting causality."
      ),

      request(
        `${prefix}-R4`,
        `${prefix}-E4`,
        "COMPANY_MARKET_TRANSACTION_HISTORY",
        "Collect market reaction context without asserting causality."
      ),
    ];

  return {
    planId:
      `PLAN-${prefix}`,

    caseId:
      investigationCase.caseId,

    status: "PLANNED",

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