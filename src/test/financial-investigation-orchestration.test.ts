import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXInvestigationCase,
} from "../investigation/investigation-case";

import {
  createInvestigationPlan,
} from "../investigation/create-investigation-plan";

import {
  prepareInvestigationOrchestration,
} from "../investigation/prepare-investigation-orchestration";

import type {
  RXInvestigationOperationContext,
} from "../investigation/bind-operation-request";

const investigationCase:
  RXInvestigationCase = {
  caseId:
    "RX-TEST-COAL-2024-1",

  companyId:
    "company-internal-001",

  commodity:
    "COAL",

  periodLabel:
    "2024",

  detector:
    "PRODUCTION_VS_SALES",

  trigger: {
    detector:
      "PRODUCTION_VS_SALES",

    priorityScore:
      50,

    divergenceRatio:
      0.2,

    rank:
      1,

    triggerType:
      "DETERMINISTIC_DIVERGENCE_PRIORITY",
  },

  sourceObservationIds: [
    "OBS-001",
    "OBS-002",
  ],

  status:
    "QUEUED",

  truthState:
    "UNINVESTIGATED",

  unknowns:
    [],

  causalExplanation:
    "UNKNOWN",
};

const context:
  RXInvestigationOperationContext = {
  companyId:
    "company-internal-001",

  sectorsSlug:
    "pt-adaro-andalan-indonesia-tbk",

  ticker:
    "AADI.JK",

  commodity:
    "COAL",

  period: {
    kind:
      "YEAR",

    year:
      2024,
  },
};

describe(
  "financial investigation orchestration",
  () => {
    it(
      "partitions REST and MCP requests before transport binding",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase
          );

        const result =
          prepareInvestigationOrchestration(
            plan,
            context
          );

        expect(
          plan.dataRequests
        ).toHaveLength(5);

        expect(
          result.restRequestCount
        ).toBe(4);

        expect(
          result.mcpRequestCount
        ).toBe(1);

        expect(
          result.rest.requests
        ).toHaveLength(4);

        expect(
          result.rest.readyCount
        ).toBe(4);

        expect(
          result.rest.rejectedCount
        ).toBe(0);

        expect(
          result.rest.requests.some(
            (item) =>
              item.request
                .capability ===
              "COMPANY_FINANCIAL_REPORT"
          )
        ).toBe(false);

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "prepares financial context for the MCP boundary",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase
          );

        const result =
          prepareInvestigationOrchestration(
            plan,
            context
          );

        expect(
          result.mcp
        ).toHaveLength(1);

        const financial =
          result.mcp[0];

        expect(
          financial.status
        ).toBe(
          "READY"
        );

        if (
          financial.status !==
          "READY"
        ) {
          throw new Error(
            "Financial MCP request was not ready."
          );
        }

        expect(
          financial.request
            .capability
        ).toBe(
          "COMPANY_FINANCIAL_REPORT"
        );

        expect(
          financial.requirement.kind
        ).toBe(
          "FINANCIAL_REPORT"
        );

        expect(
          financial.mcpRequest
        ).toEqual({
          tool:
            "fetch-company-report",

          arguments: {
            symbol:
              "AADI.JK",

            sections: [
              "financials",
              "valuation",
            ],
          },
        });

        expect(
          financial.executionDecision
            .causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "fails financial preparation closed when ticker is unavailable",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase
          );

        const result =
          prepareInvestigationOrchestration(
            plan,
            {
              ...context,

              ticker:
                undefined,
            }
          );

        expect(
          result.restRequestCount
        ).toBe(4);

        expect(
          result.mcpRequestCount
        ).toBe(1);

        expect(
          result.rejectedMcpCount
        ).toBe(1);

        const financial =
          result.mcp[0];

        expect(
          financial.status
        ).toBe(
          "REJECTED"
        );

        if (
          financial.status !==
          "REJECTED"
        ) {
          throw new Error(
            "Financial MCP request should have been rejected."
          );
        }

        expect(
          financial.bindingIssues
        ).toContain(
          "SYMBOL_REQUIRED"
        );

        expect(
          financial.mcpRequest
        ).toBeNull();
      }
    );

    it(
      "preserves deterministic boundary routing",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase
          );

        const result =
          prepareInvestigationOrchestration(
            plan,
            context
          );

        expect(
          result.rest.requests.map(
            (item) =>
              item.request
                .capability
          )
        ).toEqual([
          "MINING_OPERATIONAL_CONTEXT",
          "MINING_HISTORICAL_PERFORMANCE",
          "COMMODITY_PRICE_HISTORY",
          "COMPANY_MARKET_TRANSACTION_HISTORY",
        ]);

        expect(
          result.mcp.map(
            (item) =>
              item.request
                .capability
          )
        ).toEqual([
          "COMPANY_FINANCIAL_REPORT",
        ]);
      }
    );
  }
);