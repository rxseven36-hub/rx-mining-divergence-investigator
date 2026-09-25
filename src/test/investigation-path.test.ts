import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getInvestigationPathDefinition,
  isInvestigationPath,
  RX_INVESTIGATION_PATHS,
} from "../investigation/investigation-path";

describe(
  "context-aware investigation paths",
  () => {
    it(
      "registers the eight executable context-aware investigation paths",
      () => {
        expect(
          RX_INVESTIGATION_PATHS,
        ).toEqual([
          "production-sales",
          "site-license",
          "ob-strip",
          "resources-reserves",
          "market",
          "commodity-context",
          "product-quality",
          "sales-destination",
        ]);
      },
    );

    it(
      "accepts only executable paths",
      () => {
        for (
          const supported of [
            "production-sales",
            "site-license",
            "ob-strip",
            "resources-reserves",
            "market",
            "commodity-context",
            "product-quality",
            "sales-destination",
          ]
        ) {
          expect(
            isInvestigationPath(
              supported,
            ),
          ).toBe(true);
        }

        for (
          const unsupported of [
            "financial",
            "news-event",
            "ngawur",
            "",
          ]
        ) {
          expect(
            isInvestigationPath(
              unsupported,
            ),
          ).toBe(false);
        }
      },
    );

    it(
      "maps each path to its primary evidence capability",
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

        expect(
          getInvestigationPathDefinition(
            "ob-strip",
          ).primaryCapability,
        ).toBe(
          "MINING_HISTORICAL_PERFORMANCE",
        );

        expect(
          getInvestigationPathDefinition(
            "resources-reserves",
          ).primaryCapability,
        ).toBe(
          "MINING_HISTORICAL_PERFORMANCE",
        );

        expect(
          getInvestigationPathDefinition(
            "market",
          ).primaryCapability,
        ).toBe(
          "COMPANY_MARKET_TRANSACTION_HISTORY",
        );

        expect(
          getInvestigationPathDefinition(
            "commodity-context",
          ).primaryCapability,
        ).toBe(
          "COMMODITY_PRICE_HISTORY",
        );

        expect(
          getInvestigationPathDefinition(
            "product-quality",
          ).primaryCapability,
        ).toBe(
          "MINING_HISTORICAL_PERFORMANCE",
        );

        expect(
          getInvestigationPathDefinition(
            "sales-destination",
          ).primaryCapability,
        ).toBe(
          "MINING_SALES_DESTINATION",
        );
      },
    );
  },
);