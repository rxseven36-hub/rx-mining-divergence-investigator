import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getInvestigationPathDefinition,
  isInvestigationPath,
} from "../investigation/investigation-path";

describe(
  "Investigator V2.1 context routing",
  () => {
    it(
      "keeps production-sales and site-license distinct",
      () => {
        expect(
          getInvestigationPathDefinition(
            "production-sales",
          ).primaryCapability,
        ).toBe(
          "MINING_HISTORICAL_PERFORMANCE",
        );

        expect(
          getInvestigationPathDefinition(
            "site-license",
          ).primaryCapability,
        ).toBe(
          "MINING_OPERATIONAL_CONTEXT",
        );
      },
    );

    it(
      "rejects an explicitly unsupported path",
      () => {
        expect(
          isInvestigationPath(
            "reserves-resources",
          ),
        ).toBe(false);

        expect(
          isInvestigationPath(
            "whatever",
          ),
        ).toBe(false);
      },
    );
  },
);