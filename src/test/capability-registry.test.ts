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
    it("contains exactly the four Sprint 007 capabilities", () => {
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
      ]);
    });

    it("routes every capability through the Sectors adapter boundary", () => {
      expect(
        RX_CAPABILITY_REGISTRY.every(
          (item) =>
            item.source ===
              "SECTORS" &&
            item.executionBoundary ===
              "SECTORS_ADAPTER"
        )
      ).toBe(true);
    });

    it("resolves an official capability definition", () => {
      const definition =
        getCapabilityDefinition(
          "MINING_HISTORICAL_PERFORMANCE"
        );

      expect(
        definition?.requirementKind
      ).toBe(
        "HISTORICAL_PERFORMANCE"
      );
    });

    it("reports official capabilities as enabled", () => {
      expect(
        isCapabilityEnabled(
          "COMMODITY_PRICE_HISTORY"
        )
      ).toBe(true);
    });
  }
);