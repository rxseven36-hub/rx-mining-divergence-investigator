import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveSectorsOperation,
} from "../data/sectors/sectors-operation";

describe(
  "resolveSectorsOperation",
  () => {
    it("maps every registered investigation capability to a typed Sectors operation", () => {
      expect(
        resolveSectorsOperation(
          "MINING_OPERATIONAL_CONTEXT"
        )
      ).toBe(
        "GET_MINING_OPERATIONAL_CONTEXT"
      );

      expect(
        resolveSectorsOperation(
          "MINING_HISTORICAL_PERFORMANCE"
        )
      ).toBe(
        "GET_MINING_HISTORICAL_PERFORMANCE"
      );

      expect(
        resolveSectorsOperation(
          "COMMODITY_PRICE_HISTORY"
        )
      ).toBe(
        "GET_COMMODITY_PRICE_HISTORY"
      );

      expect(
        resolveSectorsOperation(
          "COMPANY_MARKET_TRANSACTION_HISTORY"
        )
      ).toBe(
        "GET_COMPANY_MARKET_TRANSACTION_HISTORY"
      );
    });
  }
);