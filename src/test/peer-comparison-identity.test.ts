import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXPeerDivergencePriorityResult,
} from "../intelligence/priority/peer-divergence-priority";

import {
  createPeerComparisonIdentity,
} from "../intelligence/comparability/peer-comparison-identity";

function priority(
  overrides:
    Partial<RXPeerDivergencePriorityResult> = {}
): RXPeerDivergencePriorityResult {
  return {
    leftCompanyId:
      "COMPANY-A",

    rightCompanyId:
      "COMPANY-B",

    leftObservationId:
      "obs-a",

    rightObservationId:
      "obs-b",

    metric:
      "PRODUCTION",

    commodity:
      "COAL",

    leftCommoditySubtype:
      "Sub-bituminous Coal",

    rightCommoditySubtype:
      "Sub-bituminous Coal",

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

      rawLabel:
        "FY 2024",
    },

    rightPeriod: {
      kind:
        "YEAR",

      year:
        2024,

      rawLabel:
        "2024",
    },

    status:
      "SCORABLE",

    score:
      20,

    divergenceMagnitude:
      0.25,

    unscorableReasons:
      [],

    causalConclusion:
      "UNKNOWN",

    ...overrides,
  };
}

describe(
  "createPeerComparisonIdentity",
  () => {
        it(
          "creates the same identity when the full aligned comparison orientation is reversed",
          () => {
            const direct =
              priority({
                leftCompanyId:
                  "COMPANY-A",

                rightCompanyId:
                  "COMPANY-B",

                leftObservationId:
                  "obs-a",

                rightObservationId:
                  "obs-b",

                leftCommoditySubtype:
                  "Sub-bituminous Coal",

                rightCommoditySubtype:
                  "Sub-bituminous Coal",

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

                  rawLabel:
                    "Company A FY 2024",
                },

                rightPeriod: {
                  kind:
                    "YEAR",

                  year:
                    2024,

                  rawLabel:
                    "Company B 2024",
                },
              });

            const reverse =
              priority({
                leftCompanyId:
                  direct.rightCompanyId,

                rightCompanyId:
                  direct.leftCompanyId,

                leftObservationId:
                  direct.rightObservationId,

                rightObservationId:
                  direct.leftObservationId,

                leftCommoditySubtype:
                  direct.rightCommoditySubtype,

                rightCommoditySubtype:
                  direct.leftCommoditySubtype,

                leftUnit: {
                  ...direct.rightUnit,
                },

                rightUnit: {
                  ...direct.leftUnit,
                },

                leftPeriod: {
                  ...direct.rightPeriod,
                },

                rightPeriod: {
                  ...direct.leftPeriod,
                },
              });

            const directIdentity =
              createPeerComparisonIdentity(
                direct
              );

            const reverseIdentity =
              createPeerComparisonIdentity(
                reverse
              );

            expect(
              reverseIdentity.pairKey
            ).toBe(
              directIdentity.pairKey
            );

            expect(
              reverseIdentity.key
            ).toBe(
              directIdentity.key
            );
          }
        );

    it(
      "distinguishes different metrics",
      () => {
        const production =
          createPeerComparisonIdentity(
            priority({
              metric:
                "PRODUCTION",
            })
          );

        const sales =
          createPeerComparisonIdentity(
            priority({
              metric:
                "SALES",
            })
          );

        expect(
          production.key
        ).not.toBe(
          sales.key
        );
      }
    );

    it(
      "distinguishes different commodities",
      () => {
        const coal =
          createPeerComparisonIdentity(
            priority({
              commodity:
                "COAL",
            })
          );

        const gold =
          createPeerComparisonIdentity(
            priority({
              commodity:
                "GOLD",
            })
          );

        expect(
          coal.key
        ).not.toBe(
          gold.key
        );
      }
    );

    it(
      "distinguishes different commodity subtypes",
      () => {
        const first =
          createPeerComparisonIdentity(
            priority({
              leftCommoditySubtype:
                "Sub-bituminous Coal",
            })
          );

        const second =
          createPeerComparisonIdentity(
            priority({
              leftCommoditySubtype:
                "Metallurgical Coal",
            })
          );

        expect(
          first.key
        ).not.toBe(
          second.key
        );
      }
    );

    it(
      "distinguishes different semantic periods",
      () => {
        const first =
          createPeerComparisonIdentity(
            priority()
          );

        const second =
          createPeerComparisonIdentity(
            priority({
              leftPeriod: {
                kind:
                  "YEAR",

                year:
                  2025,
              },
            })
          );

        expect(
          first.key
        ).not.toBe(
          second.key
        );
      }
    );

    it(
      "ignores raw period labels",
      () => {
        const first =
          createPeerComparisonIdentity(
            priority({
              leftPeriod: {
                kind:
                  "YEAR",

                year:
                  2024,

                rawLabel:
                  "FY 2024",
              },
            })
          );

        const second =
          createPeerComparisonIdentity(
            priority({
              leftPeriod: {
                kind:
                  "YEAR",

                year:
                  2024,

                rawLabel:
                  "2024",
              },
            })
          );

        expect(
          first.key
        ).toBe(
          second.key
        );
      }
    );

    it(
      "does not use observation provenance in logical identity",
      () => {
        const first =
          createPeerComparisonIdentity(
            priority({
              leftObservationId:
                "obs-a-1",

              rightObservationId:
                "obs-b-1",
            })
          );

        const second =
          createPeerComparisonIdentity(
            priority({
              leftObservationId:
                "obs-a-2",

              rightObservationId:
                "obs-b-2",
            })
          );

        expect(
          first.key
        ).toBe(
          second.key
        );
      }
    );

    it(
      "does not use score or divergence magnitude in logical identity",
      () => {
        const first =
          createPeerComparisonIdentity(
            priority({
              score:
                20,

              divergenceMagnitude:
                0.25,
            })
          );

        const second =
          createPeerComparisonIdentity(
            priority({
              score:
                40,

              divergenceMagnitude:
                0.5,
            })
          );

        expect(
          first.key
        ).toBe(
          second.key
        );
      }
    );

    it(
      "does not mutate the source priority",
      () => {
        const source =
          priority();

        const before =
          structuredClone(
            source
          );

        createPeerComparisonIdentity(
          source
        );

        expect(
          source
        ).toEqual(
          before
        );
      }
    );
  }
);
