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
  "comparePeerObservations",
  () => {
    it(
      "allows peer observations that are fully aligned",
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

        const result =
          comparePeerObservations(
            left,
            right,
            eligibility()
          );

        expect(
          result.eligible
        ).toBe(true);

        expect(
          result.issues
        ).toEqual([]);

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "rejects observations when peer eligibility was rejected",
      () => {
        const result =
          comparePeerObservations(
            observation(),
            observation({
              companyId:
                "COMPANY-B",
            }),
            eligibility({
              status:
                "REJECTED",

              issues: [
                "NO_SHARED_COMMODITY",
              ],
            })
          );

        expect(
          result.eligible
        ).toBe(false);

        expect(
          result.issues
        ).toContain(
          "PEER_NOT_ELIGIBLE"
        );
      }
    );

    it(
      "rejects observations whose companies do not match the peer proof",
      () => {
        const result =
          comparePeerObservations(
            observation(),
            observation({
              companyId:
                "COMPANY-C",
            }),
            eligibility()
          );

        expect(
          result.eligible
        ).toBe(false);

        expect(
          result.issues
        ).toContain(
          "PEER_PAIR_MISMATCH"
        );
      }
    );

    it(
      "allows the peer proof in reverse company order",
      () => {
        const left =
          observation({
            companyId:
              "COMPANY-B",
          });

        const right =
          observation({
            companyId:
              "COMPANY-A",
          });

        const result =
          comparePeerObservations(
            left,
            right,
            eligibility()
          );

        expect(
          result.eligible
        ).toBe(true);
      }
    );

    it(
      "rejects observations from the same company",
      () => {
        const result =
          comparePeerObservations(
            observation(),
            observation({
              id:
                "obs-b",
            }),
            eligibility()
          );

        expect(
          result.eligible
        ).toBe(false);

        expect(
          result.issues
        ).toContain(
          "SAME_COMPANY"
        );
      }
    );

    it(
      "requires the same metric for peer comparison",
      () => {
        const result =
          comparePeerObservations(
            observation(),
            observation({
              companyId:
                "COMPANY-B",

              metric:
                "SALES",
            }),
            eligibility()
          );

        expect(
          result.eligible
        ).toBe(false);

        expect(
          result.issues
        ).toContain(
          "METRIC_NOT_ALIGNED"
        );
      }
    );

    it(
      "requires aligned commodity",
      () => {
        const result =
          comparePeerObservations(
            observation(),
            observation({
              companyId:
                "COMPANY-B",

              commodity:
                "GOLD",
            }),
            eligibility()
          );

        expect(
          result.eligible
        ).toBe(false);

        expect(
          result.issues
        ).toContain(
          "COMMODITY_NOT_ALIGNED"
        );
      }
    );

    it(
      "requires the observation commodity to exist in the peer basis",
      () => {
        const result =
          comparePeerObservations(
            observation(),
            observation({
              companyId:
                "COMPANY-B",
            }),
            eligibility({
              sharedCommodities: [
                "GOLD",
              ],
            })
          );

        expect(
          result.eligible
        ).toBe(false);

        expect(
          result.issues
        ).toContain(
          "COMMODITY_NOT_IN_PEER_BASIS"
        );
      }
    );

    it(
      "requires aligned commodity subtype",
      () => {
        const result =
          comparePeerObservations(
            observation(),
            observation({
              companyId:
                "COMPANY-B",

              commoditySubtype:
                "Metallurgical Coal",
            }),
            eligibility()
          );

        expect(
          result.eligible
        ).toBe(false);

        expect(
          result.issues
        ).toContain(
          "COMMODITY_SUBTYPE_NOT_ALIGNED"
        );
      }
    );

    it(
      "rejects null instead of treating it as zero",
      () => {
        const result =
          comparePeerObservations(
            observation(),
            observation({
              companyId:
                "COMPANY-B",

              value:
                null,
            }),
            eligibility()
          );

        expect(
          result.eligible
        ).toBe(false);

        expect(
          result.issues
        ).toContain(
          "DATA_MISSING"
        );
      }
    );

    it(
      "rejects unknown semantics",
      () => {
        const result =
          comparePeerObservations(
            observation(),
            observation({
              companyId:
                "COMPANY-B",

              semantic: {
                state:
                  "UNKNOWN",

                description:
                  "Description alone proves nothing.",
              },
            }),
            eligibility()
          );

        expect(
          result.eligible
        ).toBe(false);

        expect(
          result.issues
        ).toContain(
          "SEMANTICS_UNKNOWN"
        );
      }
    );

    it(
      "rejects incompatible units",
      () => {
        const result =
          comparePeerObservations(
            observation(),
            observation({
              companyId:
                "COMPANY-B",

              unit: {
                symbol:
                  "TNi",

                dimension:
                  "CONTAINED_METAL",
              },
            }),
            eligibility()
          );

        expect(
          result.eligible
        ).toBe(false);

        expect(
          result.issues
        ).toContain(
          "UNIT_NOT_COMPARABLE"
        );
      }
    );

    it(
      "rejects different periods",
      () => {
        const result =
          comparePeerObservations(
            observation(),
            observation({
              companyId:
                "COMPANY-B",

              period: {
                kind:
                  "YEAR",

                year:
                  2023,
              },
            }),
            eligibility()
          );

        expect(
          result.eligible
        ).toBe(false);

        expect(
          result.issues
        ).toContain(
          "TIME_NOT_ALIGNED"
        );
      }
    );
     }
    );