import {
  describe,
  expect,
  it,
} from "vitest";

import {
  evaluateLiveReconGuard,
} from "../data/sectors/live-recon-guard";

import type {
  RXSectorsTypedOperationRequest,
} from "../data/sectors/sectors-operation-request";

import {
  runLiveProductionSalesIntelligence,
} from "../investigation/run-live-production-sales-intelligence";

import {
  detectAdmittedProductionSalesDivergence,
} from "../intelligence/detectors/detect-admitted-production-sales-divergence";

import {
  scoreAdmittedProductionSalesDivergence,
} from "../intelligence/priority/score-admitted-production-sales-divergence";

import {
  buildAdmittedProductionSalesInvestigationQueue,
} from "../investigation/build-admitted-production-sales-investigation-queue";

const LIVE_CONFIRMED =
  process.env.RX_LIVE_CROSS_COMPANY === "YES";

const sectorsApiKey =
  process.env.SECTORS_API_KEY?.trim() ?? "";

const llmApiKey =
  process.env.LLM_API_KEY?.trim() ?? "";

const companies = [
  {
    companyId: "rx-company-admr",
    sectorsSlug:
      "pt-adaro-minerals-indonesia-tbk",
    ticker: "ADMR.JK",
    commodity: "COAL" as const,
    year: 2024,
  },
  {
    companyId: "rx-company-byan",
    sectorsSlug:
      "pt-bayan-resources-tbk",
    ticker: "BYAN.JK",
    commodity: "COAL" as const,
    year: 2024,
  },
  {
    companyId: "rx-company-bumi",
    sectorsSlug:
      "pt-bumi-resources-tbk",
    ticker: "BUMI.JK",
    commodity: "COAL" as const,
    year: 2024,
  },
  {
    companyId: "rx-company-itmg",
    sectorsSlug:
      "pt-indo-tambangraya-megah-tbk",
    ticker: "ITMG.JK",
    commodity: "COAL" as const,
    year: 2024,
  },
  {
    companyId: "rx-company-gems",
    sectorsSlug:
      "pt-golden-energy-mines-tbk",
    ticker: "GEMS.JK",
    commodity: "COAL" as const,
    year: 2024,
  },
] as const;

type RXSemanticOutcome =
  | "INVESTIGATE"
  | "NO_INVESTIGATION_CASE";

