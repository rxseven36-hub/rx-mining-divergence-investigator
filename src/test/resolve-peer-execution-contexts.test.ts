import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXPeerInvestigationCase,
} from "../investigation/peer-investigation-case";

import {
  createPeerInvestigationPlan,
} from "../investigation/create-peer-investigation-plan";

import type {
  RXPeerInvestigationTargetContexts,
} from "../investigation/resolve-peer-investigation-target-contexts";

import {
  preparePeerInvestigationRequests,
} from "../investigation/prepare-peer-investigation-requests";

import {
  resolvePeerExecutionContexts,
} from "../investigation/resolve-peer-execution-contexts";

function peerCase():
  RXPeerInvestigationCase {
  return {
    caseId:
      "PEER-COMPANY-A-COMPANY-B-COAL-PRODUCTION-2024",

    subject: {
      kind:
        "PEER_DIVERGENCE",

      firstCompanyId:
        "COMPANY-A",

      secondCompanyId:
        "COMPANY-B",

      pairKey:
        JSON.stringify([
          "COMPANY-A",
          "COMPANY-B",
        ]),
    },

    comparisonIdentityKey:
      JSON.stringify([
        "COMPANY-A",
        "COMPANY-B",
        "PRODUCTION",
        "COAL",
        "Thermal Coal",
        "YEAR:2024",
      ]),

    metric:
      "PRODUCTION",

    commodity:
      "COAL",

    leftCommoditySubtype:
      "Thermal Coal",

    rightCommoditySubtype:
      "Thermal Coal",

    leftUnit: {
      symbol:
        "Mt",

      dimension:
        "MASS",
    },

    rightUnit: {
      symbol:
        "Mt",

      dimension:
        "MASS",
    },

    leftPeriod: {
      kind:
        "YEAR",

      year:
        2024,
    },

    rightPeriod: {
      kind:
        "YEAR",

      year:
        2024,
    },

    leftObservationId:
      "company-a-production-2024",

    rightObservationId:
      "company-b-production-2024",

    trigger: {
      priorityScore:
        20,

      divergenceMagnitude:
        0.2,

      rank:
        1,

      triggerType:
        "DETERMINISTIC_PEER_DIVERGENCE_PRIORITY",
    },

    status:
      "QUEUED",

    truthState:
      "UNINVESTIGATED",

    unknowns:
      [],

    causalExplanation:
      "UNKNOWN",
  };
}

function contexts():
  RXPeerInvestigationTargetContexts {
  const period = {
    kind:
      "YEAR" as const,

    year:
      2024,
  };

  return {
    firstCompany: {
      companyId:
        "COMPANY-A",

      sectorsSlug:
        "company-a-sectors",

      ticker:
        "AAA",

      commodity:
        "COAL",

      period,
    },

    secondCompany: {
      companyId:
        "COMPANY-B",

      sectorsSlug:
        "company-b-sectors",

      ticker:
        "BBB",

      commodity:
        "COAL",

      period,
    },

    shared: {
      commodity:
        "COAL",

      period,
    },
  };
}

function prepared() {
  const targetContexts =
    contexts();

  const plan =
    createPeerInvestigationPlan(
      peerCase()
    );

  return {
    targetContexts,

    result:
      preparePeerInvestigationRequests(
        plan,
        targetContexts
      ),
  };
}

