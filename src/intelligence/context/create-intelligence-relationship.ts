import type {
  RXSectorsTypedOperationRequest,
} from "../../data/sectors/sectors-operation-request";

import type {
  RXIntelligenceSubject,
} from "./intelligence-context";

import type {
  RXTypedIntelligenceEvidence,
} from "./typed-intelligence-evidence";

import type {
  RXIntelligenceEvidenceRelationship,
  RXIntelligenceRelationshipIssue,
  RXIntelligenceRelationshipKind,
} from "./intelligence-relationship";

export interface CreateRXIntelligenceRelationshipInput {
  subject:
    RXIntelligenceSubject;

  evidence:
    RXTypedIntelligenceEvidence;

  operation:
    RXSectorsTypedOperationRequest;
}

function cloneSubject(
  subject:
    RXIntelligenceSubject
): RXIntelligenceSubject {
  return {
    ...subject,
  };
}

function canonicalizeIdxSymbol(
  symbol:
    string
): string {
  const normalized =
    symbol
      .trim()
      .toUpperCase();

  return normalized.endsWith(".JK")
    ? normalized.slice(
        0,
        -3
      )
    : normalized;
}

function symbolsMatch(
  left:
    string,
  right:
    string
): boolean {
  const canonicalLeft =
    canonicalizeIdxSymbol(
      left
    );

  const canonicalRight =
    canonicalizeIdxSymbol(
      right
    );

  return (
    canonicalLeft.length > 0 &&
    canonicalRight.length > 0 &&
    canonicalLeft ===
      canonicalRight
  );
}

function rejectRelationship(
  input:
    CreateRXIntelligenceRelationshipInput,
  issue:
    RXIntelligenceRelationshipIssue
): RXIntelligenceEvidenceRelationship {
  return {
    status:
      "REJECTED",

    relationship:
      null,

    subject:
      cloneSubject(
        input.subject
      ),

    evidence:
      null,

    operation:
      structuredClone(
        input.operation
      ),

    issues: [
      issue,
    ],

    causalConclusion:
      "UNKNOWN",
  };
}

function createRelatedEvidence(
  input:
    CreateRXIntelligenceRelationshipInput,
  relationship:
    RXIntelligenceRelationshipKind
): RXIntelligenceEvidenceRelationship {
  return {
    status:
      "RELATED",

    relationship,

    subject:
      cloneSubject(
        input.subject
      ),

    evidence:
      structuredClone(
        input.evidence
      ),

    operation:
      structuredClone(
        input.operation
      ),

    issues:
      [],

    causalConclusion:
      "UNKNOWN",
  };
}

export function createRXIntelligenceRelationship(
  input:
    CreateRXIntelligenceRelationshipInput
): RXIntelligenceEvidenceRelationship {
  switch (input.evidence.kind) {
    case "OPERATIONAL_FACT": {
      if (
        input.operation.operation !==
        "GET_MINING_OPERATIONAL_CONTEXT"
      ) {
        return rejectRelationship(
          input,
          "EVIDENCE_OPERATION_MISMATCH"
        );
      }

      if (
        input.evidence.companyId !==
        input.subject.companyId
      ) {
        return rejectRelationship(
          input,
          "COMPANY_MISMATCH"
        );
      }

      return createRelatedEvidence(
        input,
        "DIRECT_COMPANY"
      );
    }

    case "PERFORMANCE_OBSERVATION": {
      if (
        input.operation.operation !==
        "GET_MINING_HISTORICAL_PERFORMANCE"
      ) {
        return rejectRelationship(
          input,
          "EVIDENCE_OPERATION_MISMATCH"
        );
      }

      if (
        input.evidence.observation.companyId !==
        input.subject.companyId
      ) {
        return rejectRelationship(
          input,
          "COMPANY_MISMATCH"
        );
      }

      if (
        input.evidence.observation.commodity !==
        input.subject.commodity
      ) {
        return rejectRelationship(
          input,
          "COMMODITY_MISMATCH"
        );
      }

      return createRelatedEvidence(
        input,
        "DIRECT_COMPANY"
      );
    }

    case "COMMODITY_OBSERVATION": {
      if (
        input.operation.operation !==
        "GET_COMMODITY_PRICE_HISTORY"
      ) {
        return rejectRelationship(
          input,
          "EVIDENCE_OPERATION_MISMATCH"
        );
      }

      if (
        input.operation.params.commodity !==
          input.subject.commodity ||
        input.evidence.observation.commodity !==
          input.operation.params.commodity
      ) {
        return rejectRelationship(
          input,
          "COMMODITY_MISMATCH"
        );
      }

      return createRelatedEvidence(
        input,
        "COMMODITY_CONTEXT"
      );
    }

    case "MARKET_OBSERVATION": {
      if (
        input.operation.operation !==
        "GET_COMPANY_MARKET_TRANSACTION_HISTORY"
      ) {
        return rejectRelationship(
          input,
          "EVIDENCE_OPERATION_MISMATCH"
        );
      }

      if (
        !symbolsMatch(
          input.operation.params.ticker,
          input.evidence.observation.symbol
        )
      ) {
        return rejectRelationship(
          input,
          "MARKET_SYMBOL_MISMATCH"
        );
      }

      return createRelatedEvidence(
        input,
        "MARKET_CONTEXT"
      );
    }
  }
}