import type {
  SectorsAdapter,
} from "../data/sectors/sectors-adapter";

import {
  executeSectorsOperation,
} from "../data/sectors/execute-sectors-operation";

import type {
  RXSectorsExecutionResult,
} from "../data/sectors/execute-sectors-operation";

import type {
  RXEvidenceCollectionResult,
} from "./evidence-collection";

import type {
  RXPreparedInvestigationRequest,
} from "./prepare-investigation-requests";

import {
  admitMiningHistoricalPerformanceEvidence,
} from "./admit-mining-historical-performance-evidence";

import {
  admitMiningOperationalContextEvidence,
} from "./admit-mining-operational-context-evidence";

import {
  admitCommodityPriceEvidence,
} from "./admit-commodity-price-evidence";

export interface RXPreparedInvestigationExecutionContext {
  companyId: string;

  /**
   * Human/audit-readable reference to the Sectors
   * source being collected.
   *
   * This is not interpreted as evidence until the
   * capability-specific admission boundary accepts
   * the executed payload.
   */
  sourceReference: string;

  retrievedAt?: string;
}

export type RXPreparedInvestigationExecutionOutcome =
  | {
      status: "SKIPPED";

      preparedRequest:
        RXPreparedInvestigationRequest;

      execution: null;

      evidenceCollection: null;

      issue:
        "PREPARED_REQUEST_REJECTED";

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "EXECUTION_REJECTED";

      preparedRequest:
        RXPreparedInvestigationRequest;

      execution:
        Extract<
          RXSectorsExecutionResult<unknown>,
          {
            status: "REJECTED";
          }
        >;

      evidenceCollection: null;

      issue:
        "SECTORS_EXECUTION_REJECTED";

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "EXECUTION_FAILED";

      preparedRequest:
        RXPreparedInvestigationRequest;

      execution:
        Extract<
          RXSectorsExecutionResult<unknown>,
          {
            status: "FAILED";
          }
        >;

      evidenceCollection: null;

      issue:
        "SECTORS_EXECUTION_FAILED";

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "EVIDENCE_ADMITTED";

      preparedRequest:
        RXPreparedInvestigationRequest;

      execution:
        Extract<
          RXSectorsExecutionResult<unknown>,
          {
            status: "EXECUTED";
          }
        >;

      evidenceCollection:
        RXEvidenceCollectionResult;

      issue: null;

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "EVIDENCE_REJECTED";

      preparedRequest:
        RXPreparedInvestigationRequest;

      execution:
        Extract<
          RXSectorsExecutionResult<unknown>,
          {
            status: "EXECUTED";
          }
        >;

      evidenceCollection:
        RXEvidenceCollectionResult;

      issue: null;

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "ADMISSION_NOT_SUPPORTED";

      preparedRequest:
        RXPreparedInvestigationRequest;

      execution:
        Extract<
          RXSectorsExecutionResult<unknown>,
          {
            status: "EXECUTED";
          }
        >;

      evidenceCollection: null;

      issue:
        "CAPABILITY_ADMISSION_NOT_SUPPORTED";

      causalConclusion:
        "UNKNOWN";
    };

export async function executePreparedInvestigationRequest(
  adapter:
    SectorsAdapter,
  preparedRequest:
    RXPreparedInvestigationRequest,
  context:
    RXPreparedInvestigationExecutionContext
): Promise<
  RXPreparedInvestigationExecutionOutcome