describe(
  "resolvePeerExecutionContexts",
  () => {
    it(
      "routes all seven canonical ready peer requests without executing them",
      () => {
        const {
          targetContexts,
          result: preparedRequests,
        } = prepared();

        const result =
          resolvePeerExecutionContexts(
            preparedRequests,
            targetContexts
          );

        expect(
          result.planId
        ).toBe(
          preparedRequests.planId
        );

        expect(
          result.caseId
        ).toBe(
          preparedRequests.caseId
        );

        expect(
          result.requests
        ).toHaveLength(7);

        expect(
          result.routedCount
        ).toBe(7);

        expect(
          result.skippedCount
        ).toBe(0);

        expect(
          result.rejectedCount
        ).toBe(0);

        expect(
          result.requests.every(
            (request) =>
              request.status ===
              "ROUTED"
          )
        ).toBe(true);

        expect(
          result.causalConclusion
        ).toBe("UNKNOWN");
      }
    );

    it(
      "routes first and second company requests to distinct canonical company identities",
      () => {
        const {
          targetContexts,
          result: preparedRequests,
        } = prepared();

        const result =
          resolvePeerExecutionContexts(
            preparedRequests,
            targetContexts
          );

        const firstRequests =
          result.requests.filter(
            (request) =>
              request.status ===
                "ROUTED" &&
              request.context.target ===
                "FIRST_COMPANY"
          );

        const secondRequests =
          result.requests.filter(
            (request) =>
              request.status ===
                "ROUTED" &&
              request.context.target ===
                "SECOND_COMPANY"
          );

        expect(
          firstRequests
        ).toHaveLength(3);

        expect(
          secondRequests
        ).toHaveLength(3);

        expect(
          firstRequests.every(
            (request) =>
              request.status ===
                "ROUTED" &&
              request.context.companyId ===
                "COMPANY-A"
          )
        ).toBe(true);

        expect(
          secondRequests.every(
            (request) =>
              request.status ===
                "ROUTED" &&
              request.context.companyId ===
                "COMPANY-B"
          )
        ).toBe(true);
      }
    );

    it(
      "routes operational requests with source references derived from canonical sectors slugs",
      () => {
        const {
          targetContexts,
          result: preparedRequests,
        } = prepared();

        const result =
          resolvePeerExecutionContexts(
            preparedRequests,
            targetContexts
          );

        const operational =
          result.requests.filter(
            (request) =>
              request.status ===
                "ROUTED" &&
              request.preparedRequest
                .request.capability ===
                "MINING_OPERATIONAL_CONTEXT"
          );

        expect(
          operational
        ).toHaveLength(2);

        const first =
          operational.find(
            (request) =>
              request.status ===
                "ROUTED" &&
              request.context.target ===
                "FIRST_COMPANY"
          );

        const second =
          operational.find(
            (request) =>
              request.status ===
                "ROUTED" &&
              request.context.target ===
                "SECOND_COMPANY"
          );

        expect(
          first?.status === "ROUTED"
            ? first.context.sourceReference
            : null
        ).toBe(
          "sectors:mining-operational-context:company-a-sectors"
        );

        expect(
          second?.status === "ROUTED"
            ? second.context.sourceReference
            : null
        ).toBe(
          "sectors:mining-operational-context:company-b-sectors"
        );
      }
    );

    it(
      "routes bilateral market requests using distinct typed-operation tickers",
      () => {
        const {
          targetContexts,
          result: preparedRequests,
        } = prepared();

        const result =
          resolvePeerExecutionContexts(
            preparedRequests,
            targetContexts
          );

        const market =
          result.requests.filter(
            (request) =>
              request.status ===
                "ROUTED" &&
              request.preparedRequest
                .request.capability ===
                "COMPANY_MARKET_TRANSACTION_HISTORY"
          );

        expect(
          market
        ).toHaveLength(2);

        const first =
          market.find(
            (request) =>
              request.status ===
                "ROUTED" &&
              request.context.target ===
                "FIRST_COMPANY"
          );

        const second =
          market.find(
            (request) =>
              request.status ===
                "ROUTED" &&
              request.context.target ===
                "SECOND_COMPANY"
          );

        expect(
          first?.status === "ROUTED"
            ? first.context.sourceReference
            : null
        ).toContain(
          "sectors:market-transaction:AAA:"
        );

        expect(
          second?.status === "ROUTED"
            ? second.context.sourceReference
            : null
        ).toContain(
          "sectors:market-transaction:BBB:"
        );
      }
    );

    it(
      "keeps the shared commodity request companyless",
      () => {
        const {
          targetContexts,
          result: preparedRequests,
        } = prepared();

        const result =
          resolvePeerExecutionContexts(
            preparedRequests,
            targetContexts
          );

        const shared =
          result.requests.find(
            (request) =>
              request.status ===
                "ROUTED" &&
              request.context.target ===
                "SHARED"
          );

        expect(
          shared?.status
        ).toBe("ROUTED");

        if (
          !shared ||
          shared.status !==
            "ROUTED"
        ) {
          throw new Error(
            "shared request must be routed"
          );
        }

        expect(
          shared.context.companyId
        ).toBeNull();

        expect(
          shared.preparedRequest
            .request.targetCompanyId
        ).toBeNull();

        expect(
          shared.preparedRequest
            .request.capability
        ).toBe(
          "COMMODITY_PRICE_HISTORY"
        );

        expect(
          shared.context.sourceReference
        ).toBe(
          [
            "sectors",
            "commodity-price",
            "COAL",
            shared.preparedRequest
              .request.requestId,
          ].join(":")
        );
      }
    );

    it(
      "rejects corrupted first-company identity without silently switching peers",
      () => {
        const {
          targetContexts,
          result: preparedRequests,
        } = prepared();

        const firstOperational =
          preparedRequests.requests.find(
            (request) =>
              request.status ===
                "READY" &&
              request.request.target ===
                "FIRST_COMPANY" &&
              request.request.capability ===
                "MINING_OPERATIONAL_CONTEXT"
          );

        if (
          !firstOperational ||
          firstOperational.status !==
            "READY"
        ) {
          throw new Error(
            "first operational request must exist"
          );
        }

        firstOperational.request
          .targetCompanyId =
          "COMPANY-B";

        const result =
          resolvePeerExecutionContexts(
            preparedRequests,
            targetContexts
          );

        const corrupted =
          result.requests.find(
            (request) =>
              request.preparedRequest
                .request.requestId ===
              firstOperational.request
                .requestId
          );

        expect(
          corrupted?.status
        ).toBe("REJECTED");

        if (
          !corrupted ||
          corrupted.status !==
            "REJECTED"
        ) {
          throw new Error(
            "corrupted request must be rejected"
          );
        }

        expect(
          corrupted.context
        ).toBeNull();

        expect(
          corrupted.issues
        ).toEqual([
          "FIRST_COMPANY_ID_MISMATCH",
        ]);

        expect(
          result.routedCount
        ).toBe(6);

        expect(
          result.rejectedCount
        ).toBe(1);
      }
    );

    it(
      "rejects a shared request that acquires company identity",
      () => {
        const {
          targetContexts,
          result: preparedRequests,
        } = prepared();

        const shared =
          preparedRequests.requests.find(
            (request) =>
              request.status ===
                "READY" &&
              request.request.target ===
                "SHARED"
          );

        if (
          !shared ||
          shared.status !==
            "READY"
        ) {
          throw new Error(
            "shared request must exist"
          );
        }

        shared.request.targetCompanyId =
          "COMPANY-A";

        const result =
          resolvePeerExecutionContexts(
            preparedRequests,
            targetContexts
          );

        const corrupted =
          result.requests.find(
            (request) =>
              request.preparedRequest
                .request.requestId ===
              shared.request.requestId
          );

        expect(
          corrupted?.status
        ).toBe("REJECTED");

        if (
          !corrupted ||
          corrupted.status !==
            "REJECTED"
        ) {
          throw new Error(
            "shared identity contamination must reject routing"
          );
        }

        expect(
          corrupted.issues
        ).toEqual([
          "SHARED_TARGET_COMPANY_ID_PRESENT",
        ]);

        expect(
          corrupted.context
        ).toBeNull();
      }
    );

    it(
      "skips preparation-rejected requests without assigning execution context",
      () => {
        const targetContexts =
          contexts();

        targetContexts.firstCompany
          .sectorsSlug =
          undefined;

        const plan =
          createPeerInvestigationPlan(
            peerCase()
          );

        const preparedRequests =
          preparePeerInvestigationRequests(
            plan,
            targetContexts
          );

        expect(
          preparedRequests.rejectedCount
        ).toBe(2);

        const result =
          resolvePeerExecutionContexts(
            preparedRequests,
            targetContexts
          );

        expect(
          result.routedCount
        ).toBe(5);

        expect(
          result.skippedCount
        ).toBe(2);

        expect(
          result.rejectedCount
        ).toBe(0);

        const skipped =
          result.requests.filter(
            (request) =>
              request.status ===
              "SKIPPED"
          );

        expect(
          skipped
        ).toHaveLength(2);

        expect(
          skipped.every(
            (request) =>
              request.context === null &&
              request.issue ===
                "PREPARED_REQUEST_REJECTED"
          )
        ).toBe(true);
      }
    );

    it(
      "does not mutate prepared requests or canonical target contexts",
      () => {
        const {
          targetContexts,
          result: preparedRequests,
        } = prepared();

        const preparedBefore =
          JSON.stringify(
            preparedRequests
          );

        const contextsBefore =
          JSON.stringify(
            targetContexts
          );

        resolvePeerExecutionContexts(
          preparedRequests,
          targetContexts
        );

        expect(
          JSON.stringify(
            preparedRequests
          )
        ).toBe(
          preparedBefore
        );

        expect(
          JSON.stringify(
            targetContexts
          )
        ).toBe(
          contextsBefore
        );
      }
    );

    it(
      "preserves UNKNOWN causal conclusion across peer routing",
      () => {
        const {
          targetContexts,
          result: preparedRequests,
        } = prepared();

        const result =
          resolvePeerExecutionContexts(
            preparedRequests,
            targetContexts
          );

        expect(
          result.causalConclusion
        ).toBe("UNKNOWN");
      }
    );
  }
);