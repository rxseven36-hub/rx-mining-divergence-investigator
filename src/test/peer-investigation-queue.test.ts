import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXRankedPeerDivergencePriorityResult,
} from "../intelligence/priority/rank-peer-priorities";

import {
  buildPeerInvestigationQueue,
} from "../investigation/peer-investigation-queue";

function rankedPriority(
  input: {
    leftCompanyId:
      string;

    rightCompanyId:
      string;

    rank:
      number;

    score:
      number;
  }
): RXRankedPeerDivergencePriorityResult {
  return {
    leftCompanyId:
      input.leftCompanyId,

    rightCompanyId:
      input.rightCompanyId,

    leftObservationId:
      `${input.leftCompanyId}-production-2024`,

    rightObservationId:
      `${input.rightCompanyId}-production-2024`,

    metric:
      "PRODUCTION",

    commodity:
      "COAL",

    leftCommoditySubtype:
      undefined,

    rightCommoditySubtype:
      undefined,

    leftUnit: {
      dimension:
        "MASS",

      symbol:
        "MT",
    },

    rightUnit: {
      dimension:
        "MASS",

      symbol:
        "MT",
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

    status:
      "SCORABLE",

    score:
      input.score,

    divergenceMagnitude:
      input.score / 100,

    unscorableReasons:
      [],

    causalConclusion:
      "UNKNOWN",

    rank:
      input.rank,
  };
}

describe(
  "buildPeerInvestigationQueue",
  () => {
    it(
      "builds peer cases in rank order even when input is shuffled",
      () => {
        const queue =
          buildPeerInvestigationQueue([
            rankedPriority({
              leftCompanyId:
                "E-COMPANY",

              rightCompanyId:
                "F-COMPANY",

              rank:
                3,

              score:
                20,
            }),

            rankedPriority({
              leftCompanyId:
                "A-COMPANY",

              rightCompanyId:
                "B-COMPANY",

              rank:
                1,

              score:
                80,
            }),

            rankedPriority({
              leftCompanyId:
                "C-COMPANY",

              rightCompanyId:
                "D-COMPANY",

              rank:
                2,

              score:
                50,
            }),
          ]);

        expect(
          queue.cases.map(
            (item) =>
              item.trigger.rank
          )
        ).toEqual([
          1,
          2,
          3,
        ]);

        expect(
          queue.cases.map(
            (item) => [
              item.subject
                .firstCompanyId,

              item.subject
                .secondCompanyId,
            ]
          )
        ).toEqual([
          [
            "A-COMPANY",
            "B-COMPANY",
          ],

          [
            "C-COMPANY",
            "D-COMPANY",
          ],

          [
            "E-COMPANY",
            "F-COMPANY",
          ],
        ]);
      }
    );

    it(
      "rejects invalid peer priorities instead of inventing cases",
      () => {
        const valid =
          rankedPriority({
            leftCompanyId:
              "A-COMPANY",

            rightCompanyId:
              "B-COMPANY",

            rank:
              1,

            score:
              50,
          });

        const nonCanonical =
          rankedPriority({
            leftCompanyId:
              "D-COMPANY",

            rightCompanyId:
              "C-COMPANY",

            rank:
              2,

            score:
              40,
          });

        const queue =
          buildPeerInvestigationQueue([
            valid,
            nonCanonical,
          ]);

        expect(
          queue.cases
        ).toHaveLength(
          1
        );

        expect(
          queue.rejectedPriorityCount
        ).toBe(
          1
        );

        expect(
          queue.cases[0]
            .subject
            .firstCompanyId
        ).toBe(
          "A-COMPANY"
        );

        expect(
          queue.cases[0]
            .subject
            .secondCompanyId
        ).toBe(
          "B-COMPANY"
        );
      }
    );

    it(
      "returns an empty queue when no priorities are supplied",
      () => {
        const queue =
          buildPeerInvestigationQueue(
            []
          );

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
          "does not mutate the supplied ranked priorities",
          () => {
            const first =
              rankedPriority({
                leftCompanyId:
                  "A-COMPANY",

                rightCompanyId:
                  "B-COMPANY",

                rank:
                  2,

                score:
                  20,
              });

            const second =
              rankedPriority({
                leftCompanyId:
                  "C-COMPANY",

                rightCompanyId:
                  "D-COMPANY",

                rank:
                  1,

                score:
                  80,
              });

            const input = [
              first,
              second,
            ];

            buildPeerInvestigationQueue(
              input
            );

            expect(
              input[0]
            ).toBe(
              first
            );

            expect(
              input[1]
            ).toBe(
              second
            );

            expect(
              input.map(
                (item) =>
                  item.rank
              )
            ).toEqual([
              2,
              1,
            ]);
          }
        );
      }
    );