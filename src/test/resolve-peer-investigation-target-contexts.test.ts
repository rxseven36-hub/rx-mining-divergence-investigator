import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXCompany,
} from "../types/company";

import type {
  RXPeerInvestigationCase,
} from "../investigation/peer-investigation-case";

import {
  resolvePeerInvestigationTargetContexts,
} from "../investigation/resolve-peer-investigation-target-contexts";

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

function firstCompany():
  RXCompany {
  return {
    id:
      "COMPANY-A",

    name:
      "Company A",

    symbol:
      "AAA",

    sectorsSlug:
      "company-a-sectors",

    listed:
      true,

    exchange:
      "IDX",
  };
}

function secondCompany():
  RXCompany {
  return {
    id:
      "COMPANY-B",

    name:
      "Company B",

    symbol:
      "BBB",

    sectorsSlug:
      "company-b-sectors",

    listed:
      true,

    exchange:
      "IDX",
  };
}

describe(
  "resolvePeerInvestigationTargetContexts",
  () => {
    it(
      "resolves distinct runtime contexts for both canonical peer companies",
      () => {
        const result =
          resolvePeerInvestigationTargetContexts(
            peerCase(),
            firstCompany(),
            secondCompany()
          );

        expect(
          result.status
        ).toBe(
          "RESOLVED"
        );

        if (
          result.status !==
          "RESOLVED"
        ) {
          throw new Error(
            "Expected resolved peer target contexts"
          );
        }

        expect(
          result.contexts.firstCompany
        ).toEqual({
          companyId:
            "COMPANY-A",

          sectorsSlug:
            "company-a-sectors",

          ticker:
            "AAA",

          commodity:
            "COAL",

          period: {
            kind:
              "YEAR",

            year:
              2024,
          },
        });

        expect(
          result.contexts.secondCompany
        ).toEqual({
          companyId:
            "COMPANY-B",

          sectorsSlug:
            "company-b-sectors",

          ticker:
            "BBB",

          commodity:
            "COAL",

          period: {
            kind:
              "YEAR",

            year:
              2024,
          },
        });
      }
    );

    it(
      "resolves shared context from the canonical peer comparison",
      () => {
        const result =
          resolvePeerInvestigationTargetContexts(
            peerCase(),
            firstCompany(),
            secondCompany()
          );

        expect(
          result.status
        ).toBe(
          "RESOLVED"
        );

        if (
          result.status !==
          "RESOLVED"
        ) {
          throw new Error(
            "Expected resolved peer target contexts"
          );
        }

        expect(
          result.contexts.shared
        ).toEqual({
          commodity:
            "COAL",

          period: {
            kind:
              "YEAR",

            year:
              2024,
          },
        });
      }
    );

    it(
      "rejects a first company that does not match the canonical peer subject",
      () => {
        const wrongFirst = {
          ...firstCompany(),

          id:
            "COMPANY-C",
        };

        const result =
          resolvePeerInvestigationTargetContexts(
            peerCase(),
            wrongFirst,
            secondCompany()
          );

        expect(
          result
        ).toEqual({
          status:
            "REJECTED",

          contexts:
            null,

          issues: [
            "FIRST_COMPANY_ID_MISMATCH",
          ],
        });
      }
    );

    it(
      "rejects a second company that does not match the canonical peer subject",
      () => {
        const wrongSecond = {
          ...secondCompany(),

          id:
            "COMPANY-C",
        };

        const result =
          resolvePeerInvestigationTargetContexts(
            peerCase(),
            firstCompany(),
            wrongSecond
          );

        expect(
          result
        ).toEqual({
          status:
            "REJECTED",

          contexts:
            null,

          issues: [
            "SECOND_COMPANY_ID_MISMATCH",
          ],
        });
      }
    );

    it(
      "rejects swapped canonical company identities instead of silently correcting them",
      () => {
        const result =
          resolvePeerInvestigationTargetContexts(
            peerCase(),
            secondCompany(),
            firstCompany()
          );

        expect(
          result
        ).toEqual({
          status:
            "REJECTED",

          contexts:
            null,

          issues: [
            "FIRST_COMPANY_ID_MISMATCH",
            "SECOND_COMPANY_ID_MISMATCH",
          ],
        });
      }
    );

    it(
      "preserves missing runtime identities instead of deriving them from company id",
      () => {
        const firstWithoutRuntimeIdentity:
          RXCompany = {
            id:
              "COMPANY-A",

            name:
              "Company A",

            listed:
              true,
          };

        const result =
          resolvePeerInvestigationTargetContexts(
            peerCase(),
            firstWithoutRuntimeIdentity,
            secondCompany()
          );

        expect(
          result.status
        ).toBe(
          "RESOLVED"
        );

        if (
          result.status !==
          "RESOLVED"
        ) {
          throw new Error(
            "Expected resolved peer target contexts"
          );
        }

        expect(
          result.contexts.firstCompany
            .companyId
        ).toBe(
          "COMPANY-A"
        );

        expect(
          result.contexts.firstCompany
            .sectorsSlug
        ).toBeUndefined();

        expect(
          result.contexts.firstCompany
            .ticker
        ).toBeUndefined();
      }
    );

        it(
      "rejects resolution when the canonical peer commodity is missing",
      () => {
        const investigationCase = {
          ...peerCase(),

          commodity:
            null,
        };

        const result =
          resolvePeerInvestigationTargetContexts(
            investigationCase,
            firstCompany(),
            secondCompany()
          );

        expect(
          result
        ).toEqual({
          status:
            "REJECTED",

          contexts:
            null,

          issues: [
            "COMMODITY_MISSING",
          ],
        });
      }
    );

    it(
      "does not mutate the peer case or supplied companies",
      () => {
        const investigationCase =
          peerCase();

        const first =
          firstCompany();

        const second =
          secondCompany();

        const caseSnapshot =
          structuredClone(
            investigationCase
          );

        const firstSnapshot =
          structuredClone(
            first
          );

        const secondSnapshot =
          structuredClone(
            second
          );

        resolvePeerInvestigationTargetContexts(
          investigationCase,
          first,
          second
        );

        expect(
          investigationCase
        ).toEqual(
          caseSnapshot
        );

        expect(
          first
        ).toEqual(
          firstSnapshot
        );

        expect(
          second
        ).toEqual(
          secondSnapshot
        );
      }
    );
  }
);