describe(
  "Cross-company live generalization",
  () => {
    for (const company of companies) {
      it.skipIf(!LIVE_CONFIRMED)(
        `${company.ticker} runs through the RX MDI production path`,
        async () => {
          expect(
            sectorsApiKey.length,
            "SECTORS_API_KEY must be set",
          ).toBeGreaterThan(0);

          expect(
            llmApiKey.length,
            "LLM_API_KEY must be set",
          ).toBeGreaterThan(0);

          const operationRequest:
            RXSectorsTypedOperationRequest = {
              operation:
                "GET_MINING_HISTORICAL_PERFORMANCE",

              params: {
                sectorsSlug:
                  company.sectorsSlug,

                period: {
                  kind:
                    "YEAR",

                  year:
                    company.year,
                },
              },

              purpose:
                `Cross-company generalization validation for ${company.ticker} FY${company.year}`,
            };

          const guard =
            evaluateLiveReconGuard({
              operationRequest,

              authorizedOperation:
                "GET_MINING_HISTORICAL_PERFORMANCE",

              apiKeyPresent:
                sectorsApiKey.length > 0,

              liveExecutionConfirmed:
                LIVE_CONFIRMED,

              maxCredits:
                1,
            });

          console.log(
            `\n${company.ticker} GUARD: ${guard.status}`,
          );

          expect(
            guard.status,
            `${company.ticker} live recon guard rejected`,
          ).toBe(
            "READY",
          );

          console.log(
            `=== LIVE ${company.ticker} START ===`,
          );

          const result =
            await runLiveProductionSalesIntelligence({
              sectorsApiKey,
              llmApiKey,

              companyId:
                company.companyId,

              sectorsSlug:
                company.sectorsSlug,

              ticker:
                company.ticker,

              commodity:
                company.commodity,

              year:
                company.year,
            });

          expect(
            result,
            `${company.ticker} production path returned no result`,
          ).toBeDefined();

          expect(
            result,
            `${company.ticker} production path returned null`,
          ).not.toBeNull();

          console.log(
            `${company.ticker} LIVE RESULT: ${result.status}`,
          );

          expect(
            result.status,
            `${company.ticker} live orchestration did not complete`,
          ).toBe(
            "COMPLETED",
          );

          if (
            result.status !==
            "COMPLETED"
          ) {
            throw new Error(
              `${company.ticker} expected live COMPLETED result`,
            );
          }

          const intelligence =
            result.intelligence;

          const detection =
            detectAdmittedProductionSalesDivergence(
              result.discovery
            );

          const scoring =
            scoreAdmittedProductionSalesDivergence(
              result.discovery
            );

          const queueResult =
            buildAdmittedProductionSalesInvestigationQueue(
              [
                result.discovery,
              ]
            );

          const queueCaseCount =
            queueResult.queue.cases.length;

          const semanticOutcome:
            RXSemanticOutcome =
              queueCaseCount > 0
                ? "INVESTIGATE"
                : "NO_INVESTIGATION_CASE";

          const detectorResult =
            detection.detectorResult;

          const priorityResult =
            scoring.priorityResult;

          console.log(
            `${company.ticker} SEMANTIC AUDIT: ${JSON.stringify(
              {
                ticker:
                  company.ticker,

                detectionWrapperStatus:
                  detection.status,

                detectionNotRunReason:
                  detection.status ===
                  "NOT_RUN"
                    ? detection.reason
                    : null,

                detectorStatus:
                  detectorResult?.status ??
                  null,

                detectorSkipReasons:
                  detectorResult?.skipReasons ??
                  [],

                production:
                  detectorResult
                    ?.calculation
                    ?.production ??
                  null,

                sales:
                  detectorResult
                    ?.calculation
                    ?.sales ??
                  null,

                signedDifference:
                  detectorResult
                    ?.calculation
                    ?.signedDifference ??
                  null,

                divergenceRatio:
                  detectorResult
                    ?.calculation
                    ?.differenceRatioOfProduction ??
                  priorityResult
                    ?.divergenceRatio ??
                  null,

                direction:
                  detectorResult
                    ?.calculation
                    ?.direction ??
                  null,

                priorityWrapperStatus:
                  scoring.status,

                priorityStatus:
                  priorityResult?.status ??
                  null,

                priorityScore:
                  priorityResult?.score ??
                  null,

                queueCaseCount,

                semanticOutcome,
              }
            )}`,
          );

          if (queueCaseCount > 0) {
            expect(
              semanticOutcome,
              `${company.ticker} queued case must produce INVESTIGATE semantics`,
            ).toBe(
              "INVESTIGATE",
            );

            expect(
              scoring.status,
              `${company.ticker} queued case must come from deterministic scoring`,
            ).toBe(
              "SCORED",
            );

            if (
              scoring.status !==
              "SCORED"
            ) {
              throw new Error(
                `${company.ticker} queued case without scoring result`,
              );
            }

            expect(
              scoring.priorityResult.status,
              `${company.ticker} queued case must originate from SCORABLE priority`,
            ).toBe(
              "SCORABLE",
            );
          }

          expect(
            intelligence.queue.queue.cases.length,
            `${company.ticker} production queue must match canonical deterministic queue`,
          ).toBe(
            queueCaseCount,
          );

          expect(
            intelligence.queue.scorablePriorityCount,
            `${company.ticker} production scorable priority count must match canonical deterministic queue`,
          ).toBe(
            queueResult.scorablePriorityCount,
          );

          if (
            intelligence.status ===
            "NO_INVESTIGATION_CASE"
          ) {
            expect(
              queueCaseCount,
              `${company.ticker} NO_INVESTIGATION_CASE requires an empty canonical queue`,
            ).toBe(
              0,
            );

            expect(
              semanticOutcome,
            ).toBe(
              "NO_INVESTIGATION_CASE",
            );
          } else {
            expect(
              queueCaseCount,
              `${company.ticker} downstream investigation status requires a canonical investigation case`,
            ).toBeGreaterThan(
              0,
            );

            expect(
              semanticOutcome,
            ).toBe(
              "INVESTIGATE",
            );
          }

          for (const investigationCase of queueResult
            .queue
            .cases) {
            expect(
              investigationCase.trigger
                .triggerType,
              `${company.ticker} queued case must retain deterministic trigger type`,
            ).toBe(
              "DETERMINISTIC_DIVERGENCE_PRIORITY",
            );
          }

          console.log(
            `${company.ticker} INTELLIGENCE RESULT: ${intelligence.status}`,
          );

          expect(
            [
              "COMPLETED",
              "DEGRADED",
            ],
            `${company.ticker} returned an unexpected intelligence status`,
          ).toContain(
            intelligence.status,
          );

          if (
            intelligence.status ===
            "COMPLETED"
          ) {
            expect(
              intelligence
                .evidencePack
                .evidence
                .length,
              `${company.ticker} COMPLETED without admitted evidence`,
            ).toBeGreaterThan(0);

            expect(
              intelligence.synthesis,
              `${company.ticker} COMPLETED without synthesis result`,
            ).not.toBeNull();

            console.log(
              `${company.ticker} MODE: FULL_INTELLIGENCE`,
            );
          }

          if (
            intelligence.status ===
            "DEGRADED"
          ) {
            expect(
              intelligence
                .evidencePack
                .evidence
                .length,
              `${company.ticker} DEGRADED without preserved evidence`,
            ).toBeGreaterThan(0);

            expect(
              intelligence.synthesis,
              `${company.ticker} DEGRADED should not contain synthesis`,
            ).toBeNull();

            expect(
              intelligence
                .providerFailure
                .stage,
              `${company.ticker} degraded at unexpected stage`,
            ).toBe(
              "SYNTHESIS",
            );

            expect(
              intelligence
                .providerFailure
                .message
                .length,
              `${company.ticker} DEGRADED without provider failure detail`,
            ).toBeGreaterThan(0);

            console.log(
              `${company.ticker} MODE: EVIDENCE_PRESERVED_DEGRADED`,
            );

            console.log(
              `${company.ticker} PROVIDER FAILURE STAGE: ${intelligence.providerFailure.stage}`,
            );
          }

          console.log(
            `=== LIVE ${company.ticker} COMPLETED ===`,
          );
        },
        120_000,
      );
    }
  },
);
