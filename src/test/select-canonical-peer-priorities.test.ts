import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXPeerDivergencePriorityResult,
} from "../intelligence/priority/peer-divergence-priority";

import {
  selectCanonicalPeerPriorities,
} from "../intelligence/priority/select-canonical-peer-priorities";

function priority(
  input: {
    leftCompanyId:
      string;

    rightCompanyId:
      string;

    metric?:
      RXPeerDivergencePriorityResult["metric"];

    commodity?:
      RXPeerDivergencePriorityResult["commodity"];

    status?:
      RXPeerDivergencePriorityResult["status"];

    score?:
      number | null;

    divergenceMagnitude?:
      number | null;
  }
): RXPeerDivergencePriorityResult {
  return {
    leftCompanyId:
      input.leftCompanyId,

    rightCompanyId:
      input.rightCompanyId,

    leftObservationId:
      `${input.leftCompanyId}-obs`,

    rightObservationId:
      `${input.rightCompanyId}-obs`,

    metric:
      input.metric ??
      "PRODUCTION",

    commodity:
      input.commodity ??
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
    },

    rightPeriod: {
      kind:
        "YEAR",

      year:
        2024,
    },

    status:
      input.status ??
      "SCORABLE",

    score:
      input.score ===
      undefined
        ? 20
        : input.score,

    divergenceMagnitude:
      input.divergenceMagnitude ===
      undefined
        ? 0.25
        : input.divergenceMagnitude,

    unscorableReasons:
      [],

    causalConclusion:
      "UNKNOWN",
  };
}

describe(
  "selectCanonicalPeerPriorities",
  () => {
    it(
      "keeps canonical scorable peer priorities",
      () => {
        const input =
          priority({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-B",
          });

        expect(
          selectCanonicalPeerPriorities(
            [input]
          )
        ).toEqual(
          [input]
        );
      }
    );

    it(
      "excludes reverse orientation",
      () => {
        const reverse =
          priority({
            leftCompanyId:
              "COMPANY-B",

            rightCompanyId:
              "COMPANY-A",
          });

        expect(
          selectCanonicalPeerPriorities(
            [reverse]
          )
        ).toEqual([]);
      }
    );

    it(
      "preserves repeated canonical priorities without inventing dedup semantics",
      () => {
        const first =
          priority({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-B",

            score:
              20,

            divergenceMagnitude:
              0.25,
          });

        const second =
          priority({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-B",

            score:
              40,

            divergenceMagnitude:
              0.5,
          });

        expect(
          selectCanonicalPeerPriorities(
            [
              first,
              second,
            ]
          )
        ).toEqual([
          first,
          second,
        ]);
      }
    );

    it(
      "preserves different metrics for the same pair",
      () => {
        const production =
          priority({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-B",

            metric:
              "PRODUCTION",
          });

        const sales =
          priority({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-B",

            metric:
              "SALES",
          });

        expect(
          selectCanonicalPeerPriorities(
            [
              production,
              sales,
            ]
          )
        ).toEqual([
          production,
          sales,
        ]);
      }
    );

    it(
      "preserves different commodities for the same pair",
      () => {
        const coal =
          priority({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-B",

            commodity:
              "COAL",
          });

        const gold =
          priority({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-B",

            commodity:
              "GOLD",
          });

        expect(
          selectCanonicalPeerPriorities(
            [
              coal,
              gold,
            ]
          )
        ).toEqual([
          coal,
          gold,
        ]);
      }
    );

    it(
      "excludes unscorable and invalid-score priorities",
      () => {
        const unscorable =
          priority({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-B",

            status:
              "UNSCORABLE",

            score:
              null,

            divergenceMagnitude:
              null,
          });

        const invalid =
          priority({
            leftCompanyId:
              "COMPANY-C",

            rightCompanyId:
              "COMPANY-D",

            score:
              Number.NaN,
          });

        expect(
          selectCanonicalPeerPriorities(
            [
              unscorable,
              invalid,
            ]
          )
        ).toEqual([]);
      }
    );

    it(
      "does not mutate the input collection",
      () => {
        const input = [
          priority({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-B",
          }),

          priority({
            leftCompanyId:
              "COMPANY-B",

            rightCompanyId:
              "COMPANY-A",
          }),
        ];

        const before =
          structuredClone(
            input
          );

        selectCanonicalPeerPriorities(
          input
        );

        expect(
          input
        ).toEqual(
          before
        );
      }
    );
  }
);
