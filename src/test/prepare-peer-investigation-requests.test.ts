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
  RXPeerInvestigationPlan,
} from "../investigation/peer-investigation-plan";

import type {
  RXPeerInvestigationTargetContexts,
} from "../investigation/resolve-peer-investigation-target-contexts";

import {
  preparePeerInvestigationRequests,
} from "../investigation/prepare-peer-investigation-requests";

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

describe(
  "preparePeerInvestigationRequests",
  () => {
    it(
      "prepares all seven canonical peer requests without executing them",
      () => {
        const plan =
          createPeerInvestigationPlan(
            peerCase()
          );

        const result =
          preparePeerInvestigationRequests(
            plan,
            contexts()
          );

        expect(
          result.planId
        ).toBe(
          plan.planId
        );

        expect(
          result.caseId
        ).toBe(
          plan.caseId
        );

        expect(
          result.requests
        ).toHaveLength(7);

        expect(
          result.readyCount
        ).toBe(7);

        expect(
          result.rejectedCount
        ).toBe(0);

        expect(
          result.requests.every(
            (request) =>
              request.status ===
              "READY"
          )
        ).toBe(true);

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "binds first and second company requests to their own runtime identities",
      () => {
        const plan =
          createPeerInvestigationPlan(
            peerCase()
          );

        const result =
          preparePeerInvestigationRequests(
            plan,
            contexts()
          );

        const firstOperational =
          result.requests.find(
            (prepared) =>
              prepared.request.target ===
                "FIRST_COMPANY" &&
              prepared.request.capability ===
                "MINING_OPERATIONAL_CONTEXT"
          );

        const secondOperational =
          result.requests.find(
            (prepared) =>
              prepared.request.target ===
                "SECOND_COMPANY" &&
              prepared.request.capability ===
                "MINING_OPERATIONAL_CONTEXT"
          );

        expect(
          firstOperational?.status
        ).toBe(
          "READY"
        );

        expect(
          secondOperational?.status
        ).toBe(
          "READY"
        );

        if (
          !firstOperational ||
          firstOperational.status !==
            "READY" ||
          !secondOperational ||
          secondOperational.status !==
            "READY"
        ) {
          throw new Error(
            "Expected bilateral operational requests to be ready"
          );
        }

        expect(
          firstOperational.operation.params
        ).toEqual({
          sectorsSlug:
            "company-a-sectors",
        });

        expect(
          secondOperational.operation.params
        ).toEqual({
          sectorsSlug:
            "company-b-sectors",
        });
      }
    );

    it(
      "binds bilateral market requests to distinct canonical tickers",
      () => {
        const plan =
          createPeerInvestigationPlan(
            peerCase()
          );

        const result =
          preparePeerInvestigationRequests(
            plan,
            contexts()
          );

        const firstMarket =
          result.requests.find(
            (prepared) =>
              prepared.request.target ===
                "FIRST_COMPANY" &&
              prepared.request.capability ===
                "COMPANY_MARKET_TRANSACTION_HISTORY"
          );

        const secondMarket =
          result.requests.find(
            (prepared) =>
              prepared.request.target ===
                "SECOND_COMPANY" &&
              prepared.request.capability ===
                "COMPANY_MARKET_TRANSACTION_HISTORY"
          );

        expect(
          firstMarket?.status
        ).toBe(
          "READY"
        );

        expect(
          secondMarket?.status
        ).toBe(
          "READY"
        );

        if (
          !firstMarket ||
          firstMarket.status !==
            "READY" ||
          !secondMarket ||
          secondMarket.status !==
            "READY"
        ) {
          throw new Error(
            "Expected bilateral market requests to be ready"
          );
        }

        expect(
          firstMarket.operation.params
        ).toEqual({
          ticker:
            "AAA",

          period: {
            kind:
              "YEAR",

            year:
              2024,
          },
        });

        expect(
          secondMarket.operation.params
        ).toEqual({
          ticker:
            "BBB",

          period: {
            kind:
              "YEAR",

            year:
              2024,
          },
        });
      }
    );

    it(
      "binds shared commodity context without manufacturing a company identity",
      () => {
        const plan =
          createPeerInvestigationPlan(
            peerCase()
          );

        const result =
          preparePeerInvestigationRequests(
            plan,
            contexts()
          );

        const shared =
          result.requests.find(
            (prepared) =>
              prepared.request.target ===
                "SHARED"
          );

        expect(
          shared?.status
        ).toBe(
          "READY"
        );

        if (
          !shared ||
          shared.status !==
            "READY"
        ) {
          throw new Error(
            "Expected shared commodity request to be ready"
          );
        }

        expect(
          shared.request.targetCompanyId
        ).toBeNull();

        expect(
          shared.operation
        ).toEqual({
          operation:
            "GET_COMMODITY_PRICE_HISTORY",

          purpose:
            "Collect shared commodity price context without asserting causality.",

          params: {
            commodity:
              "COAL",

            period: {
              kind:
                "YEAR",

              year:
                2024,
            },
          },
        });

        expect(
          JSON.stringify(
            shared.operation
          )
        ).not.toContain(
          "COMPANY-A"
        );

        expect(
          JSON.stringify(
            shared.operation
          )
        ).not.toContain(
          "COMPANY-B"
        );
      }
    );

    it(
      "rejects only affected first-company bindings when its sectors slug is unavailable",
      () => {
        const plan =
          createPeerInvestigationPlan(
            peerCase()
          );

        const targetContexts =
          contexts();

        targetContexts.firstCompany
          .sectorsSlug =
            undefined;

        const result =
          preparePeerInvestigationRequests(
            plan,
            targetContexts
          );

        const firstOperational =
          result.requests.find(
            (prepared) =>
              prepared.request.target ===
                "FIRST_COMPANY" &&
              prepared.request.capability ===
                "MINING_OPERATIONAL_CONTEXT"
          );

        const firstHistorical =
          result.requests.find(
            (prepared) =>
              prepared.request.target ===
                "FIRST_COMPANY" &&
              prepared.request.capability ===
                "MINING_HISTORICAL_PERFORMANCE"
          );

        expect(
          firstOperational?.status
        ).toBe(
          "REJECTED"
        );

        expect(
          firstHistorical?.status
        ).toBe(
          "REJECTED"
        );

        if (
          !firstOperational ||
          firstOperational.status !==
            "REJECTED" ||
          !firstHistorical ||
          firstHistorical.status !==
            "REJECTED"
        ) {
          throw new Error(
            "Expected missing first company slug to reject first-company mining bindings"
          );
        }

        expect(
          firstOperational
            .executionDecision.status
        ).toBe(
          "READY"
        );

        expect(
          firstOperational.bindingIssues
        ).toEqual([
          "SECTORS_SLUG_REQUIRED",
        ]);

        expect(
          firstHistorical.bindingIssues
        ).toEqual([
          "SECTORS_SLUG_REQUIRED",
        ]);

        expect(
          result.readyCount
        ).toBe(5);

        expect(
          result.rejectedCount
        ).toBe(2);
      }
    );

    it(
      "rejects canonical target company mismatch instead of silently switching peer identity",
      () => {
        const plan =
          createPeerInvestigationPlan(
            peerCase()
          );

        const corruptedPlan:
          RXPeerInvestigationPlan = {
          ...plan,

          dataRequests:
            plan.dataRequests.map(
              (request) =>
                request.target ===
                "FIRST_COMPANY"
                  ? {
                      ...request,

                      targetCompanyId:
                        "COMPANY-B",
                    }
                  : request
            ),
        };

        const result =
          preparePeerInvestigationRequests(
            corruptedPlan,
            contexts()
          );

        const firstRequests =
          result.requests.filter(
            (prepared) =>
              prepared.request.target ===
              "FIRST_COMPANY"
          );

        expect(
          firstRequests
        ).toHaveLength(3);

        expect(
          firstRequests.every(
            (prepared) =>
              prepared.status ===
              "REJECTED"
          )
        ).toBe(true);

        for (
          const prepared
          of firstRequests
        ) {
          if (
            prepared.status !==
            "REJECTED"
          ) {
            throw new Error(
              "Expected corrupted first-company target to be rejected"
            );
          }

          expect(
            prepared.targetIssues
          ).toContain(
            "FIRST_COMPANY_ID_MISMATCH"
          );

          expect(
            prepared.operation
          ).toBeNull();
        }
      }
    );

    it(
      "rejects target semantics that contradict the linked peer requirement",
      () => {
        const plan =
          createPeerInvestigationPlan(
            peerCase()
          );

        const firstRequest =
          plan.dataRequests[0];

        const corruptedPlan:
          RXPeerInvestigationPlan = {
          ...plan,

          dataRequests: [
            {
              ...firstRequest,

              target:
                "SECOND_COMPANY",

              targetCompanyId:
                "COMPANY-B",
            },

            ...plan.dataRequests.slice(1),
          ],
        };

        const result =
          preparePeerInvestigationRequests(
            corruptedPlan,
            contexts()
          );

        const corrupted =
          result.requests[0];

        expect(
          corrupted.status
        ).toBe(
          "REJECTED"
        );

        if (
          corrupted.status !==
          "REJECTED"
        ) {
          throw new Error(
            "Expected mismatched target semantics to be rejected"
          );
        }

        expect(
          corrupted.executionDecision.status
        ).toBe(
          "READY"
        );

        expect(
          corrupted.targetIssues
        ).toContain(
          "TARGET_REQUIREMENT_MISMATCH"
        );

        expect(
          corrupted.bindingIssues
        ).toEqual([]);

        expect(
          corrupted.operation
        ).toBeNull();
      }
    );

    it(
      "rejects shared requests carrying a company id",
      () => {
        const plan =
          createPeerInvestigationPlan(
            peerCase()
          );

        const corruptedPlan:
          RXPeerInvestigationPlan = {
          ...plan,

          dataRequests:
            plan.dataRequests.map(
              (request) =>
                request.target ===
                "SHARED"
                  ? {
                      ...request,

                      targetCompanyId:
                        "COMPANY-A",
                    }
                  : request
            ),
        };

        const result =
          preparePeerInvestigationRequests(
            corruptedPlan,
            contexts()
          );

        const shared =
          result.requests.find(
            (prepared) =>
              prepared.request.target ===
                "SHARED"
          );

        expect(
          shared?.status
        ).toBe(
          "REJECTED"
        );

        if (
          !shared ||
          shared.status !==
            "REJECTED"
        ) {
          throw new Error(
            "Expected shared company identity contamination to be rejected"
          );
        }

        expect(
          shared.targetIssues
        ).toContain(
          "SHARED_TARGET_COMPANY_ID_PRESENT"
        );

        expect(
          shared.operation
        ).toBeNull();
      }
    );

    it(
      "preserves execution validation rejection before target binding",
      () => {
        const plan =
          createPeerInvestigationPlan(
            peerCase()
          );

        const corruptedPlan:
          RXPeerInvestigationPlan = {
          ...plan,

          evidenceRequirements:
            plan.evidenceRequirements.filter(
              (requirement) =>
                requirement.requirementId !==
                plan.dataRequests[0]
                  .requirementId
            ),
        };

        const result =
          preparePeerInvestigationRequests(
            corruptedPlan,
            contexts()
          );

        const first =
          result.requests[0];

        expect(
          first.status
        ).toBe(
          "REJECTED"
        );

        if (
          first.status !==
          "REJECTED"
        ) {
          throw new Error(
            "Expected invalid requirement relationship to be rejected"
          );
        }

        expect(
          first.executionDecision.status
        ).toBe(
          "REJECTED"
        );

        expect(
          first.executionDecision.issues
        ).toContain(
          "REQUIREMENT_MISMATCH"
        );

        expect(
          first.targetIssues
        ).toEqual([]);

        expect(
          first.bindingIssues
        ).toEqual([]);

        expect(
          first.operation
        ).toBeNull();
      }
    );

    it(
      "does not mutate the peer plan or resolved target contexts",
      () => {
        const plan =
          createPeerInvestigationPlan(
            peerCase()
          );

        const targetContexts =
          contexts();

        const planSnapshot =
          structuredClone(
            plan
          );

        const contextsSnapshot =
          structuredClone(
            targetContexts
          );

        preparePeerInvestigationRequests(
          plan,
          targetContexts
        );

        expect(
          plan
        ).toEqual(
          planSnapshot
        );

        expect(
          targetContexts
        ).toEqual(
          contextsSnapshot
        );
      }
    );
  }
);