> {
  /**
   * Preparation rejection is a hard boundary.
   *
   * No operation exists and the Sectors adapter
   * must never be called.
   */
  if (
    preparedRequest.status ===
    "REJECTED"
  ) {
    return {
      status:
        "SKIPPED",

      preparedRequest,

      execution: null,

      evidenceCollection: null,

      issue:
        "PREPARED_REQUEST_REJECTED",

      causalConclusion:
        "UNKNOWN",
    };
  }

  const execution =
    await executeSectorsOperation<unknown>(
      adapter,
      preparedRequest.operation
    );

  /**
   * Compile/operation rejection belongs to the
   * execution layer.
   *
   * It is NOT evidence unavailability.
   */
  if (
    execution.status ===
    "REJECTED"
  ) {
    return {
      status:
        "EXECUTION_REJECTED",

      preparedRequest,

      execution,

      evidenceCollection: null,

      issue:
        "SECTORS_EXECUTION_REJECTED",

      causalConclusion:
        "UNKNOWN",
    };
  }

  /**
   * Network, HTTP, credit-budget, invalid JSON,
   * and other adapter failures remain execution
   * failures.
   *
   * Never reinterpret them as NO_DATA.
   */
  if (
    execution.status ===
    "FAILED"
  ) {
    return {
      status:
        "EXECUTION_FAILED",

      preparedRequest,

      execution,

      evidenceCollection: null,

      issue:
        "SECTORS_EXECUTION_FAILED",

      causalConclusion:
        "UNKNOWN",
    };
  }

  /**
   * HTTP/transport execution success only grants
   * the payload permission to enter an admission
   * boundary.
   *
   * EXECUTED does NOT mean evidence is valid.
   */
  switch (
    preparedRequest.request.capability
  ) {
    case "MINING_HISTORICAL_PERFORMANCE": {
      const admission =
        admitMiningHistoricalPerformanceEvidence({
          request:
            preparedRequest.request,

          companyId:
            context.companyId,

          sourceReference:
            context.sourceReference,

          payload:
            execution.data,

          retrievedAt:
            context.retrievedAt,
        });

      return {
        status:
          admission.status ===
          "ADMITTED"
            ? "EVIDENCE_ADMITTED"
            : "EVIDENCE_REJECTED",

        preparedRequest,

        execution,

        evidenceCollection:
          admission.collection,

        issue: null,

        causalConclusion:
          "UNKNOWN",
      };
    }

    case "MINING_OPERATIONAL_CONTEXT": {
      const admission =
        admitMiningOperationalContextEvidence({
          request:
            preparedRequest.request,

          companyId:
            context.companyId,

          sourceReference:
            context.sourceReference,

          payload:
            execution.data,

          retrievedAt:
            context.retrievedAt,
        });

      return {
        status:
          admission.status ===
          "ADMITTED"
            ? "EVIDENCE_ADMITTED"
            : "EVIDENCE_REJECTED",

        preparedRequest,

        execution,

        evidenceCollection:
          admission.collection,

        issue: null,

        causalConclusion:
          "UNKNOWN",
      };
    }

    case "COMMODITY_PRICE_HISTORY": {
      /**
       * Commodity and temporal relationship are taken
       * from the prepared typed operation itself.
       *
       * Do not derive either value from company context
       * or from the returned payload.
       */
      if (
        preparedRequest.operation.operation !==
        "GET_COMMODITY_PRICE_HISTORY"
      ) {
        return {
          status:
            "EVIDENCE_REJECTED",

          preparedRequest,

          execution,

          evidenceCollection: null as never,

          issue: null,

          causalConclusion:
            "UNKNOWN",
        };
      }

      const admission =
        admitCommodityPriceEvidence({
          request:
            preparedRequest.request,

          requestedCommodity:
            preparedRequest.operation.params
              .commodity,

          requestedPeriod:
            preparedRequest.operation.params
              .period,

          sourceReference:
            context.sourceReference,

          payload:
            execution.data,

          retrievedAt:
            context.retrievedAt,
        });

      return {
        status:
          admission.status ===
          "ADMITTED"
            ? "EVIDENCE_ADMITTED"
            : "EVIDENCE_REJECTED",

        preparedRequest,

        execution,

        evidenceCollection:
          admission.collection,

        issue: null,

        causalConclusion:
          "UNKNOWN",
      };
    }

    case "COMPANY_MARKET_TRANSACTION_HISTORY":
      /**
       * Market transaction history has an executable
       * Sectors operation, but its evidence admission
       * contract is not yet activated.
       *
       * Do not manufacture generic evidence.
       */
      return {
        status:
          "ADMISSION_NOT_SUPPORTED",

        preparedRequest,

        execution,

        evidenceCollection: null,

        issue:
          "CAPABILITY_ADMISSION_NOT_SUPPORTED",

        causalConclusion:
          "UNKNOWN",
      };
  }
}