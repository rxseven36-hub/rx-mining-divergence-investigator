import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createCompanyDivergenceInvestigationSubject,
  createPeerDivergenceInvestigationSubject,
} from "../investigation/investigation-subject";

describe(
  "investigation subject",
  () => {
    it(
      "creates a company divergence subject without interpretation",
      () => {
        const subject =
          createCompanyDivergenceInvestigationSubject(
            "COMPANY-A"
          );

        expect(
          subject
        ).toEqual({
          kind:
            "COMPANY_DIVERGENCE",

          companyId:
            "COMPANY-A",
        });
      }
    );

    it(
      "creates a canonical peer divergence subject",
      () => {
        const subject =
          createPeerDivergenceInvestigationSubject(
            "COMPANY-A",
            "COMPANY-B"
          );

        expect(
          subject
        ).toEqual({
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
        });
      }
    );

    it(
      "produces the same peer subject regardless of input orientation",
      () => {
        const direct =
          createPeerDivergenceInvestigationSubject(
            "COMPANY-A",
            "COMPANY-B"
          );

        const reverse =
          createPeerDivergenceInvestigationSubject(
            "COMPANY-B",
            "COMPANY-A"
          );

        expect(
          reverse
        ).toEqual(
          direct
        );
      }
    );

    it(
      "preserves canonical peer identity from the existing peer boundary",
      () => {
        const subject =
          createPeerDivergenceInvestigationSubject(
            "Z-COMPANY",
            "A-COMPANY"
          );

        expect(
          subject.firstCompanyId
        ).toBe(
          "A-COMPANY"
        );

        expect(
          subject.secondCompanyId
        ).toBe(
          "Z-COMPANY"
        );

        expect(
          subject.pairKey
        ).toBe(
          JSON.stringify([
            "A-COMPANY",
            "Z-COMPANY",
          ])
        );
      }
    );

    it(
      "does not add priority evidence or causal semantics to a peer subject",
      () => {
        const subject =
          createPeerDivergenceInvestigationSubject(
            "COMPANY-A",
            "COMPANY-B"
          );

        expect(
          Object.keys(
            subject
          ).sort()
        ).toEqual(
          [
            "firstCompanyId",
            "kind",
            "pairKey",
            "secondCompanyId",
          ].sort()
        );
      }
    );
  }
);