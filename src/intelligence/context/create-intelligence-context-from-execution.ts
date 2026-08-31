import type {
  RXPreparedInvestigationExecutionResult,
} from "../../investigation/execute-prepared-investigation";

import type {
  RXInvestigationCapability,
} from "../../investigation/capability";

import type {
  RXIntelligenceContext,
  RXIntelligenceEvidenceScope,
  RXIntelligenceSubject,
} from "./intelligence-context";

import {
  createRXIntelligenceContext,
} from "./create-intelligence-context";

function mapCapabilityToScope(
  capability:
    RXInvestigationCapability
): RXIntelligenceEvidenceScope {
  switch (capability) {
    case "MINING_OPERATIONAL_CONTEXT":
      return "OPERATIONAL";

    case "MINING_HISTORICAL_PERFORMANCE":
      return "HISTORICAL";

    case "COMMODITY_PRICE_HISTORY":
      return "COMMODITY";

    case "COMPANY_MARKET_TRANSACTION_HISTORY":
      return "MARKET";
  }
}

export interface CreateRXIntelligenceContextFromExecutionInput {
  subject:
    RXIntelligenceSubject;

  execution:
    RXPreparedInvestigationExecutionResult;
}

/**
 * Bridges whole-investigation execution outcomes into the
 * deterministic intelligence-context boundary.
 *
 * This function:
 * - consumes only already-produced execution outcomes,
 * - admits only EVIDENCE_ADMITTED outcomes,
 * - does not inspect raw execution payloads,
 * - does not re-run evidence admission,
 * - does not infer relationships or causality.
 */
export function createRXIntelligenceContextFromExecution(
  input:
    CreateRXIntelligenceContextFromExecutionInput
): RXIntelligenceContext {
  const evidence =
    input.execution.outcomes.flatMap(
      (outcome) => {
        if (
          outcome.status !==
            "EVIDENCE_ADMITTED"
        ) {
          return [];
        }

        return [
          {
            scope:
              mapCapabilityToScope(
                outcome.preparedRequest
                  .request.capability
              ),

            admissionStatus:
              "ADMITTED" as const,

            collection:
              outcome.evidenceCollection,
          },
        ];
      }
    );

  return createRXIntelligenceContext({
    subject:
      input.subject,

    evidence,
  });
}