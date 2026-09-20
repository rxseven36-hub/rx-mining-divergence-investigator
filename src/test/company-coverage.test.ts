import { describe, expect, it } from "vitest";
import {
  companyCoverageRegistry,
  countCoverage,
  coverageScore,
  getCompanyCoverage,
} from "../lib/rxmdi-company-coverage";

describe("RX MDI company coverage registry", () => {
  it("keeps BUMI as the richest collected company coverage", () => {
    const bumi = companyCoverageRegistry.BUMI;
    const counts = countCoverage(bumi);

    expect(counts.verified).toBeGreaterThanOrEqual(7);
    expect(coverageScore(bumi)).toBeGreaterThan(0.85);
  });

  it("keeps AADI live investigation coverage explicit", () => {
    expect(companyCoverageRegistry.AADI.source.performance).toBe("verified");
    expect(companyCoverageRegistry.AADI.source.investigation).toBe("verified");
  });

  it("does not falsely claim ANTM competition-grade Sectors coverage", () => {
    const antm = companyCoverageRegistry.ANTM;
    expect(antm.source.financials).toBe("none");
    expect(antm.source.performance).toBe("none");
    expect(antm.source.investigation).toBe("none");
  });

  it("normalizes ticker lookup", () => {
    expect(getCompanyCoverage("bumi")?.ticker).toBe("BUMI");
    expect(getCompanyCoverage("NOTREAL")).toBeNull();
  });
});
