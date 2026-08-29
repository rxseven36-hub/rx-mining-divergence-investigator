import { describe, expect, it } from "vitest";

import { normalizeUnit } from "../data/normalization/normalize-unit";

describe("normalizeUnit", () => {
  it("recognizes known mining units", () => {
    expect(normalizeUnit("wmt")).toMatchObject({
      symbol: "wmt",
      dimension: "MASS",
    });

    expect(normalizeUnit("TNi")).toMatchObject({
      symbol: "TNi",
      dimension: "CONTAINED_METAL",
    });
  });

  it("does not invent semantics for unknown units", () => {
    expect(normalizeUnit("mystery-unit")).toEqual({
      symbol: "mystery-unit",
      dimension: "UNKNOWN",
      raw: "mystery-unit",
    });
  });

  it("marks missing units as unknown", () => {
    expect(normalizeUnit(null)).toEqual({
      symbol: "UNKNOWN",
      dimension: "UNKNOWN",
    });
  });
});