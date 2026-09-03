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

describe(
  "createPeerInvestigationPlan",
  () => {
    it(
      "creates a deterministic bilateral peer investigation plan",
      () => {
        const plan =
          createPeerInvestigationPlan(
            peerCase()
          );

        expect(
          plan.status
        ).toBe(
          "PLANNED"
        );

        expect(
          plan.questions
        ).toHaveLength(
          4
        );

        expect(
          plan.evidenceRequirements
        ).toHaveLength(
          7
        );

        expect(
          plan.dataRequests
        ).toHaveLength(
          7
        );

        expect(
          plan.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "targets company-specific requests to both canonical peer companies",
      () => {
        const plan =
          createPeerInvestigationPlan(
            peerCase()
          );

        const firstTargets =
          plan.dataRequests.filter(
            (request) =>
              request.target ===
              "FIRST_COMPANY"
          );

        const secondTargets =
          plan.dataRequests.filter(
            (request) =>
              request.target ===
              "SECOND_COMPANY"
          );

        expect(
          firstTargets
        ).toHaveLength(
          3
        );

        expect(
          secondTargets
        ).toHaveLength(
          3
        );

        expect(
          firstTargets.every(
            (request) =>
              request.targetCompanyId ===
              "COMPANY-A"
          )
        ).toBe(true);

        expect(
          secondTargets.every(
            (request) =>
              request.targetCompanyId ===
              "COMPANY-B"
          )
        ).toBe(true);
      }
    );

    it(
      "represents commodity context as shared rather than assigning it to either company",
      () => {
        const plan =
          createPeerInvestigationPlan(
            peerCase()
          );

        const sharedRequests =
          plan.dataRequests.filter(
            (request) =>
              request.target ===
              "SHARED"
          );

        expect(
          sharedRequests
        ).toHaveLength(
          1
        );

        expect(
          sharedRequests[0]
            .capability
        ).toBe(
          "COMMODITY_PRICE_HISTORY"
        );

        expect(
          sharedRequests[0]
            .targetCompanyId
        ).toBeNull();
      }
    );

    it(
      "requires bilateral operational and historical evidence",
      () => {
        const plan =
          createPeerInvestigationPlan(
            peerCase()
          );

        const requiredKinds =
          plan.evidenceRequirements
            .filter(
              (requirement) =>
                requirement.required
            )
            .map(
              (requirement) =>
                requirement.kind
            );

        expect(
          requiredKinds
        ).toEqual([
          "FIRST_COMPANY_OPERATIONAL",
          "SECOND_COMPANY_OPERATIONAL",
          "FIRST_COMPANY_HISTORICAL",
          "SECOND_COMPANY_HISTORICAL",
        ]);
      }
    );

    it(
      "does not assert causal claims in peer investigation questions",
      () => {
        const plan =
          createPeerInvestigationPlan(
            peerCase()
          );

        expect(
          plan.questions.every(
            (question) =>
              question.causalClaim ===
              "NONE"
          )
        ).toBe(true);

        expect(
          plan.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "does not mutate the peer investigation case",
      () => {
        const investigationCase =
          peerCase();

        const snapshot =
          structuredClone(
            investigationCase
          );

        createPeerInvestigationPlan(
          investigationCase
        );

        expect(
          investigationCase
        ).toEqual(
          snapshot
        );
      }
    );
  }
);