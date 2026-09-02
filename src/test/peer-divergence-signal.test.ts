import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXNormalizedObservation,
} from "../data/normalization/normalized-observation";

import {
  comparePeerObservations,
} from "../intelligence/comparability/compare-peer-observations";

import {
  createPeerDivergenceSignal,
} from "../intelligence/comparability/create-peer-divergence-signal";

import type {
  RXPeerEligibilityResult,
} from "../intelligence/comparability/peer-eligibility";

function observation(
  overrides:
    Partial<RXNormalizedObservation> = {}
): RXNormalizedObservation {
  return {
    id:
      "obs-a",

    companyId:
      "COMPANY-A",

    commodity:
      "COAL",

    commoditySubtype:
      "Sub-bituminous Coal",

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
  "createPeerDivergenceSignal",
  () => {
    it(
      "creates a deterministic divergence signal for comparable peer observations",
      () => {
        const left =
          observation({
            value:
              48.11,
          });

        const right =
          observation({
            id:
              "obs-b",

            companyId:
              "COMPANY-B",

            value:
              52.4,
          });

        const comparability =
          comparePeerObservations(
            left,
            right,
            eligibility()
          );

        const result =
          createPeerDivergenceSignal(
            left,
            right,
            comparability
          );

        expect(
          result.status
        ).toBe(
          "COMPARABLE"
        );

        expect(
          result.leftCompanyId
        ).toBe(
          "COMPANY-A"
        );

        expect(
          result.rightCompanyId
        ).toBe(
          "COMPANY-B"
        );

        expect(
          result.leftObservationId
        ).toBe(
          "obs-a"
        );

        expect(
          result.rightObservationId
        ).toBe(
          "obs-b"
        );

        expect(
          result.metric
        ).toBe(
          "PRODUCTION"
        );

        expect(
          result.commodity
        ).toBe(
          "COAL"
        );

        expect(
          result.leftCommoditySubtype
        ).toBe(
          "Sub-bituminous Coal"
        );

        expect(
          result.rightCommoditySubtype
        ).toBe(
          "Sub-bituminous Coal"
        );

        expect(
          result.leftUnit
        ).toEqual({
          symbol:
            "Mt",

          dimension:
            "MASS",
        });

        expect(
          result.rightUnit
        ).toEqual({
          symbol:
            "Mt",

          dimension:
            "MASS",
        });

        expect(
          result.leftPeriod
        ).toEqual({
          kind:
            "YEAR",

          year:
            2024,
        });

        expect(
          result.rightPeriod
        ).toEqual({
          kind:
            "YEAR",

          year:
            2024,
        });

        expect(
          result.leftValue
        ).toBe(
          48.11
        );

        expect(
          result.rightValue
        ).toBe(
          52.4
        );

        expect(
          result.absoluteDifference
        ).toBeCloseTo(
          4.29
        );

        expect(
          result.relativeDifference
        ).toBeCloseTo(
          (48.11 - 52.4) /
            52.4
        );

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "preserves source comparison context without sharing mutable unit or period references",
      () => {
        const left =
          observation();

        const right =
          observation({
            id:
              "obs-b",

            companyId:
              "COMPANY-B",
          });

        const comparability =
          comparePeerObservations(
            left,
            right,
            eligibility()
          );

        const result =
          createPeerDivergenceSignal(
            left,
            right,
            comparability
          );

        expect(
          result.leftUnit
        ).toEqual(
          left.unit
        );

        expect(
          result.leftUnit
        ).not.toBe(
          left.unit
        );

        expect(
          result.rightUnit
        ).toEqual(
          right.unit
        );

        expect(
          result.rightUnit
        ).not.toBe(
          right.unit
        );

        expect(
          result.leftPeriod
        ).toEqual(
          left.period
        );

        expect(
          result.leftPeriod
        ).not.toBe(
          left.period
        );

        expect(
          result.rightPeriod
        ).toEqual(
          right.period
        );

        expect(
          result.rightPeriod
        ).not.toBe(
          right.period
        );
      }
    );

    it(
      "preserves direction in relative difference while absolute difference remains unsigned",
      () => {
        const left =
          observation({
            value:
              60,
          });

        const right =
          observation({
            id:
              "obs-b",

            companyId:
              "COMPANY-B",

            value:
              50,
          });

        const comparability =
          comparePeerObservations(
            left,
            right,
            eligibility()
          );

        const result =
          createPeerDivergenceSignal(
            left,
            right,
            comparability
          );

        expect(
          result.absoluteDifference
        ).toBe(
          10
        );

        expect(
          result.relativeDifference
        ).toBeCloseTo(
          0.2
        );
      }
    );

    it(
      "returns null relative difference when the peer reference value is zero",
      () => {
        const left =
          observation({
            value:
              10,
          });

        const right =
          observation({
            id:
              "obs-b",

            companyId:
              "COMPANY-B",

            value:
              0,
          });

        const comparability =
          comparePeerObservations(
            left,
            right,
            eligibility()
          );

        expect(
          comparability.eligible
        ).toBe(true);

        const result =
          createPeerDivergenceSignal(
            left,
            right,
            comparability
          );

        expect(
          result.status
        ).toBe(
          "COMPARABLE"
        );

        expect(
          result.absoluteDifference
        ).toBe(
          10
        );

        expect(
          result.relativeDifference
        ).toBeNull();
      }
    );

    it(
      "preserves both observation contexts when observations are not comparable",
      () => {
        const left =
          observation();

        const right =
          observation({
            id:
              "obs-b",

            companyId:
              "COMPANY-B",

            commoditySubtype:
              "Metallurgical Coal",
          });

        const comparability =
          comparePeerObservations(
            left,
            right,
            eligibility()
          );

        expect(
          comparability.eligible
        ).toBe(false);

        expect(
          comparability.issues
        ).toContain(
          "COMMODITY_SUBTYPE_NOT_ALIGNED"
        );

        const result =
          createPeerDivergenceSignal(
            left,
            right,
            comparability
          );

        expect(
          result.status
        ).toBe(
          "NOT_COMPARABLE"
        );

        expect(
          result.leftObservationId
        ).toBe(
          "obs-a"
        );

        expect(
          result.rightObservationId
        ).toBe(
          "obs-b"
        );

        expect(
          result.leftCommoditySubtype
        ).toBe(
          "Sub-bituminous Coal"
        );

        expect(
          result.rightCommoditySubtype
        ).toBe(
          "Metallurgical Coal"
        );

        expect(
          result.leftValue
        ).toBeNull();

        expect(
          result.rightValue
        ).toBeNull();

        expect(
          result.absoluteDifference
        ).toBeNull();

        expect(
          result.relativeDifference
        ).toBeNull();

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "does not calculate divergence when data is missing",
      () => {
        const left =
          observation();

        const right =
          observation({
            id:
              "obs-b",

            companyId:
              "COMPANY-B",

            value:
              null,
          });

        const comparability =
          comparePeerObservations(
            left,
            right,
            eligibility()
          );

        expect(
          comparability.eligible
        ).toBe(false);

        expect(
          comparability.issues
        ).toContain(
          "DATA_MISSING"
        );

        const result =
          createPeerDivergenceSignal(
            left,
            right,
            comparability
          );

        expect(
          result.status
        ).toBe(
          "NOT_COMPARABLE"
        );

        expect(
          result.leftValue
        ).toBeNull();

        expect(
          result.rightValue
        ).toBeNull();

        expect(
          result.absoluteDifference
        ).toBeNull();

        expect(
          result.relativeDifference
        ).toBeNull();
      }
    );

    it(
      "does not override a rejected peer eligibility decision",
      () => {
        const left =
          observation();

        const right =
          observation({
            id:
              "obs-b",

            companyId:
              "COMPANY-B",

            value:
              52.4,
          });

        const rejectedEligibility =
          eligibility({
            status:
              "REJECTED",

            issues: [
              "NO_SHARED_COMMODITY",
            ],
          });

        const comparability =
          comparePeerObservations(
            left,
            right,
            rejectedEligibility
          );

        expect(
          comparability.eligible
        ).toBe(false);

        expect(
          comparability.issues
        ).toContain(
          "PEER_NOT_ELIGIBLE"
        );

        const result =
          createPeerDivergenceSignal(
            left,
            right,
            comparability
          );

        expect(
          result.status
        ).toBe(
          "NOT_COMPARABLE"
        );

        expect(
          result.absoluteDifference
        ).toBeNull();

        expect(
          result.relativeDifference
        ).toBeNull();

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );
  }
);
