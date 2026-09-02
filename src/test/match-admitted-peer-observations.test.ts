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
  matchAdmittedPeerObservations,
} from "../intelligence/comparability/match-admitted-peer-observations";

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
      48.11,

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
  "matchAdmittedPeerObservations",
  () => {
    it(
      "matches fully comparable admitted peer observations",
      () => {
        const left =
          observation();

        const right =
          observation({
            id:
              "company-b-coal-production-2024",

            companyId:
              "COMPANY-B",

            value:
              52.4,
          });

        const matches =
          matchAdmittedPeerObservations({
            leftAdmission:
              admittedResult([
                left,
              ]),

            rightAdmission:
              admittedResult([
                right,
              ]),

            peerEligibility:
              eligibility(),
          });

        expect(
          matches
        ).toHaveLength(1);

        expect(
          matches[0]
            .leftObservation.id
        ).toBe(left.id);

        expect(
          matches[0]
            .rightObservation.id
        ).toBe(right.id);

        expect(
          matches[0]
            .comparability.eligible
        ).toBe(true);

        expect(
          matches[0]
            .comparability.issues
        ).toEqual([]);

        expect(
          matches[0]
            .comparability
            .causalConclusion
        ).toBe("UNKNOWN");
      }
    );

    it(
      "does not match when either evidence admission was rejected",
      () => {
        const left =
          observation();

        const right =
          observation({
            id:
              "company-b-coal-production-2024",

            companyId:
              "COMPANY-B",
          });

        expect(
          matchAdmittedPeerObservations({
            leftAdmission:
              rejectedResult(),

            rightAdmission:
              admittedResult([
                right,
              ]),

            peerEligibility:
              eligibility(),
          })
        ).toEqual([]);

        expect(
          matchAdmittedPeerObservations({
            leftAdmission:
              admittedResult([
                left,
              ]),

            rightAdmission:
              rejectedResult(),

            peerEligibility:
              eligibility(),
          })
        ).toEqual([]);
      }
    );

    it(
      "never falls back to normalized observations that were not admitted",
      () => {
        const admittedLeft =
          observation();

        const unadmittedRight =
          observation({
            id:
              "company-b-unadmitted",

            companyId:
              "COMPANY-B",

            value:
              52.4,
          });

        const matches =
          matchAdmittedPeerObservations({
            leftAdmission:
              admittedResult([
                admittedLeft,
              ]),

            rightAdmission:
              admittedResult(
                [],
                [
                  unadmittedRight,
                ]
              ),

            peerEligibility:
              eligibility(),
          });

        expect(
          matches
        ).toEqual([]);
      }
    );

    it(
      "does not match observations with different metrics",
      () => {
        const matches =
          matchAdmittedPeerObservations({
            leftAdmission:
              admittedResult([
                observation(),
              ]),

            rightAdmission:
              admittedResult([
                observation({
                  id:
                    "company-b-sales-2024",

                  companyId:
                    "COMPANY-B",

                  metric:
                    "SALES",
                }),
              ]),

            peerEligibility:
              eligibility(),
          });

        expect(
          matches
        ).toEqual([]);
      }
    );

    it(
      "does not match observations with different commodity subtypes",
      () => {
        const matches =
          matchAdmittedPeerObservations({
            leftAdmission:
              admittedResult([
                observation(),
              ]),

            rightAdmission:
              admittedResult([
                observation({
                  id:
                    "company-b-met-coal-2024",

                  companyId:
                    "COMPANY-B",

                  commoditySubtype:
                    "Metallurgical Coal",
                }),
              ]),

            peerEligibility:
              eligibility(),
          });

        expect(
          matches
        ).toEqual([]);
      }
    );

    it(
      "does not match observations from different periods",
      () => {
        const matches =
          matchAdmittedPeerObservations({
            leftAdmission:
              admittedResult([
                observation(),
              ]),

            rightAdmission:
              admittedResult([
                observation({
                  id:
                    "company-b-coal-production-2023",

                  companyId:
                    "COMPANY-B",

                  period: {
                    kind:
                      "YEAR",

                    year:
                      2023,
                  },
                }),
              ]),

            peerEligibility:
              eligibility(),
          });

        expect(
          matches
        ).toEqual([]);
      }
    );

    it(
      "selects only comparable pairs across multiple admitted periods and metrics",
      () => {
        const left2024Production =
          observation();

        const left2023Production =
          observation({
            id:
              "company-a-coal-production-2023",

            period: {
              kind:
                "YEAR",

              year:
                2023,
            },

            value:
              44,
          });

        const left2024Sales =
          observation({
            id:
              "company-a-coal-sales-2024",

            metric:
              "SALES",

            value:
              50,
          });

        const right2024Production =
          observation({
            id:
              "company-b-coal-production-2024",

            companyId:
              "COMPANY-B",

            value:
              52.4,
          });

        const right2023Production =
          observation({
            id:
              "company-b-coal-production-2023",

            companyId:
              "COMPANY-B",

            period: {
              kind:
                "YEAR",

              year:
                2023,
            },

            value:
              46,
          });

        const right2024Sales =
          observation({
            id:
              "company-b-coal-sales-2024",

            companyId:
              "COMPANY-B",

            metric:
              "SALES",

            value:
              53,
          });

        const matches =
          matchAdmittedPeerObservations({
            leftAdmission:
              admittedResult([
                left2024Production,
                left2023Production,
                left2024Sales,
              ]),

            rightAdmission:
              admittedResult([
                right2024Production,
                right2023Production,
                right2024Sales,
              ]),

            peerEligibility:
              eligibility(),
          });

        expect(
          matches.map(
            (match) => [
              match.leftObservation.id,
              match.rightObservation.id,
            ]
          )
        ).toEqual([
          [
            left2024Production.id,
            right2024Production.id,
          ],
          [
            left2023Production.id,
            right2023Production.id,
          ],
          [
            left2024Sales.id,
            right2024Sales.id,
          ],
        ]);
      }
    );

    it(
      "allows reverse peer eligibility orientation",
      () => {
        const matches =
          matchAdmittedPeerObservations({
            leftAdmission:
              admittedResult([
                observation({
                  id:
                    "company-b-coal-production-2024",

                  companyId:
                    "COMPANY-B",
                }),
              ]),

            rightAdmission:
              admittedResult([
                observation({
                  id:
                    "company-a-coal-production-2024",

                  companyId:
                    "COMPANY-A",
                }),
              ]),

            peerEligibility:
              eligibility(),
          });

        expect(
          matches
        ).toHaveLength(1);

        expect(
          matches[0]
            .comparability.eligible
        ).toBe(true);
      }
    );

    it(
      "does not match when peer eligibility was rejected",
      () => {
        const matches =
          matchAdmittedPeerObservations({
            leftAdmission:
              admittedResult([
                observation(),
              ]),

            rightAdmission:
              admittedResult([
                observation({
                  id:
                    "company-b-coal-production-2024",

                  companyId:
                    "COMPANY-B",
                }),
              ]),

            peerEligibility:
              eligibility({
                status:
                  "REJECTED",

                issues: [
                  "NO_SHARED_COMMODITY",
                ],
              }),
          });

        expect(
          matches
        ).toEqual([]);
      }
    );

    it(
      "does not mutate admissions and returns isolated observation references",
      () => {
        const left =
          observation();

        const right =
          observation({
            id:
              "company-b-coal-production-2024",

            companyId:
              "COMPANY-B",

            value:
              52.4,
          });

        const leftAdmission =
          admittedResult([
            left,
          ]);

        const rightAdmission =
          admittedResult([
            right,
          ]);

        const leftSnapshot =
          structuredClone(
            leftAdmission
          );

        const rightSnapshot =
          structuredClone(
            rightAdmission
          );

        const matches =
          matchAdmittedPeerObservations({
            leftAdmission,
            rightAdmission,
            peerEligibility:
              eligibility(),
          });

        expect(
          leftAdmission
        ).toEqual(leftSnapshot);

        expect(
          rightAdmission
        ).toEqual(rightSnapshot);

        expect(
          matches
        ).toHaveLength(1);

        expect(
          matches[0]
            .leftObservation
        ).not.toBe(left);

        expect(
          matches[0]
            .rightObservation
        ).not.toBe(right);

        expect(
          matches[0]
            .leftObservation.unit
        ).not.toBe(left.unit);

        expect(
          matches[0]
            .rightObservation.period
        ).not.toBe(right.period);

        matches[0]
          .leftObservation.unit.symbol =
          "changed";

        matches[0]
          .rightObservation.period.year =
          2030;

        expect(
          left.unit.symbol
        ).toBe("Mt");

        expect(
          right.period.year
        ).toBe(2024);
      }
    );
  }
);
