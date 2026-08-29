import { describe, expect, it } from "vitest";

import {
  sectorsMiningPerformanceRowSchema,
} from "../data/schemas/sectors-mining-performance";

describe("Sectors mining performance raw contract", () => {
  it("accepts a coal performance row", () => {
    const parsed = sectorsMiningPerformanceRowSchema.parse({
      year: 2024,
      commodity: "Coal",
      product_type: "Metallurgical Coal",
      unit: "Mt",
      production: 6.63,
      sales: 5.62,
      overburden: 23.55,
      strip_ratio: 3.55,
      reserves: 177.2,
      resources: 982.9,
    });

    expect(parsed.production).toBe(6.63);
    expect(parsed.sales).toBe(5.62);
  });

  it("preserves null instead of converting it to zero", () => {
    const parsed = sectorsMiningPerformanceRowSchema.parse({
      year: 2024,
      commodity: "Copper",
      unit: "kton",
      production: 179.1,
      sales: null,
    });

    expect(parsed.sales).toBeNull();
  });

  it("preserves unknown source fields for auditability", () => {
    const parsed = sectorsMiningPerformanceRowSchema.parse({
      year: 2024,
      commodity: "Copper",
      unit: "kton",
      production: 179.1,
      strange_future_field: "KEEP-ME",
    });

    expect(parsed.strange_future_field).toBe("KEEP-ME");
  });
});