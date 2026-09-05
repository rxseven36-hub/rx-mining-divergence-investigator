import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  RXNormalizedObservation,
} from "../data/normalization/normalized-observation";

import type {
  SectorsAdapter,
} from "../data/sectors/sectors-adapter";

import type {
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
} from "../investigation/admit-mining-historical-performance-evidence";

import type {
  LLMProvider,
} from "../investigation/llm-provider";

import {
  runProductionSalesInvestigationIntelligence,
} from "../investigation/run-production-sales-investigation-intelligence";

import {
  executePreparedInvestigation,
} from "../investigation/execute-prepared-investigation";

import {
  runNeutralIntelligenceSynthesis,
} from "../intelligence/synthesis/run-neutral-intelligence-synthesis";

vi.mock(
  "../investigation/execute-prepared-investigation",
  () => ({
    executePreparedInvestigation:
      vi.fn(),
  })
);

vi.mock(
  "../intelligence/synthesis/run-neutral-intelligence-synthesis",
  () => ({
    runNeutralIntelligenceSynthesis:
      vi.fn(),
  })
);

type AdmittedResult = Extract<
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
  { status: "ADMITTED" }
>;

type RejectedResult = Extract<
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
  { status: "REJECTED" }
>;

function observation(
  metric:
    "PRODUCTION" | "SALES",
  value:
    number
): RXNormalizedObservation {
  return {
    id:
      `AADI-${metric}`,

    companyId:
      "AADI.JK",

    commodity:
      "COAL",

    commoditySubtype:
      "Sub-bituminous & Metallurgical Coal",

    metric,

    value,

    unit: {
      symbol: "Mt",
      dimension: "MASS",
    },

    period: {
      kind: "YEAR",
      year: 2024,
    },

    evidence: [],

    semanticDescription:
      metric === "PRODUCTION"
        ? "Coal production"
        : "Coal sales",

    semantic: {
      state: "KNOWN",

      description:
        metric === "PRODUCTION"
          ? "Coal production"
          : "Coal sales",

      basis:
        "018D-6C orchestration fixture",
    },
  };
}

function admittedResult():
  AdmittedResult {
  const observations = [
    observation(
      "PRODUCTION",
      48.11
    ),

    observation(
      "SALES",
      55.8
    ),
  ];

  return {
    status:
      "ADMITTED",

    collection: {
      requestId:
        "AADI-HISTORICAL",

      requirementId:
        "AADI-HISTORICAL-EVIDENCE",

      capability:
        "MINING_HISTORICAL_PERFORMANCE",

      status:
        "AVAILABLE",

      evidence: [],

      issues: [],

      causalConclusion:
        "UNKNOWN",
    },

    observations:
      [...observations],

    admittedObservations:
      [...observations],
  };
}

function rejectedResult():
  RejectedResult {
  return {
    status:
      "REJECTED",

    collection: {
      requestId:
        "AADI-REJECTED",

      requirementId:
        "AADI-REJECTED-EVIDENCE",

      capability:
        "MINING_HISTORICAL_PERFORMANCE",

      status:
        "INVALID",

      evidence: [],

      issues: [
        "INVALID_RESPONSE",
      ],

      causalConclusion:
        "UNKNOWN",
    },

    observations: [],

    admittedObservations: [],
  };
}

const operationContext = {
  companyId:
    "AADI.JK",

  sectorsSlug:
    "pt-adaro-andalan-indonesia-tbk",

  ticker:
    "AADI.JK",

  commodity:
    "COAL" as const,

  period: {
    kind:
      "YEAR" as const,

    year:
      2024,
  },
};

const adapter =
  {} as SectorsAdapter;

const provider =
  {} as LLMProvider;

const executeMock =
  vi.mocked(
    executePreparedInvestigation
  );

const synthesisMock =
  vi.mocked(
    runNeutralIntelligenceSynthesis
  );

