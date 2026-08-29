import { describe, expect, it } from "vitest";

import { evaluateComparability } from "../intelligence/comparability/evaluate-comparability";

describe("evaluateComparability", () => {
  it("allows a detector only when all comparability guards pass", () => {
    const result = evaluateComparability({
      dataExists: true,
      semanticsKnown: true,
      unitsComparable: true,
      timeAligned: true,
      relationshipValid: true,
    });

    expect(result.eligible).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it("skips detection when evidence is not comparable", () => {
    const result = evaluateComparability({
      dataExists: true,
      semanticsKnown: true,
      unitsComparable: false,
      timeAligned: true,
      relationshipValid: true,
    });

    expect(result.eligible).toBe(false);
    expect(result.reasons).toContain("UNIT_NOT_COMPARABLE");
  });
});
