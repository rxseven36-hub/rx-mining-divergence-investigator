import {
  describe,
  expect,
  it,
} from "vitest";

import {
  RX_CAPABILITY_REGISTRY,
  getCapabilityDefinition,
  isCapabilityEnabled,
} from "../investigation/capability-registry";

describe(
  "RX capability registry",
  () => {
    it(
      "contains the registered RX investigation capabilities",
      () => {
        expect(
          RX_CAPABILITY_REGISTRY.map(
            (item) =>
              item.capability
          )
        ).toEqual([
          "MINING_OPERATIONAL_CONTEXT",
          "MINING_HISTORICAL_PERFORMANCE",
          "COMMODITY_PRICE_HISTORY",
          "COMPANY_MARKET_TRANSACTION_HISTORY",
          "COMPANY_FINANCIAL_REPORT",
        ]);
      }
    );

    it(
      "keeps the original four capabilities on the REST adapter boundary",
      () => {
        const original =
          RX_CAPABILITY_REGISTRY.filter(
            (item) =>
              item.capability !==
              "COMPANY_FINANCIAL_REPORT"
          );

        expect(
          original
        ).toHaveLength(4);

        expect(
          original.every(
            (item) =>
              item.source ===
                "SECTORS" &&
              item.executionBoundary ===
                "SECTORS_ADAPTER"
          )
        ).toBe(true);
      }
    );

    it(
      "routes financial evidence through the Sectors MCP adapter boundary",
      () => {
        const financial =
          getCapabilityDefinition(
            "COMPANY_FINANCIAL_REPORT"
          );

        expect(
          financial?.source
        ).toBe(
          "SECTORS"
        );

        expect(
          financial?.requirementKind
        ).toBe(
          "FINANCIAL_REPORT"
        );

        expect(
          financial?.executionBoundary
        ).toBe(
          "SECTORS_MCP_ADAPTER"
        );
      }
    );

    it(
      "resolves an official REST capability definition",
      () => {
        const definition =
          getCapabilityDefinition(
            "MINING_HISTORICAL_PERFORMANCE"
          );

        expect(
          definition?.requirementKind
        ).toBe(
          "HISTORICAL_PERFORMANCE"
        );
      }
    );

    it(
      "reports REST and MCP capabilities as enabled",
      () => {
        expect(
          isCapabilityEnabled(
            "COMMODITY_PRICE_HISTORY"
          )
        ).toBe(true);

        expect(
          isCapabilityEnabled(
            "COMPANY_FINANCIAL_REPORT"
          )
        ).toBe(true);
      }
    );
  }
);