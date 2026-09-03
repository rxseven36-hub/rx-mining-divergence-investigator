import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXRankedPeerDivergencePriorityResult,
} from "../intelligence/priority/rank-peer-priorities";

import {
  createPeerInvestigationCase,
} from "../investigation/create-peer-investigation-case";

function validPriority(
  overrides:
    Partial<RXRankedPeerDivergencePriorityResult> =
      {}
): RXRankedPeerDivergencePriorityResult {
  return {
    leftCompanyId:
      "A-COMPANY",

    rightCompanyId:
      "B-COMPANY",

    leftObservationId:
      "A-production-2024",

    rightObservationId:
      "B-production-2024",

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
      50,

    divergenceMagnitude:
      0.5,

    unscorableReasons:
      [],

    causalConclusion:
      "UNKNOWN",

    rank:
      1,

    ...overrides,
  };
}

describe(
  "createPeerInvestigationCase",
  () => {
    it(
      "creates a queued peer investigation case from a valid ranked priority",
      () => {
        const result =
          createPeerInvestigationCase(
            validPriority()
          );

        expect(
          result.ok
        ).toBe(
          true
        );

        if (
          !result.ok
        ) {
          throw new Error(
            "Expected peer case creation to succeed"
          );
        }

        expect(
          result.case.status
        ).toBe(
          "QUEUED"
        );

        expect(
          result.case.truthState
        ).toBe(
          "UNINVESTIGATED"
        );

        expect(
          result.case.trigger.rank
        ).toBe(
          1
        );

        expect(
          result.case.trigger.priorityScore
        ).toBe(
          50
        );

        expect(
          result.case.trigger.divergenceMagnitude
        ).toBe(
          0.5
        );
      }
    );

    it(
      "creates a canonical peer subject without changing provenance orientation",
      () => {
        const result =
          createPeerInvestigationCase(
            validPriority()
          );

        expect(
          result.ok
        ).toBe(
          true
        );

        if (
          !result.ok
        ) {
          throw new Error(
            "Expected peer case creation to succeed"
          );
        }

        expect(
          result.case.subject
        ).toEqual({
          kind:
            "PEER_DIVERGENCE",

          firstCompanyId:
            "A-COMPANY",

          secondCompanyId:
            "B-COMPANY",

          pairKey:
            JSON.stringify([
              "A-COMPANY",
              "B-COMPANY",
            ]),
        });

        expect(
          result.case.leftObservationId
        ).toBe(
          "A-production-2024"
        );

        expect(
          result.case.rightObservationId
        ).toBe(
          "B-production-2024"
        );
      }
    );

    it(
      "creates a deterministic case id and comparison identity",
      () => {
        const first =
          createPeerInvestigationCase(
            validPriority()
          );

        const second =
          createPeerInvestigationCase(
            validPriority()
          );

        expect(
          first.ok
        ).toBe(
          true
        );

        expect(
          second.ok
        ).toBe(
          true
        );

        if (
          !first.ok ||
          !second.ok
        ) {
          throw new Error(
            "Expected deterministic peer case creation"
          );
        }

        expect(
          first.case.caseId
        ).toBe(
          second.case.caseId
        );

        expect(
          first.case.comparisonIdentityKey
        ).toBe(
          second.case.comparisonIdentityKey
        );
      }
    );

    it(
      "preserves truth boundary at case creation",
      () => {
        const result =
          createPeerInvestigationCase(
            validPriority()
          );

        expect(
          result.ok
        ).toBe(
          true
        );

        if (
          !result.ok
        ) {
          throw new Error(
            "Expected peer case creation to succeed"
          );
        }

        expect(
          result.case.unknowns
        ).toEqual(
          []
        );

        expect(
          result.case.causalExplanation
        ).toBe(
          "UNKNOWN"
        );

        expect(
          result.case.trigger.triggerType
        ).toBe(
          "DETERMINISTIC_PEER_DIVERGENCE_PRIORITY"
        );
      }
    );

    it(
      "rejects a non-canonical peer priority",
      () => {
        const result =
          createPeerInvestigationCase(
            validPriority({
              leftCompanyId:
                "B-COMPANY",

              rightCompanyId:
                "A-COMPANY",
            })
          );

        expect(
          result.ok
        ).toBe(
          false
        );

        if (
          result.ok
        ) {
          throw new Error(
            "Expected non-canonical priority rejection"
          );
        }

        expect(
          result.reasons
        ).toContain(
          "PRIORITY_NOT_CANONICAL"
        );
      }
    );

    it(
      "rejects missing or invalid divergence magnitude",
      () => {
        const missing =
          createPeerInvestigationCase(
            validPriority({
              divergenceMagnitude:
                null,
            })
          );

        expect(
          missing.ok
        ).toBe(
          false
        );

        if (
          missing.ok
        ) {
          throw new Error(
            "Expected missing divergence rejection"
          );
        }

        expect(
          missing.reasons
        ).toContain(
          "DIVERGENCE_MAGNITUDE_MISSING"
        );

        const invalid =
          createPeerInvestigationCase(
            validPriority({
              divergenceMagnitude:
                Number.POSITIVE_INFINITY,
            })
          );

        expect(
          invalid.ok
        ).toBe(
          false
        );

        if (
          invalid.ok
        ) {
          throw new Error(
            "Expected invalid divergence rejection"
          );
        }

        expect(
          invalid.reasons
        ).toContain(
          "DIVERGENCE_MAGNITUDE_INVALID"
        );
      }
    );

    it(
      "rejects invalid score or rank",
      () => {
        const invalidScore =
          createPeerInvestigationCase(
            validPriority({
              score:
                Number.NaN,
            })
          );

        expect(
          invalidScore.ok
        ).toBe(
          false
        );

        if (
          invalidScore.ok
        ) {
          throw new Error(
            "Expected invalid score rejection"
          );
        }

        expect(
          invalidScore.reasons
        ).toContain(
          "PRIORITY_SCORE_INVALID"
        );

        const invalidRank =
          createPeerInvestigationCase(
            validPriority({
              rank:
                0,
            })
          );

        expect(
          invalidRank.ok
        ).toBe(
          false
        );

        if (
          invalidRank.ok
        ) {
          throw new Error(
            "Expected invalid rank rejection"
          );
        }

        expect(
          invalidRank.reasons
        ).toContain(
          "RANK_INVALID"
        );
      }
    );

    it(
      "copies nested comparison context instead of sharing mutable objects",
      () => {
        const priority =
          validPriority();

        const result =
          createPeerInvestigationCase(
            priority
          );

        expect(
          result.ok
        ).toBe(
          true
        );

        if (
          !result.ok
        ) {
          throw new Error(
            "Expected peer case creation to succeed"
          );
        }

        expect(
          result.case.leftUnit
        ).toEqual(
          priority.leftUnit
        );

        expect(
          result.case.leftUnit
        ).not.toBe(
          priority.leftUnit
        );

        expect(
          result.case.leftPeriod
        ).toEqual(
          priority.leftPeriod
        );

        expect(
          result.case.leftPeriod
        ).not.toBe(
          priority.leftPeriod
        );

        expect(
          priority.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );
  }
);