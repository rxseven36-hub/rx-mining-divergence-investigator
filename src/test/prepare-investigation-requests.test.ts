import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createInvestigationPlan,
} from "../investigation/create-investigation-plan";

import type {
  RXInvestigationCase,
} from "../investigation/investigation-case";

import {
  prepareInvestigationRequests,
} from "../investigation/prepare-investigation-requests";

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
  "prepareInvestigationRequests",
  () => {
    it(
      "prepares REST requests and rejects MCP Financial at the REST boundary",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase,
          );

        const result =
          prepareInvestigationRequests(
            plan,
            context,
          );

        expect(
          result.planId,
        ).toBe(
          plan.planId,
        );

        expect(
          result.caseId,
        ).toBe(
          investigationCase.caseId,
        );

        /**
         * Canonical V2.10I plan:
         *
         * R1-R4 = REST
         * R5    = MCP Financial
         *
         * Direct REST preparation sees all five logical
         * requests, but must fail closed on R5.
         */
        expect(
          result.requests,
        ).toHaveLength(5);

        expect(
          result.readyCount,
        ).toBe(4);

        expect(
          result.rejectedCount,
        ).toBe(1);

        const financial =
          result.requests.find(
            (request) =>
              request.request
                .capability ===
              "COMPANY_FINANCIAL_REPORT",
          );

        expect(
          financial?.status,
        ).toBe(
          "REJECTED",
        );

        if (
          !financial ||
          financial.status !==
            "REJECTED"
        ) {
          throw new Error(
            "Financial request was not rejected by REST preparation boundary.",
          );
        }

        expect(
          financial
            .executionDecision
            .status,
        ).toBe(
          "READY",
        );

        expect(
          financial.bindingIssues,
        ).toEqual([
          "EXECUTION_BOUNDARY_NOT_SUPPORTED",
        ]);

        expect(
          financial.operation,
        ).toBeNull();

        const restRequests =
          result.requests.filter(
            (request) =>
              request.request
                .capability !==
              "COMPANY_FINANCIAL_REPORT",
          );

        expect(
          restRequests,
        ).toHaveLength(4);

        expect(
          restRequests.every(
            (request) =>
              request.status ===
              "READY",
          ),
        ).toBe(true);

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );
      },
    );

    it(
      "binds mining requests with sectorsSlug rather than internal companyId",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase,
          );

        const result =
          prepareInvestigationRequests(
            plan,
            context,
          );

        const operational =
          result.requests.find(
            (request) =>
              request.request
                .capability ===
              "MINING_OPERATIONAL_CONTEXT",
          );

        expect(
          operational?.status,
        ).toBe(
          "READY",
        );

        if (
          !operational ||
          operational.status !==
            "READY"
        ) {
          throw new Error(
            "Operational request was not ready.",
          );
        }

        expect(
          operational.operation
            .operation,
        ).toBe(
          "GET_MINING_OPERATIONAL_CONTEXT",
        );

        expect(
          operational.operation.params,
        ).toEqual({
          sectorsSlug:
            "pt-adaro-andalan-indonesia-tbk",
        });

        expect(
          JSON.stringify(
            operational.operation.params,
          ),
        ).not.toContain(
          "company-internal-001",
        );
      },
    );

    it(
      "rejects mining bindings when sectorsSlug is unavailable while preserving MCP boundary rejection",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase,
          );

        const result =
          prepareInvestigationRequests(
            plan,
            {
              ...context,

              sectorsSlug:
                undefined,
            },
          );

        const operational =
          result.requests.find(
            (request) =>
              request.request
                .capability ===
              "MINING_OPERATIONAL_CONTEXT",
          );

        const historical =
          result.requests.find(
            (request) =>
              request.request
                .capability ===
              "MINING_HISTORICAL_PERFORMANCE",
          );

        const financial =
          result.requests.find(
            (request) =>
              request.request
                .capability ===
              "COMPANY_FINANCIAL_REPORT",
          );

        expect(
          operational?.status,
        ).toBe(
          "REJECTED",
        );

        expect(
          historical?.status,
        ).toBe(
          "REJECTED",
        );

        expect(
          financial?.status,
        ).toBe(
          "REJECTED",
        );

        if (
          !operational ||
          operational.status !==
            "REJECTED"
        ) {
          throw new Error(
            "Operational request was not rejected.",
          );
        }

        if (
          !historical ||
          historical.status !==
            "REJECTED"
        ) {
          throw new Error(
            "Historical request was not rejected.",
          );
        }

        if (
          !financial ||
          financial.status !==
            "REJECTED"
        ) {
          throw new Error(
            "Financial request was not rejected.",
          );
        }

        expect(
          operational
            .executionDecision
            .status,
        ).toBe(
          "READY",
        );

        expect(
          historical
            .executionDecision
            .status,
        ).toBe(
          "READY",
        );

        expect(
          operational.bindingIssues,
        ).toEqual([
          "SECTORS_SLUG_REQUIRED",
        ]);

        expect(
          historical.bindingIssues,
        ).toEqual([
          "SECTORS_SLUG_REQUIRED",
        ]);

        expect(
          financial.bindingIssues,
        ).toEqual([
          "EXECUTION_BOUNDARY_NOT_SUPPORTED",
        ]);

        expect(
          result.readyCount,
        ).toBe(2);

        expect(
          result.rejectedCount,
        ).toBe(3);
      },
    );

    it(
      "rejects market binding when ticker is unavailable without blocking unrelated REST requests",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase,
          );

        const result =
          prepareInvestigationRequests(
            plan,
            {
              ...context,

              ticker:
                undefined,
            },
          );

        const market =
          result.requests.find(
            (request) =>
              request.request
                .capability ===
              "COMPANY_MARKET_TRANSACTION_HISTORY",
          );

        const financial =
          result.requests.find(
            (request) =>
              request.request
                .capability ===
              "COMPANY_FINANCIAL_REPORT",
          );

        expect(
          market?.status,
        ).toBe(
          "REJECTED",
        );

        expect(
          financial?.status,
        ).toBe(
          "REJECTED",
        );

        if (
          !market ||
          market.status !==
            "REJECTED"
        ) {
          throw new Error(
            "Market request was not rejected.",
          );
        }

        if (
          !financial ||
          financial.status !==
            "REJECTED"
        ) {
          throw new Error(
            "Financial request was not rejected.",
          );
        }

        expect(
          market
            .executionDecision
            .status,
        ).toBe(
          "READY",
        );

        expect(
          market.bindingIssues,
        ).toEqual([
          "TICKER_REQUIRED",
        ]);

        expect(
          financial.bindingIssues,
        ).toEqual([
          "EXECUTION_BOUNDARY_NOT_SUPPORTED",
        ]);

        expect(
          result.readyCount,
        ).toBe(3);

        expect(
          result.rejectedCount,
        ).toBe(2);
      },
    );

    it(
      "rejects invalid requirement relationship independently of MCP boundary rejection",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase,
          );

        const corruptedPlan = {
          ...plan,

          evidenceRequirements:
            plan.evidenceRequirements.filter(
              (requirement) =>
                requirement.requirementId !==
                plan.dataRequests[0]
                  .requirementId,
            ),
        };

        const result =
          prepareInvestigationRequests(
            corruptedPlan,
            context,
          );

        const first =
          result.requests[0];

        const financial =
          result.requests.find(
            (request) =>
              request.request
                .capability ===
              "COMPANY_FINANCIAL_REPORT",
          );

        expect(
          first.status,
        ).toBe(
          "REJECTED",
        );

        expect(
          first
            .executionDecision
            .status,
        ).toBe(
          "REJECTED",
        );

        expect(
          first
            .executionDecision
            .issues,
        ).toContain(
          "REQUIREMENT_MISMATCH",
        );

        expect(
          first.bindingIssues,
        ).toEqual([]);

        expect(
          first.operation,
        ).toBeNull();

        expect(
          financial?.status,
        ).toBe(
          "REJECTED",
        );

        if (
          !financial ||
          financial.status !==
            "REJECTED"
        ) {
          throw new Error(
            "Financial request was not rejected.",
          );
        }

        expect(
          financial.bindingIssues,
        ).toEqual([
          "EXECUTION_BOUNDARY_NOT_SUPPORTED",
        ]);

        expect(
          result.readyCount,
        ).toBe(3);

        expect(
          result.rejectedCount,
        ).toBe(2);
      },
    );

    it(
      "preserves UNKNOWN causal boundary during REST request preparation",
      () => {
        const plan =
          createInvestigationPlan(
            investigationCase,
          );

        const result =
          prepareInvestigationRequests(
            plan,
            context,
          );

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );

        for (
          const prepared
          of result.requests
        ) {
          expect(
            prepared
              .executionDecision
              .causalConclusion,
          ).toBe(
            "UNKNOWN",
          );
        }
      },
    );
  },
);