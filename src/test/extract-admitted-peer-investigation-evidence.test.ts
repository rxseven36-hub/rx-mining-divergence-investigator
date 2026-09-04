import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXEvidenceCollectionResult,
} from "../investigation/evidence-collection";

import type {
  RXExecutedPeerInvestigationRequests,
} from "../investigation/execute-resolved-peer-investigation-requests";

import {
  extractAdmittedPeerInvestigationEvidence,
} from "../investigation/extract-admitted-peer-investigation-evidence";

function createCollection(
  requestId:
    string
): RXEvidenceCollectionResult {
  return {
    requestId,

    requirementId:
      `REQ-${requestId}`,

    capability:
      "MINING_HISTORICAL_PERFORMANCE",

    status:
      "AVAILABLE",

    evidence: [
      {
        evidenceId:
          `EVIDENCE-${requestId}`,

        source:
          "SECTORS",

        sourceReference:
          `sectors:test:${requestId}`,

        truthClass:
          "SOURCE_FACT",

        description:
          `Evidence for ${requestId}`,
      },
    ],

    issues: [],

    causalConclusion:
      "UNKNOWN",
  };
}

function createExecutedAdmittedOutcome(
  requestId:
    string,
  target:
    | "FIRST_COMPANY"
    | "SECOND_COMPANY"
    | "SHARED",
  companyId:
    string | null
): Extract<
  RXExecutedPeerInvestigationRequests["outcomes"][number],
  {
    status:
      "EXECUTED";
  }
> {
  const collection =
    createCollection(
      requestId
    );

  return {
    status:
      "EXECUTED",

    routing: {
      status:
        "ROUTED",

      context: {
        requestId,

        target,

        companyId,

        sourceReference:
          `sectors:routing:${requestId}`,
      },
    },

    executionOutcome: {
      status:
        "EVIDENCE_ADMITTED",

      evidenceCollection:
        collection,
    },

    issue:
      null,

    causalConclusion:
      "UNKNOWN",
  } as never;
}

function createExecutedNonAdmittedOutcome(
  requestId:
    string
) {
  return {
    status:
      "EXECUTED",

    routing: {
      status:
        "ROUTED",

      context: {
        requestId,

        target:
          "FIRST_COMPANY",

        companyId:
          "COMPANY-A",

        sourceReference:
          `sectors:routing:${requestId}`,
      },
    },

    executionOutcome: {
      status:
        "EXECUTION_FAILED",

      evidenceCollection:
        null,
    },

    issue:
      null,

    causalConclusion:
      "UNKNOWN",
  } as never;
}

function createOuterNonExecutedOutcome(
  status:
    "SKIPPED" |
    "ROUTING_REJECTED"
) {
  return {
    status,

    executionOutcome:
      null,

    causalConclusion:
      "UNKNOWN",
  } as never;
}

function createExecution(
  outcomes:
    RXExecutedPeerInvestigationRequests["outcomes"]
): RXExecutedPeerInvestigationRequests {
  return {
    planId:
      "PLAN-001",

    caseId:
      "CASE-001",

    outcomes,

    executedCount:
      outcomes.filter(
        (outcome) =>
          outcome.status ===
          "EXECUTED"
      ).length,

    skippedCount:
      outcomes.filter(
        (outcome) =>
          outcome.status ===
          "SKIPPED"
      ).length,

    routingRejectedCount:
      outcomes.filter(
        (outcome) =>
          outcome.status ===
          "ROUTING_REJECTED"
      ).length,

    causalConclusion:
      "UNKNOWN",
  };
}

