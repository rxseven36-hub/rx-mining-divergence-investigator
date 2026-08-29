import {
  describe,
  expect,
  it,
} from "vitest";

import {
  SectorsCreditBudget,
} from "../data/sectors/credit-budget";

describe("SectorsCreditBudget", () => {
  it("reserves estimated credits within budget", () => {
    const budget =
      new SectorsCreditBudget(3);

    expect(budget.reserve(2)).toBe(true);

    expect(budget.snapshot()).toEqual({
      maxEstimatedCredits: 3,
      reservedEstimatedCredits: 2,
      remainingEstimatedCredits: 1,
    });
  });

  it("blocks requests that exceed local budget", () => {
    const budget =
      new SectorsCreditBudget(2);

    expect(budget.reserve(2)).toBe(true);
    expect(budget.reserve(1)).toBe(false);

    expect(
      budget.snapshot()
        .reservedEstimatedCredits
    ).toBe(2);
  });

  it("rejects invalid credit costs", () => {
    const budget =
      new SectorsCreditBudget(10);

    expect(budget.reserve(0)).toBe(false);
    expect(budget.reserve(-1)).toBe(false);
    expect(budget.reserve(1.5)).toBe(false);
  });
});