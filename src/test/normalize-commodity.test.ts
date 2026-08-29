import { describe, expect, it } from "vitest";

import { normalizeCommodity } from "../data/normalization/normalize-commodity";

describe("normalizeCommodity", () => {
  it("normalizes locked MVP commodities", () => {
    expect(normalizeCommodity("Coal")).toBe("COAL");
    expect(normalizeCommodity("Gold")).toBe("GOLD");
    expect(normalizeCommodity("Nickel")).toBe("NICKEL");
    expect(normalizeCommodity("Copper")).toBe("COPPER");
  });

  it("does not silently admit Aluminium into MVP scope", () => {
    expect(normalizeCommodity("Aluminium")).toBeNull();
  });

  it("returns null when commodity is missing", () => {
    expect(normalizeCommodity(null)).toBeNull();
  });
});