describe(
  "extractAdmittedPeerInvestigationEvidence",
  () => {
    it(
      "extracts already-admitted peer evidence with canonical routing identity",
      () => {
        const result =
          extractAdmittedPeerInvestigationEvidence(
            createExecution([
              createExecutedAdmittedOutcome(
                "REQUEST-A",
                "FIRST_COMPANY",
                "COMPANY-A"
              ),
            ])
          );

        expect(
          result.evidence
        ).toHaveLength(
          1
        );

        expect(
          result.evidence[0]
        ).toMatchObject({
          requestId:
            "REQUEST-A",

          target:
            "FIRST_COMPANY",

          companyId:
            "COMPANY-A",

          sourceReference:
            "sectors:routing:REQUEST-A",
        });
      }
    );

    it(
      "preserves the admitted evidence collection without reinterpretation",
      () => {
        const outcome =
          createExecutedAdmittedOutcome(
            "REQUEST-A",
            "FIRST_COMPANY",
            "COMPANY-A"
          );

        const execution =
          createExecution([
            outcome,
          ]);

        const result =
          extractAdmittedPeerInvestigationEvidence(
            execution
          );

        expect(
          result.evidence[0]
            ?.collection
        ).toBe(
          outcome.executionOutcome
            .evidenceCollection
        );
      }
    );

    it(
      "preserves shared peer evidence as deliberately companyless",
      () => {
        const result =
          extractAdmittedPeerInvestigationEvidence(
            createExecution([
              createExecutedAdmittedOutcome(
                "REQUEST-SHARED",
                "SHARED",
                null
              ),
            ])
          );

        expect(
          result.evidence[0]
            ?.target
        ).toBe(
          "SHARED"
        );

        expect(
          result.evidence[0]
            ?.companyId
        ).toBeNull();
      }
    );

    it(
      "excludes outer skipped and routing-rejected outcomes",
      () => {
        const result =
          extractAdmittedPeerInvestigationEvidence(
            createExecution([
              createOuterNonExecutedOutcome(
                "SKIPPED"
              ),

              createOuterNonExecutedOutcome(
                "ROUTING_REJECTED"
              ),

              createExecutedAdmittedOutcome(
                "REQUEST-A",
                "FIRST_COMPANY",
                "COMPANY-A"
              ),
            ])
          );

        expect(
          result.evidence
        ).toHaveLength(
          1
        );

        expect(
          result.evidence[0]
            ?.requestId
        ).toBe(
          "REQUEST-A"
        );
      }
    );

    it(
      "excludes executed outcomes whose inner execution did not admit evidence",
      () => {
        const result =
          extractAdmittedPeerInvestigationEvidence(
            createExecution([
              createExecutedNonAdmittedOutcome(
                "REQUEST-FAILED"
              ),

              createExecutedAdmittedOutcome(
                "REQUEST-A",
                "FIRST_COMPANY",
                "COMPANY-A"
              ),
            ])
          );

        expect(
          result.evidence.map(
            (item) =>
              item.requestId
          )
        ).toEqual([
          "REQUEST-A",
        ]);
      }
    );

    it(
      "preserves canonical execution order among admitted evidence",
      () => {
        const result =
          extractAdmittedPeerInvestigationEvidence(
            createExecution([
              createExecutedAdmittedOutcome(
                "FIRST",
                "FIRST_COMPANY",
                "COMPANY-A"
              ),

              createExecutedNonAdmittedOutcome(
                "IGNORED"
              ),

              createExecutedAdmittedOutcome(
                "SECOND",
                "SECOND_COMPANY",
                "COMPANY-B"
              ),

              createExecutedAdmittedOutcome(
                "SHARED",
                "SHARED",
                null
              ),
            ])
          );

        expect(
          result.evidence.map(
            (item) =>
              item.requestId
          )
        ).toEqual([
          "FIRST",
          "SECOND",
          "SHARED",
        ]);
      }
    );

    it(
      "derives admitted count from actual extracted evidence",
      () => {
        const execution =
          createExecution([
            createExecutedAdmittedOutcome(
              "FIRST",
              "FIRST_COMPANY",
              "COMPANY-A"
            ),

            createExecutedNonAdmittedOutcome(
              "FAILED"
            ),

            createExecutedAdmittedOutcome(
              "SECOND",
              "SECOND_COMPANY",
              "COMPANY-B"
            ),
          ]);

        execution.executedCount =
          999;

        const result =
          extractAdmittedPeerInvestigationEvidence(
            execution
          );

        expect(
          result.admittedCount
        ).toBe(
          2
        );
      }
    );

    it(
      "preserves plan and case identity",
      () => {
        const result =
          extractAdmittedPeerInvestigationEvidence(
            createExecution([])
          );

        expect(
          result.planId
        ).toBe(
          "PLAN-001"
        );

        expect(
          result.caseId
        ).toBe(
          "CASE-001"
        );
      }
    );

    it(
      "returns an empty deterministic evidence collection when nothing was admitted",
      () => {
        const result =
          extractAdmittedPeerInvestigationEvidence(
            createExecution([
              createOuterNonExecutedOutcome(
                "SKIPPED"
              ),

              createExecutedNonAdmittedOutcome(
                "FAILED"
              ),
            ])
          );

        expect(
          result.evidence
        ).toEqual([]);

        expect(
          result.admittedCount
        ).toBe(
          0
        );
      }
    );

    it(
      "does not mutate the peer execution result",
      () => {
        const execution =
          createExecution([
            createExecutedAdmittedOutcome(
              "REQUEST-A",
              "FIRST_COMPANY",
              "COMPANY-A"
            ),
          ]);

        const before =
          structuredClone(
            execution
          );

        extractAdmittedPeerInvestigationEvidence(
          execution
        );

        expect(
          execution
        ).toEqual(
          before
        );
      }
    );

    it(
      "never promotes extracted evidence into a causal conclusion",
      () => {
        const result =
          extractAdmittedPeerInvestigationEvidence(
            createExecution([
              createExecutedAdmittedOutcome(
                "REQUEST-A",
                "FIRST_COMPANY",
                "COMPANY-A"
              ),
            ])
          );

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );
  }
);
