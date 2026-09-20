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
  relativePath: string,
): string {
  return fs.readFileSync(
    path.join(root, relativePath),
    "utf8",
  );
}

describe(
  "standalone Market investigation structural wiring",
  () => {
    it(
      "uses only the verified company market capability with a one-credit runtime budget",
      () => {
        const source =
          read(
            "src/investigation/run-live-market-investigation.ts",
          );

        expect(source).toContain(
          '"GET_COMPANY_MARKET_TRANSACTION_HISTORY"',
        );

        expect(source).toContain(
          "new SectorsCreditBudget(1)",
        );

        expect(source).toContain(
          "admitMarketTransactionEvidence",
        );

        expect(source).toContain(
          "analyzeMarketTransactions",
        );

        expect(source).not.toMatch(
          /Gemini|OpenAI|Anthropic|LLM/i,
        );
      },
    );

    it(
      "preserves causal unknown and enforces the 90-day range guard",
      () => {
        const source =
          read(
            "src/investigation/run-live-market-investigation.ts",
          );

        expect(source).toContain(
          'causalConclusion: "UNKNOWN"',
        );

        expect(source).toContain(
          "daySpan > 90",
        );

        expect(source).toContain(
          '"market investigation range must not exceed 90 days"',
        );
      },
    );

    it(
      "exposes a dedicated market API without production-sales fallback",
      () => {
        const source =
          read(
            "src/app/api/investigate/market/route.ts",
          );

        expect(source).toContain(
          "runLiveMarketInvestigation",
        );

        expect(source).toContain(
          'path: "market"',
        );

        expect(source).not.toContain(
          "production-sales",
        );

        expect(source).not.toContain(
          "runLiveProductionSalesIntelligence",
        );
      },
    );
  },
);