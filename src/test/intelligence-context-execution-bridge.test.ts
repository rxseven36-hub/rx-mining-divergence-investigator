import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXPreparedInvestigationExecutionResult,
} from "../investigation/execute-prepared-investigation";

import type {
  RXPreparedInvestigationExecutionOutcome,
} from "../investigation/execute-prepared-investigation-request";

import type {
  RXInvestigationCapability,
} from "../investigation/capability";

import type {
  RXEvidenceCollectionResult,
} from "../investigation/evidence-collection";

import {
  createRXIntelligenceContextFromExecution,
} from "../intelligence/context/create-intelligence-context-from-execution";

function createCollection(
  capability:
    RXInvestigationCapability,
  status:
    RXEvidenceCollectionResult["status"] =
      "AVAILABLE"
): RXEvidenceCollectionResult {
  return {
    requestId:
      `REQUEST-${capability}`,

    requirementId:
      `REQUIREMENT-${capability}`,

    capability,

    status,

    evidence:
      status === "AVAILABLE"
        ? [
            {
              evidenceId:
                `EVIDENCE-${capability}`,

              source:
                "SECTORS",

              sourceReference:
                `sectors:${capability}`,

              truthClass:
                "SOURCE_FACT",

              description:
                `Evidence for ${capability}`,
            },
          ]
        : [],

    issues:
      status === "AVAILABLE"
        ? []
        : ["NO_DATA"],

    causalConclusion:
      "UNKNOWN",
  };
}

function createPreparedRequest(
  capability:
    RXInvestigationCapability
): RXPreparedInvestigationExecutionOutcome["preparedRequest"] {
  return {
    status:
      "REJECTED",

    request: {
      requestId:
        `REQUEST-${capability}`,

      requirementId:
        `REQUIREMENT-${capability}`,

      source:
        "SECTORS",

      capability,

      purpose:
        `Collect ${capability}`,

      status:
        "PLANNED",
    },

    executionDecision: {
      requestId:
        `REQUEST-${capability}`,

      requirementId:
        `REQUIREMENT-${capability}`,

      capability,

      status:
        "REJECTED",

      issues: [
        "REQUEST_NOT_PLANNED",
      ],

      causalConclusion:
        "UNKNOWN",
    },

    operation:
      null,

    bindingIssues: [],
  };
}

function createAdmittedOutcome(
  capability:
    RXInvestigationCapability,
  collectionStatus:
    RXEvidenceCollectionResult["status"] =
      "AVAILABLE"
): RXPreparedInvestigationExecutionOutcome {
  return {
    status:
      "EVIDENCE_ADMITTED",

    preparedRequest:
      createPreparedRequest(
        capability
      ),

    execution: {
      status:
        "EXECUTED",

      request: {
        operation:
          "GET_MINING_OPERATIONAL_CONTEXT",

        params: {
          sectorsSlug:
            "test-company",
        },
      },

      data: {
        raw:
          "must-not-be-used-by-context-bridge",
      },

      estimatedCreditCost:
        1,
    } as never,

    evidenceCollection:
      createCollection(
        capability,
        collectionStatus
      ),

    issue:
      null,

    causalConclusion:
      "UNKNOWN",
  };
}

function createSkippedOutcome(
  capability:
    RXInvestigationCapability
): RXPreparedInvestigationExecutionOutcome {
  return {
    status:
      "SKIPPED",

    preparedRequest:
      createPreparedRequest(
        capability
      ),

    execution:
      null,

    evidenceCollection:
      null,

    issue:
      "PREPARED_REQUEST_REJECTED",

    causalConclusion:
      "UNKNOWN",
  };
}

