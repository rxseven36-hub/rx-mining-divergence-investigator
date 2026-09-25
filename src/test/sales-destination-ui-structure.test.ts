import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

const pageSource = read("src/app/investigations/page.tsx");
const pathSource = read("src/investigation/investigation-path.ts");
const uiSource = read(
  "src/app/investigations/SalesDestinationInvestigator.tsx",
);

describe("Sales Destination investigation UI structural wiring", () => {
  it("registers Sales Destination as an executable investigation path", () => {
    expect(pathSource).toContain('"sales-destination"');
    expect(pathSource).toContain('"MINING_SALES_DESTINATION"');
    expect(pathSource).toContain('label:\n      "Sales Destination"');
  });

  it("routes the path to the dedicated Sales Destination investigator", () => {
    expect(pageSource).toContain(
      'import SalesDestinationInvestigator from "./SalesDestinationInvestigator";',
    );
    expect(pageSource).toContain(
      'resolvedPath ===\n      "sales-destination"',
    );
    expect(pageSource).toContain("<SalesDestinationInvestigator");
  });

  it("promotes Sales Destination from future to ready", () => {
    const futureStart = pageSource.indexOf("const FUTURE_PATHS");
    const futureEnd = pageSource.indexOf("];", futureStart);
    const futureBlock = pageSource.slice(futureStart, futureEnd);

    expect(pageSource).toContain('path: "sales-destination"');
    expect(pageSource).toContain('label: "Sales Destination"');
    expect(futureBlock).not.toContain('path: "sales-destination"');
  });

  it("keeps all five competition companies selectable", () => {
    for (const symbol of ["BUMI", "ADMR", "BYAN", "ITMG", "GEMS"]) {
      expect(uiSource).toContain(`${symbol}: {`);
    }

    expect(uiSource).not.toContain("supported: false");
  });

  it("uses only the dedicated Sales Destination API and FY2024 control", () => {
    expect(uiSource).toContain(
      '"/api/investigate/sales-destination"',
    );
    expect(uiSource).toContain("const YEARS = [2024] as const;");
    expect(uiSource).not.toContain("/api/investigate/product-quality");
    expect(uiSource).not.toContain("/api/investigate/financial");
  });

  it("preserves provider labels and missing values without deriving replacements", () => {
    expect(uiSource).toContain("observation.destinationLabel");
    expect(uiSource).toContain('"NOT REPORTED"');
    expect(uiSource).toContain("Provider geography preserved verbatim");
    expect(uiSource).not.toContain("percentageOfSalesVolume =");
    expect(uiSource).not.toContain("percentageOfTotalRevenue =");
  });

  it("keeps RX doctrine explicit and human evidence ahead of raw evidence", () => {
    expect(uiSource).toContain("NO CONCENTRATION SCORE");
    expect(uiSource).toContain("NO GEOGRAPHY RECLASSIFICATION");
    expect(uiSource).toContain("CAUSALITY UNKNOWN");
    expect(uiSource).toContain('aria-live="polite"');

    const humanEvidence = uiSource.indexOf(
      "Human-readable source facts",
    );
    const rawEvidence = uiSource.indexOf("VIEW RAW EVIDENCE");

    expect(humanEvidence).toBeGreaterThan(-1);
    expect(rawEvidence).toBeGreaterThan(humanEvidence);
  });
});
