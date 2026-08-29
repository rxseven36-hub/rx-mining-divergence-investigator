import { describe, expect, it } from "vitest";

import { classifyDataState } from "../data/normalization/data-state";

describe("classifyDataState", () => {
  it("never treats null as an available numeric value", () => {
    const state = classifyDataState({
      fieldPresent: true,
      value: null,
      semanticsKnown: true,
      unitKnown: true,
      periodKnown: true,
    });

    expect(state).toBe("NULL_VALUE");
  });

  it("distinguishes missing fields from null values", () => {
    const state = classifyDataState({
      fieldPresent: false,
      value: undefined,
      semanticsKnown: true,
      unitKnown: true,
      periodKnown: true,
    });

    expect(state).toBe("MISSING");
  });

  it("blocks values whose semantics are unknown", () => {
    const state = classifyDataState({
      fieldPresent: true,
      value: 100,
      semanticsKnown: false,
      unitKnown: true,
      periodKnown: true,
    });

    expect(state).toBe("SEMANTICS_UNKNOWN");
  });
});