function createExecutionResult(
  outcomes:
    RXPreparedInvestigationExecutionOutcome[]
): RXPreparedInvestigationExecutionResult {
  return {
    planId:
      "PLAN-1",

    caseId:
      "CASE-1",

    outcomes,

    summary: {
      totalCount:
        outcomes.length,

      evidenceAdmittedCount:
        outcomes.filter(
          (outcome) =>
            outcome.status ===
            "EVIDENCE_ADMITTED"
        ).length,

      evidenceRejectedCount:
        outcomes.filter(
          (outcome) =>
            outcome.status ===
            "EVIDENCE_REJECTED"
        ).length,

      executionFailedCount:
        outcomes.filter(
          (outcome) =>
            outcome.status ===
            "EXECUTION_FAILED"
        ).length,

      executionRejectedCount:
        outcomes.filter(
          (outcome) =>
            outcome.status ===
            "EXECUTION_REJECTED"
        ).length,

      skippedCount:
        outcomes.filter(
          (outcome) =>
            outcome.status ===
            "SKIPPED"
        ).length,

      admissionNotSupportedCount:
        outcomes.filter(
          (outcome) =>
            outcome.status ===
            "ADMISSION_NOT_SUPPORTED"
        ).length,
    },

    causalConclusion:
      "UNKNOWN",
  };
}

const subject = {
  companyId:
    "company-aadi",

  commodity:
    "Coal",

  periodLabel:
    "2024",
};

describe(
  "createRXIntelligenceContextFromExecution",
  () => {
    it(
      "maps all admitted capabilities to their intelligence scopes",
      () => {
        const execution =
          createExecutionResult([
            createAdmittedOutcome(
              "MINING_OPERATIONAL_CONTEXT"
            ),

            createAdmittedOutcome(
              "MINING_HISTORICAL_PERFORMANCE"
            ),

            createAdmittedOutcome(
              "COMMODITY_PRICE_HISTORY"
            ),

            createAdmittedOutcome(
              "COMPANY_MARKET_TRANSACTION_HISTORY"
            ),
          ]);

        const result =
          createRXIntelligenceContextFromExecution({
            subject,
            execution,
          });

        expect(
          result.evidenceGroups.map(
            (group) =>
              group.scope
          )
        ).toEqual([
          "OPERATIONAL",
          "HISTORICAL",
          "COMMODITY",
          "MARKET",
        ]);
      }
    );

    it(
      "excludes outcomes that were not evidence admitted",
      () => {
        const execution =
          createExecutionResult([
            createAdmittedOutcome(
              "MINING_OPERATIONAL_CONTEXT"
            ),

            createSkippedOutcome(
              "MINING_HISTORICAL_PERFORMANCE"
            ),
          ]);

        const result =
          createRXIntelligenceContextFromExecution({
            subject,
            execution,
          });

        expect(
          result.evidenceGroups
        ).toHaveLength(1);

        expect(
          result.evidenceGroups[0]
            ?.scope
        ).toBe(
          "OPERATIONAL"
        );
      }
    );

    it(
      "preserves admitted evidence truth class",
      () => {
        const execution =
          createExecutionResult([
            createAdmittedOutcome(
              "MINING_OPERATIONAL_CONTEXT"
            ),
          ]);

        const result =
          createRXIntelligenceContextFromExecution({
            subject,
            execution,
          });

        expect(
          result.evidenceGroups[0]
            ?.collection.evidence[0]
            ?.truthClass
        ).toBe(
          "SOURCE_FACT"
        );
      }
    );

    it(
      "relies on the intelligence context boundary to reject non-available collections",
      () => {
        const execution =
          createExecutionResult([
            createAdmittedOutcome(
              "COMMODITY_PRICE_HISTORY",
              "UNAVAILABLE"
            ),
          ]);

        const result =
          createRXIntelligenceContextFromExecution({
            subject,
            execution,
          });

        expect(
          result.evidenceGroups
        ).toEqual([]);
      }
    );

    it(
      "does not mutate the execution result",
      () => {
        const execution =
          createExecutionResult([
            createAdmittedOutcome(
              "MINING_OPERATIONAL_CONTEXT"
            ),
          ]);

        const original =
          structuredClone(
            execution
          );

        createRXIntelligenceContextFromExecution({
          subject,
          execution,
        });

        expect(
          execution
        ).toEqual(
          original
        );
      }
    );

    it(
      "never manufactures a causal conclusion",
      () => {
        const execution =
          createExecutionResult([
            createAdmittedOutcome(
              "MINING_OPERATIONAL_CONTEXT"
            ),
          ]);

        const result =
          createRXIntelligenceContextFromExecution({
            subject,
            execution,
          });

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );

        expect(
          result.evidenceGroups[0]
            ?.relationship
        ).toBe(
          "ADMITTED_FOR_CONTEXT"
        );
      }
    );
  }
);