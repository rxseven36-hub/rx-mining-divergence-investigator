import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXNormalizedObservation,
} from "../data/normalization/normalized-observation";

import type {
  RXMiningHistoricalPerformanceEvidenceAdmissionResult,
} from "../investigation/admit-mining-historical-performance-evidence";

import type {
  RXPeerEligibilityResult,
} from "../intelligence/comparability/peer-eligibility";

import {
  buildAdmittedPeerInvestigationQueue,
} from "../investigation/build-admitted-peer-investigation-queue";

function observation(
  overrides:
    Partial<RXNormalizedObservation> = {}
): RXNormalizedObservation {
  return {
    id:
      "company-a-coal-production-2024",

    companyId:
      "COMPANY-A",

    commodity:
      "COAL",

    commoditySubtype:
      "Thermal Coal",

    metric:
      "PRODUCTION",

    value:
      60,

    unit: {
      symbol:
        "Mt",

      dimension:
        "MASS",
    },

    period: {
      kind:
        "YEAR",

      year:
        2024,
    },

    evidence:
      [],

    semanticDescription:
      "Coal production",

    semantic: {
      state:
        "KNOWN",

      description:
        "Coal production",

      basis:
        "Explicitly validated test semantics.",
    },

    ...overrides,
  };
}

function admittedResult(
  admittedObservations:
    RXNormalizedObservation[],
  observations:
    RXNormalizedObservation[] =
      admittedObservations
): RXMiningHistoricalPerformanceEvidenceAdmissionResult {
  return {
    status:
      "ADMITTED",

    collection: {
      requestId:
        "test-request",

      requirementId:
        "test-requirement",

      capability:
        "MINING_HISTORICAL_PERFORMANCE",

      status:
        "AVAILABLE",

      evidence:
        [],

      issues:
        [],

      causalConclusion:
        "UNKNOWN",
    },

    observations,

    admittedObservations,
  };
}

function rejectedResult():
  RXMiningHistoricalPerformanceEvidenceAdmissionResult {
  return {
    status:
      "REJECTED",

    collection: {
      requestId:
        "test-request",

      requirementId:
        "test-requirement",

      capability:
        "MINING_HISTORICAL_PERFORMANCE",

      status:
        "INVALID",

      evidence:
        [],

      issues: [
        "INVALID_RESPONSE",
      ],

      causalConclusion:
        "UNKNOWN",
    },

    observations:
      [],

    admittedObservations:
      [],
  };
}

function eligibility(
  overrides:
    Partial<RXPeerEligibilityResult> = {}
): RXPeerEligibilityResult {
  return {
    status:
      "ELIGIBLE",

    leftCompanyId:
      "COMPANY-A",

    rightCompanyId:
      "COMPANY-B",

    sharedCommodities: [
      "COAL",
    ],

    leftCommodityEvidence:
      null,

    rightCommodityEvidence:
      null,

    descriptiveEvidence: {
      left: {
        companyType:
          [],

        keyOperation:
          [],

        activities:
          [],
      },

      right: {
        companyType:
          [],

        keyOperation:
          [],

        activities:
          [],
      },
    },

    issues:
      [],

    causalConclusion:
      "UNKNOWN",

    ...overrides,
  };
}

