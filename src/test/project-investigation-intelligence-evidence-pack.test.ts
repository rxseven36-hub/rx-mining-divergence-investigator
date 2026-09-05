import {
  describe,
  expect,
  it,
} from "vitest";

import {
  projectInvestigationIntelligenceEvidencePack,
} from "../intelligence/context/project-investigation-intelligence-evidence-pack";

import type {
  RXPreparedInvestigationExecutionResult,
} from "../investigation/execute-prepared-investigation";

function createExecution():
  RXPreparedInvestigationExecutionResult {
  return {
    planId:
      "PLAN-COMPANY-1",

    caseId:
      "CASE-COMPANY-1",

    outcomes: [
      {
        status:
          "EVIDENCE_ADMITTED",

        preparedRequest:
          {} as never,

        execution:
          {} as never,

        evidenceCollection: {
          requestId:
            "REQUEST-1",

          requirementId:
            "REQUIREMENT-1",

          capability:
            "MINING_OPERATIONAL_CONTEXT",

          status:
            "AVAILABLE",

          evidence: [
            {
              evidenceId:
                "EVIDENCE-1",

              source:
                "SECTORS",

              sourceReference:
                "source:1",

              truthClass:
                "SOURCE_FACT",

              description:
                "First admitted evidence.",
            },
            {
              evidenceId:
                "EVIDENCE-2",

              source:
                "SECTORS",

              sourceReference:
                "source:2",

              truthClass:
                "COMPUTED_FACT",

              description:
                "Second admitted evidence.",
            },
          ],

          issues: [],

          causalConclusion:
            "UNKNOWN",
        },

        issue:
          null,

        causalConclusion:
          "UNKNOWN",
      },

      {
        status:
          "EVIDENCE_REJECTED",

        preparedRequest:
          {} as never,

        execution:
          {} as never,

        evidenceCollection: {
          requestId:
            "REQUEST-REJECTED",

          requirementId:
            "REQUIREMENT-REJECTED",

          capability:
            "MINING_HISTORICAL_PERFORMANCE",

          status:
            "INVALID",

          evidence: [
            {
              evidenceId:
                "EVIDENCE-REJECTED",

              source:
                "SECTORS",

              sourceReference:
                "source:rejected",

              truthClass:
                "SOURCE_FACT",

              description:
                "Rejected evidence must not be projected.",
            },
          ],

          issues: [
            "INVALID_RESPONSE",
          ],

          causalConclusion:
            "UNKNOWN",
        },

        issue:
          null,

        causalConclusion:
          "UNKNOWN",
      },
    ],

    summary: {
      totalCount:
        2,

      evidenceAdmittedCount:
        1,

      evidenceRejectedCount:
        1,

      executionFailedCount:
        0,

      executionRejectedCount:
        0,

      skippedCount:
        0,

      admissionNotSupportedCount:
        0,
    },

    causalConclusion:
      "UNKNOWN",
  };
}

describe(
  "projectInvestigationIntelligenceEvidencePack",
  () => {
    it(
      "projects only admitted evidence with exact request and company lineage in deterministic order",
      () => {
        const result =
          projectInvestigationIntelligenceEvidencePack({
            companyId:
              "COMPANY-A",

            execution:
              createExecution(),
          });

        expect(result)
          .toEqual({
            planId:
              "PLAN-COMPANY-1",

            caseId:
              "CASE-COMPANY-1",

            evidence: [
              {
                evidenceId:
                  "EVIDENCE-1",

                requestId:
                  "REQUEST-1",

                companyId:
                  "COMPANY-A",

                source:
                  "SECTORS",

                sourceReference:
                  "source:1",

                truthClass:
                  "SOURCE_FACT",

                description:
                  "First admitted evidence.",
              },
              {
                evidenceId:
                  "EVIDENCE-2",

                requestId:
                  "REQUEST-1",

                companyId:
                  "COMPANY-A",

                source:
                  "SECTORS",

                sourceReference:
                  "source:2",

                truthClass:
                  "COMPUTED_FACT",

                description:
                  "Second admitted evidence.",
              },
            ],

            causalConclusion:
              "UNKNOWN",
          });
      }
    );

    it(
      "preserves an empty neutral evidence set when no evidence is admitted",
      () => {
        const execution =
          createExecution();

        execution.outcomes =
          [];

        execution.summary = {
          totalCount:
            0,

          evidenceAdmittedCount:
            0,

          evidenceRejectedCount:
            0,

          executionFailedCount:
            0,

          executionRejectedCount:
            0,

          skippedCount:
            0,

          admissionNotSupportedCount:
            0,
        };

        expect(
          projectInvestigationIntelligenceEvidencePack({
            companyId:
              "COMPANY-A",

            execution,
          })
        ).toEqual({
          planId:
            "PLAN-COMPANY-1",

          caseId:
            "CASE-COMPANY-1",

          evidence: [],

          causalConclusion:
            "UNKNOWN",
        });
      }
    );
  }
);