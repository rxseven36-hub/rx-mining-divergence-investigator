import {
  describe,
  expect,
  it,
} from "vitest";

import fs from "node:fs";
import path from "node:path";

const root =
  process.cwd();

function read(
  relativePath:
    string,
): string {
  return fs.readFileSync(
    path.join(
      root,
      relativePath,
    ),
    "utf8",
  );
}

describe(
  "Sales Destination live runner structural wiring",
  () => {
    it(
      "uses only the dedicated sales-destination operation with a one-credit runtime budget",
      () => {
        const source =
          read(
            "src/investigation/run-live-sales-destination-investigation.ts",
          );

        expect(source).toContain(
          '"GET_MINING_SALES_DESTINATION"',
        );

        expect(source).toMatch(
          /new\s+SectorsCreditBudget\(\s*1\s*,?\s*\)/,
        );

        expect(source).toContain(
          "executeSectorsOperation",
        );

        expect(source).not.toContain(
          '"GET_MINING_HISTORICAL_PERFORMANCE"',
        );

        expect(source).not.toContain(
          '"GET_MINING_OPERATIONAL_CONTEXT"',
        );

        expect(source).not.toContain(
          '"GET_COMMODITY_PRICE_HISTORY"',
        );

        expect(source).not.toContain(
          '"GET_COMPANY_MARKET_TRANSACTION_HISTORY"',
        );
      },
    );

    it(
      "executes dedicated admission before deterministic Sales Destination analysis",
      () => {
        const source =
          read(
            "src/investigation/run-live-sales-destination-investigation.ts",
          );

        expect(source).toContain(
          "admitMiningSalesDestinationEvidence",
        );

        expect(source).toContain(
          "analyzeMiningSalesDestination",
        );

        const admissionIndex =
          source.indexOf(
            "admitMiningSalesDestinationEvidence({",
          );

        const analysisIndex =
          source.indexOf(
            "analyzeMiningSalesDestination(",
          );

        expect(
          admissionIndex,
        ).toBeGreaterThan(-1);

        expect(
          analysisIndex,
        ).toBeGreaterThan(
          admissionIndex,
        );
      },
    );

    it(
      "preserves one-credit and causal guardrails without LLM trust delegation",
      () => {
        const source =
          read(
            "src/investigation/run-live-sales-destination-investigation.ts",
          );

        expect(source).toContain(
          "causalConclusion:",
        );

        expect(source).toContain(
          '"UNKNOWN"',
        );

        expect(source).not.toMatch(
          /Gemini|OpenAI|Anthropic|LLM|chat\.completions|generateContent/i,
        );
      },
    );

    it(
      "keeps the Sales Destination API on its dedicated path",
      () => {
        const source =
          read(
            "src/app/api/investigate/sales-destination/route.ts",
          );

        expect(source).toContain(
          "runLiveSalesDestinationInvestigation",
        );

        expect(source).toContain(
          'path:',
        );

        expect(source).toContain(
          '"sales-destination"',
        );

        expect(source).toContain(
          "salesDestination:",
        );

        expect(source).toContain(
          "requestedYear:",
        );
      },
    );

    it(
      "does not fall back to unrelated investigation paths",
      () => {
        const source =
          read(
            "src/app/api/investigate/sales-destination/route.ts",
          );

        expect(source).not.toContain(
          "runLiveProductionSalesIntelligence",
        );

        expect(source).not.toContain(
          "runLiveResourcesReservesInvestigation",
        );

        expect(source).not.toContain(
          "runLiveMarketInvestigation",
        );

        expect(source).not.toContain(
          "runLiveCommodityInvestigation",
        );

        expect(source).not.toContain(
          "runLiveProductQualityInvestigation",
        );
      },
    );

    it(
      "keeps Sectors credentials server-side",
      () => {
        const source =
          read(
            "src/app/api/investigate/sales-destination/route.ts",
          );

        expect(source).toContain(
          "process.env.SECTORS_API_KEY",
        );

        expect(source).not.toContain(
          "body.sectorsApiKey",
        );

        expect(source).not.toContain(
          "SECTORS_API_KEY:",
        );
      },
    );

    it(
      "keeps provider-defined destination evidence explicit",
      () => {
        const source =
          read(
            "src/app/api/investigate/sales-destination/route.ts",
          );

        expect(source).toContain(
          "destinations:",
        );

        expect(source).toContain(
          "observationsWithRevenue:",
        );

        expect(source).toContain(
          "observationsWithRevenueShare:",
        );

        expect(source).toContain(
          "observationsWithVolume:",
        );

        expect(source).toContain(
          "observationsWithVolumeShare:",
        );

        expect(source).not.toContain(
          "concentrationScore:",
        );

        expect(source).not.toContain(
          "ranking:",
        );

        expect(source).not.toContain(
          "domesticExport:",
        );
      },
    );
  },
);