describe(
  "buildAdmittedPeerInvestigationQueue",
  () => {
    it(
      "builds a ranked peer investigation queue from admitted comparable observations",
      () => {
        const leftAdmission =
          admittedResult([
            observation({
              value:
                60,
            }),

            observation({
              id:
                "company-a-coal-sales-2024",

              metric:
                "SALES",

              value:
                80,
            }),
          ]);

        const rightAdmission =
          admittedResult([
            observation({
              id:
                "company-b-coal-production-2024",

              companyId:
                "COMPANY-B",

              value:
                50,
            }),

            observation({
              id:
                "company-b-coal-sales-2024",

              companyId:
                "COMPANY-B",

              metric:
                "SALES",

              value:
                50,
            }),
          ]);

        const queue =
          buildAdmittedPeerInvestigationQueue({
            leftAdmission,
            rightAdmission,
            peerEligibility:
              eligibility(),
          });

        expect(
          queue.cases
        ).toHaveLength(
          2
        );

        expect(
          queue.rejectedPriorityCount
        ).toBe(
          0
        );

        expect(
          queue.cases.map(
            (item) =>
              item.trigger.rank
          )
        ).toEqual([
          1,
          2,
        ]);

        expect(
          queue.cases.map(
            (item) =>
              item.metric
          )
        ).toEqual([
          "SALES",
          "PRODUCTION",
        ]);

        expect(
          queue.cases[0]
            .trigger.priorityScore
        ).toBeGreaterThan(
          queue.cases[1]
            .trigger.priorityScore
        );

        expect(
          queue.cases.every(
            (item) =>
              item.subject.kind ===
                "PEER_DIVERGENCE" &&
              item.subject.firstCompanyId ===
                "COMPANY-A" &&
              item.subject.secondCompanyId ===
                "COMPANY-B" &&
              item.causalExplanation ===
                "UNKNOWN"
          )
        ).toBe(true);
      }
    );

    it(
      "does not create cases from rejected admissions",
      () => {
        const queue =
          buildAdmittedPeerInvestigationQueue({
            leftAdmission:
              rejectedResult(),

            rightAdmission:
              admittedResult([
                observation({
                  id:
                    "company-b-coal-production-2024",

                  companyId:
                    "COMPANY-B",

                  value:
                    50,
                }),
              ]),

            peerEligibility:
              eligibility(),
          });

        expect(
          queue.cases
        ).toEqual(
          []
        );

        expect(
          queue.rejectedPriorityCount
        ).toBe(
          0
        );
      }
    );

    it(
      "does not create a case when comparable observations have no divergence",
      () => {
        const queue =
          buildAdmittedPeerInvestigationQueue({
            leftAdmission:
              admittedResult([
                observation({
                  value:
                    50,
                }),
              ]),

            rightAdmission:
              admittedResult([
                observation({
                  id:
                    "company-b-coal-production-2024",

                  companyId:
                    "COMPANY-B",

                  value:
                    50,
                }),
              ]),

            peerEligibility:
              eligibility(),
          });

        expect(
          queue.cases
        ).toEqual(
          []
        );

        expect(
          queue.rejectedPriorityCount
        ).toBe(
          0
        );
      }
    );

    it(
      "does not create cases from reverse non-canonical orientation",
      () => {
        const queue =
          buildAdmittedPeerInvestigationQueue({
            leftAdmission:
              admittedResult([
                observation({
                  id:
                    "company-b-coal-production-2024",

                  companyId:
                    "COMPANY-B",

                  value:
                    50,
                }),
              ]),

            rightAdmission:
              admittedResult([
                observation({
                  id:
                    "company-a-coal-production-2024",

                  companyId:
                    "COMPANY-A",

                  value:
                    60,
                }),
              ]),

            peerEligibility:
              eligibility(),
          });

        expect(
          queue.cases
        ).toEqual(
          []
        );

        expect(
          queue.rejectedPriorityCount
        ).toBe(
          0
        );
      }
    );

    it(
      "does not mutate admissions or peer eligibility",
      () => {
        const leftAdmission =
          admittedResult([
            observation({
              value:
                60,
            }),
          ]);

        const rightAdmission =
          admittedResult([
            observation({
              id:
                "company-b-coal-production-2024",

              companyId:
                "COMPANY-B",

              value:
                50,
            }),
          ]);

        const peerEligibility =
          eligibility();

        const leftSnapshot =
          structuredClone(
            leftAdmission
          );

        const rightSnapshot =
          structuredClone(
            rightAdmission
          );

        const eligibilitySnapshot =
          structuredClone(
            peerEligibility
          );

        buildAdmittedPeerInvestigationQueue({
          leftAdmission,
          rightAdmission,
          peerEligibility,
        });

        expect(
          leftAdmission
        ).toEqual(
          leftSnapshot
        );

        expect(
          rightAdmission
        ).toEqual(
          rightSnapshot
        );

        expect(
          peerEligibility
        ).toEqual(
          eligibilitySnapshot
        );
      }
    );
  }
);