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
  "Product Quality live runner structural wiring",
  () => {
    it(
      "uses only historical performance with a one-credit runtime budget",
      () => {
        const source =
          read(
            "src/investigation/run-live-product-quality-investigation.ts",
          );

        expect(source).toContain(
          '"GET_MINING_HISTORICAL_PERFORMANCE"',
        );

        expect(source).toMatch(
          /new\s+SectorsCreditBudget\(\s*1\s*,?\s*\)/,
        );

        expect(source).toContain(
          "executeSectorsOperation",
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
      "executes dedicated admission before deterministic Product Quality analysis",
      () => {
        const source =
          read(
            "src/investigation/run-live-product-quality-investigation.ts",
          );

        expect(source).toContain(
          "admitMiningProductQualityEvidence",
        );

        expect(source).toContain(
          "analyzeMiningProductQuality",
        );

        const admissionIndex =
          source.indexOf(
            "admitMiningProductQualityEvidence({",
          );

        const analysisIndex =
          source.indexOf(
            "analyzeMiningProductQuality(",
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
            "src/investigation/run-live-product-quality-investigation.ts",
          );

        expect(source).toContain(
          'causalConclusion:',
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
      "keeps the Product Quality API on its dedicated path",
      () => {
        const source =
          read(
            "src/app/api/investigate/product-quality/route.ts",
          );

        expect(source).toContain(
          "runLiveProductQualityInvestigation",
        );

        expect(source).toContain(
          'path:',
        );

        expect(source).toContain(
          '"product-quality"',
        );

        expect(source).toContain(
          "productQuality:",
        );

        expect(source).toContain(
          "requestedPerformanceYear:",
        );
      },
    );

    it(
      "does not fall back to unrelated investigation paths",
      () => {
        const source =
          read(
            "src/app/api/investigate/product-quality/route.ts",
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
      },
    );

    it(
      "keeps Sectors credentials server-side",
      () => {
        const source =
          read(
            "src/app/api/investigate/product-quality/route.ts",
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
  },
);