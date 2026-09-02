import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXNormalizedObservation,
} from "../data/normalization/normalized-observation";

import type {
  RXPeerEligibilityResult,
} from "../intelligence/comparability/peer-eligibility";

import {
  calculatePeerRelativePosition,
} from "../intelligence/comparability/calculate-peer-relative-position";

function observation(
  overrides:
    Partial<RXNormalizedObservation> = {}
): RXNormalizedObservation {
  return {
    id:
      "OBS-A",

    companyId:
      "COMPANY-A",

    commodity:
      "COAL",

    commoditySubtype:
      "Sub-bituminous Coal",

    metric:
      "PRODUCTION",

    value:
      48,

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

    evidence: [],

    sourceField:
      "production",

    semanticDescription:
      "COAL production",

    semantic: {
      state:
        "KNOWN",

      description:
        "COAL production",

      basis:
        "Validated test mapping.",
    },

    ...overrides,
  };
}

function eligibility(
  leftCompanyId:
    string,
  rightCompanyId:
    string,
  overrides:
    Partial<RXPeerEligibilityResult> = {}
): RXPeerEligibilityResult {
  return {
    status:
      "ELIGIBLE",

    leftCompanyId,

    rightCompanyId,

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
  "calculatePeerRelativePosition",
  () => {
    it(
      "calculates deterministic relative position from valid peers only",
      () => {
        const target =
          observation({
            id:
              "TARGET",

            companyId:
              "TARGET-COMPANY",

            value:
              48,
          });

        const peerOne =
          observation({
            id:
              "PEER-1",

            companyId:
              "PEER-COMPANY-1",

            value:
              40,
          });

        const peerTwo =
          observation({
            id:
              "PEER-2",

            companyId:
              "PEER-COMPANY-2",

            value:
              50,
          });

        const peerThree =
          observation({
            id:
              "PEER-3",

            companyId:
              "PEER-COMPANY-3",

            value:
              60,
          });

        const result =
          calculatePeerRelativePosition({
            target,

            peers: [
              {
                observation:
                  peerOne,

                peerEligibility:
                  eligibility(
                    "TARGET-COMPANY",
                    "PEER-COMPANY-1"
                  ),
              },

              {
                observation:
                  peerTwo,

                peerEligibility:
                  eligibility(
                    "TARGET-COMPANY",
                    "PEER-COMPANY-2"
                  ),
              },

              {
                observation:
                  peerThree,

                peerEligibility:
                  eligibility(
                    "TARGET-COMPANY",
                    "PEER-COMPANY-3"
                  ),
              },
            ],
          });

        expect(
          result.status
        ).toBe(
          "POSITIONED"
        );

        expect(
          result.peerCount
        ).toBe(
          3
        );

        expect(
          result.peerMean
        ).toBe(
          50
        );

        expect(
          result.peerMedian
        ).toBe(
          50
        );

        expect(
          result.differenceFromPeerMean
        ).toBe(
          -2
        );

        expect(
          result.differenceFromPeerMedian
        ).toBe(
          -2
        );

        expect(
          result.peersBelowTarget
        ).toBe(
          1
        );

        expect(
          result.peersEqualTarget
        ).toBe(
          0
        );

        expect(
          result.peersAboveTarget
        ).toBe(
          2
        );
      }
    );

    it(
      "does not include the target value in peer mean or median",
      () => {
        const target =
          observation({
            id:
              "TARGET",

            companyId:
              "TARGET-COMPANY",

            value:
              100,
          });

        const peerOne =
          observation({
            id:
              "PEER-1",

            companyId:
              "PEER-COMPANY-1",

            value:
              10,
          });

        const peerTwo =
          observation({
            id:
              "PEER-2",

            companyId:
              "PEER-COMPANY-2",

            value:
              20,
          });

        const result =
          calculatePeerRelativePosition({
            target,

            peers: [
              {
                observation:
                  peerOne,

                peerEligibility:
                  eligibility(
                    "TARGET-COMPANY",
                    "PEER-COMPANY-1"
                  ),
              },

              {
                observation:
                  peerTwo,

                peerEligibility:
                  eligibility(
                    "TARGET-COMPANY",
                    "PEER-COMPANY-2"
                  ),
              },
            ],
          });

        expect(
          result.peerMean
        ).toBe(
          15
        );

        expect(
          result.peerMedian
        ).toBe(
          15
        );
      }
    );

    it(
      "supports an odd peer count median",
      () => {
        const target =
          observation({
            id:
              "TARGET",

            companyId:
              "TARGET-COMPANY",
          });

        const values = [
          10,
          30,
          20,
        ];

        const peers =
          values.map(
            (
              value,
              index
            ) => {
              const companyId =
                `PEER-${index + 1}`;

              return {
                observation:
                  observation({
                    id:
                      `OBS-${index + 1}`,

                    companyId,

                    value,
                  }),

                peerEligibility:
                  eligibility(
                    "TARGET-COMPANY",
                    companyId
                  ),
              };
            }
          );

        const result =
          calculatePeerRelativePosition({
            target,
            peers,
          });

        expect(
          result.peerMedian
        ).toBe(
          20
        );
      }
    );

    it(
      "supports an even peer count median",
      () => {
        const target =
          observation({
            id:
              "TARGET",

            companyId:
              "TARGET-COMPANY",
          });

        const values = [
          10,
          20,
          30,
          40,
        ];

        const peers =
          values.map(
            (
              value,
              index
            ) => {
              const companyId =
                `PEER-${index + 1}`;

              return {
                observation:
                  observation({
                    id:
                      `OBS-${index + 1}`,

                    companyId,

                    value,
                  }),

                peerEligibility:
                  eligibility(
                    "TARGET-COMPANY",
                    companyId
                  ),
              };
            }
          );

        const result =
          calculatePeerRelativePosition({
            target,
            peers,
          });

        expect(
          result.peerMedian
        ).toBe(
          25
        );
      }
    );

    it(
      "excludes peers that fail 015B comparability",
      () => {
        const target =
          observation({
            id:
              "TARGET",

            companyId:
              "TARGET-COMPANY",

            value:
              50,
          });

        const validPeer =
          observation({
            id:
              "VALID-PEER",

            companyId:
              "VALID-COMPANY",

            value:
              40,
          });

        const invalidPeer =
          observation({
            id:
              "INVALID-PEER",

            companyId:
              "INVALID-COMPANY",

            metric:
              "SALES",

            value:
              1000,
          });

        const result =
          calculatePeerRelativePosition({
            target,

            peers: [
              {
                observation:
                  validPeer,

                peerEligibility:
                  eligibility(
                    "TARGET-COMPANY",
                    "VALID-COMPANY"
                  ),
              },

              {
                observation:
                  invalidPeer,

                peerEligibility:
                  eligibility(
                    "TARGET-COMPANY",
                    "INVALID-COMPANY"
                  ),
              },
            ],
          });

        expect(
          result.peerCount
        ).toBe(
          1
        );

        expect(
          result.peerMean
        ).toBe(
          40
        );

        expect(
          result.includedPeerObservationIds
        ).toEqual([
          "VALID-PEER",
        ]);

        expect(
          result.rejectedPeers
        ).toEqual([
          {
            observationId:
              "INVALID-PEER",

            companyId:
              "INVALID-COMPANY",

            comparabilityIssues: [
              "METRIC_NOT_ALIGNED",
            ],
          },
        ]);
      }
    );

    it(
      "returns NOT_POSITIONED when no peer passes comparability",
      () => {
        const target =
          observation({
            id:
              "TARGET",

            companyId:
              "TARGET-COMPANY",
          });

        const peer =
          observation({
            id:
              "PEER",

            companyId:
              "PEER-COMPANY",

            period: {
              kind:
                "YEAR",

              year:
                2023,
            },
          });

        const result =
          calculatePeerRelativePosition({
            target,

            peers: [
              {
                observation:
                  peer,

                peerEligibility:
                  eligibility(
                    "TARGET-COMPANY",
                    "PEER-COMPANY"
                  ),
              },
            ],
          });

        expect(
          result.status
        ).toBe(
          "NOT_POSITIONED"
        );

        expect(
          result.peerCount
        ).toBe(
          0
        );

        expect(
          result.peerMean
        ).toBeNull();

        expect(
          result.peerMedian
        ).toBeNull();

        expect(
          result.issues
        ).toEqual([
          "NO_VALID_PEERS",
        ]);
      }
    );

    it(
      "preserves null semantics instead of treating null as zero",
      () => {
        const target =
          observation({
            id:
              "TARGET",

            companyId:
              "TARGET-COMPANY",

            value:
              50,
          });

        const peer =
          observation({
            id:
              "PEER",

            companyId:
              "PEER-COMPANY",

            value:
              null,
          });

        const result =
          calculatePeerRelativePosition({
            target,

            peers: [
              {
                observation:
                  peer,

                peerEligibility:
                  eligibility(
                    "TARGET-COMPANY",
                    "PEER-COMPANY"
                  ),
              },
            ],
          });

        expect(
          result.status
        ).toBe(
          "NOT_POSITIONED"
        );

        expect(
          result.peerMean
        ).toBeNull();

        expect(
          result.rejectedPeers[
            0
          ].comparabilityIssues
        ).toContain(
          "DATA_MISSING"
        );
      }
    );

    it(
      "accepts reverse-order peer eligibility proof through 015B",
      () => {
        const target =
          observation({
            id:
              "TARGET",

            companyId:
              "TARGET-COMPANY",

            value:
              50,
          });

        const peer =
          observation({
            id:
              "PEER",

            companyId:
              "PEER-COMPANY",

            value:
              40,
          });

        const result =
          calculatePeerRelativePosition({
            target,

            peers: [
              {
                observation:
                  peer,

                peerEligibility:
                  eligibility(
                    "PEER-COMPANY",
                    "TARGET-COMPANY"
                  ),
              },
            ],
          });

        expect(
          result.status
        ).toBe(
          "POSITIONED"
        );

        expect(
          result.peerCount
        ).toBe(
          1
        );

        expect(
          result.peerMean
        ).toBe(
          40
        );
      }
    );

    it(
      "counts peers below equal to and above the target without interpretation",
      () => {
        const target =
          observation({
            id:
              "TARGET",

            companyId:
              "TARGET-COMPANY",

            value:
              50,
          });

        const values = [
          40,
          50,
          60,
        ];

        const peers =
          values.map(
            (
              value,
              index
            ) => {
              const companyId =
                `PEER-${index + 1}`;

              return {
                observation:
                  observation({
                    id:
                      `OBS-${index + 1}`,

                    companyId,

                    value,
                  }),

                peerEligibility:
                  eligibility(
                    "TARGET-COMPANY",
                    companyId
                  ),
              };
            }
          );

        const result =
          calculatePeerRelativePosition({
            target,
            peers,
          });

        expect(
          result.peersBelowTarget
        ).toBe(
          1
        );

        expect(
          result.peersEqualTarget
        ).toBe(
          1
        );

        expect(
          result.peersAboveTarget
        ).toBe(
          1
        );

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "does not mutate target peers or eligibility proofs",
      () => {
        const target =
          observation({
            id:
              "TARGET",

            companyId:
              "TARGET-COMPANY",
          });

        const peer =
          observation({
            id:
              "PEER",

            companyId:
              "PEER-COMPANY",

            value:
              40,
          });

        const proof =
          eligibility(
            "TARGET-COMPANY",
            "PEER-COMPANY"
          );

        const targetBefore =
          structuredClone(
            target
          );

        const peerBefore =
          structuredClone(
            peer
          );

        const proofBefore =
          structuredClone(
            proof
          );

        calculatePeerRelativePosition({
          target,

          peers: [
            {
              observation:
                peer,

              peerEligibility:
                proof,
            },
          ],
        });

        expect(
          target
        ).toEqual(
          targetBefore
        );

        expect(
          peer
        ).toEqual(
          peerBefore
        );

        expect(
          proof
        ).toEqual(
          proofBefore
        );
      }
    );
  }
);