describe(
  "runProductionSalesInvestigationIntelligence",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it(
      "stops before Sectors and AI when no canonical investigation case exists",
      async () => {
        const result =
          await runProductionSalesInvestigationIntelligence(
            adapter,
            provider,
            {
              admissions: [
                rejectedResult(),
              ],

              operationContext,
            }
          );

        expect(
          result.status
        ).toBe(
          "NO_INVESTIGATION_CASE"
        );

        expect(
          result.queue.queue.cases
        ).toEqual([]);

        expect(
          executeMock
        ).not.toHaveBeenCalled();

        expect(
          synthesisMock
        ).not.toHaveBeenCalled();

        expect(
          result.causalConclusion
        ).toBe("UNKNOWN");
      }
    );

    it(
      "stops before AI when execution admits no evidence",
      async () => {
        executeMock.mockResolvedValueOnce({
          planId:
            "PLAN-AADI",

          caseId:
            "CASE-AADI",

          outcomes: [],

          summary: {
            totalCount: 0,

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
          },

          causalConclusion:
            "UNKNOWN",
        });

        const result =
          await runProductionSalesInvestigationIntelligence(
            adapter,
            provider,
            {
              admissions: [
                admittedResult(),
              ],

              operationContext,

              retrievedAt:
                "2026-09-05T00:00:00.000Z",
            }
          );

        expect(
          result.status
        ).toBe(
          "NO_ADMITTED_EVIDENCE"
        );

        expect(
          executeMock
        ).toHaveBeenCalledTimes(1);

        expect(
          synthesisMock
        ).not.toHaveBeenCalled();

        if (
          result.status !==
          "NO_ADMITTED_EVIDENCE"
        ) {
          throw new Error(
            "Expected NO_ADMITTED_EVIDENCE"
          );
        }

        expect(
          result.evidencePack.evidence
        ).toEqual([]);

        expect(
          result.synthesis
        ).toBeNull();

        expect(
          result.causalConclusion
        ).toBe("UNKNOWN");
      }
    );

    it(
      "projects admitted execution evidence and delegates to neutral synthesis",
      async () => {
        executeMock.mockResolvedValueOnce({
          planId:
            "PLAN-AADI",

          caseId:
            "CASE-AADI",

          outcomes: [
            {
              status:
                "EVIDENCE_ADMITTED",

              preparedRequest: {
                status:
                  "READY",

                request: {
                  requestId:
                    "AADI-R2",

                  requirementId:
                    "AADI-E2",

                  source:
                    "SECTORS",

                  capability:
                    "MINING_HISTORICAL_PERFORMANCE",

                  purpose:
                    "Collect historical mining performance.",

                  status:
                    "PLANNED",
                },

                executionDecision: {
                  requestId:
                    "AADI-R2",

                  requirementId:
                    "AADI-E2",

                  capability:
                    "MINING_HISTORICAL_PERFORMANCE",

                  status:
                    "READY",

                  issues: [],

                  causalConclusion:
                    "UNKNOWN",
                },

                operation: {
                  operation:
                    "GET_MINING_HISTORICAL_PERFORMANCE",

                  purpose:
                    "Collect historical mining performance.",

                  params: {
                    sectorsSlug:
                      "pt-adaro-andalan-indonesia-tbk",

                    period: {
                      kind:
                        "YEAR",

                      year:
                        2024,
                    },
                  },
                },

                bindingIssues: [],
              },

              execution: {
                status:
                  "EXECUTED",

                data: {
                  year:
                    2024,
                },

                issues: [],

                cause:
                  null,
              },

              evidenceCollection: {
                requestId:
                  "AADI-R2",

                requirementId:
                  "AADI-E2",

                capability:
                  "MINING_HISTORICAL_PERFORMANCE",

                status:
                  "AVAILABLE",

                evidence: [
                  {
                    evidenceId:
                      "AADI-EVIDENCE-1",

                    source:
                      "SECTORS",

                    sourceReference:
                      "sectors:mining-performance:pt-adaro-andalan-indonesia-tbk:2024",

                    truthClass:
                      "SOURCE_FACT",

                    description:
                      "AADI 2024 coal production was 48.11 Mt and sales were 55.8 Mt.",
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
          ],

          summary: {
            totalCount: 1,

            evidenceAdmittedCount:
              1,

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
          },

          causalConclusion:
            "UNKNOWN",
        });

        synthesisMock.mockImplementationOnce(
          async (
            _provider,
            evidencePack
          ) => ({
            status:
              "REJECTED",

            stage:
              "HYPOTHESIS",

            evidencePack,

            hypothesis:
              null,

            challenge:
              null,

            brief:
              null,

            issues: [
              "INVALID_OUTPUT",
            ],

            causalConclusion:
              "UNKNOWN",
          })
        );

        const result =
          await runProductionSalesInvestigationIntelligence(
            adapter,
            provider,
            {
              admissions: [
                admittedResult(),
              ],

              operationContext,
            }
          );

        expect(
          result.status
        ).toBe(
          "COMPLETED"
        );

        expect(
          executeMock
        ).toHaveBeenCalledTimes(1);

        expect(
          synthesisMock
        ).toHaveBeenCalledTimes(1);

        if (
          result.status !==
          "COMPLETED"
        ) {
          throw new Error(
            "Expected COMPLETED"
          );
        }

        expect(
          result.evidencePack.evidence
        ).toHaveLength(1);

        expect(
          result.evidencePack
            .evidence[0]
            ?.companyId
        ).toBe(
          "AADI.JK"
        );

        expect(
          result.evidencePack
            .evidence[0]
            ?.evidenceId
        ).toBe(
          "AADI-EVIDENCE-1"
        );

        expect(
          synthesisMock
        ).toHaveBeenCalledWith(
          provider,
          result.evidencePack
        );

        expect(
          result.synthesis.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.causalConclusion
        ).toBe("UNKNOWN");
      }
    );
  }
);