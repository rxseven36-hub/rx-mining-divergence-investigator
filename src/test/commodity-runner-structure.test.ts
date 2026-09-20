import {
  describe,
  expect,
  it,
} from "vitest";

import fs from "node:fs";
import path from "node:path";

function read(
  relativePath: string,
): string {
  return fs.readFileSync(
    path.join(
      process.cwd(),
      relativePath,
    ),
    "utf8",
  );
}

describe(
  "Commodity live runner structural wiring",
  () => {
    it(
      "uses one-credit Sectors execution followed by admission and deterministic analysis",
      () => {
        const source =
          read(
            "src/investigation/run-live-commodity-investigation.ts",
          );

        expect(source).toContain(
          '"GET_COMMODITY_PRICE_HISTORY"',
        );

        expect(source).toContain(
          "new SectorsCreditBudget(",
        );

        expect(source).toMatch(
          /new\s+SectorsCreditBudget\(\s*1\s*,?\s*\)/,
        );

        expect(source).toContain(
          "executeSectorsOperation",
        );

        expect(source).toContain(
          "admitCommodityPriceEvidence",
        );

        expect(source).toContain(
          "analyzeCommodityPrice",
        );

        expect(source).toContain(
          'causalConclusion:',
        );

        expect(source).toContain(
          '"UNKNOWN"',
        );
      },
    );

    it(
      "supports only the four verified commodity identifiers",
      () => {
        const source =
          read(
            "src/investigation/run-live-commodity-investigation.ts",
          );

        for (
          const commodity of [
            "COAL",
            "GOLD",
            "NICKEL",
            "COPPER",
          ]
        ) {
          expect(
            source,
          ).toContain(
            `"${commodity}"`,
          );
        }

        expect(source).not.toContain(
          '"SILVER"',
        );

        expect(source).not.toContain(
          '"TIN"',
        );
      },
    );

    it(
      "does not delegate trust or causality to an LLM",
      () => {
        const source =
          read(
            "src/investigation/run-live-commodity-investigation.ts",
          ).toLowerCase();

        expect(source).not.toContain(
          "openai",
        );

        expect(source).not.toContain(
          "anthropic",
        );

        expect(source).not.toContain(
          "gemini",
        );

        expect(source).not.toContain(
          "generatecontent",
        );

        expect(source).not.toContain(
          "chat.completions",
        );
      },
    );
  },
);

describe(
  "Commodity investigation API structural wiring",
  () => {
    it(
      "uses the dedicated Commodity runner",
      () => {
        const source =
          read(
            "src/app/api/investigate/commodity/route.ts",
          );

        expect(source).toContain(
          "runLiveCommodityInvestigation",
        );

        expect(source).toContain(
          '"commodity-context"',
        );

        expect(source).toContain(
          "commodityPrice:",
        );

        expect(source).toContain(
          '"UNKNOWN"',
        );
      },
    );

    it(
      "does not fall back to company investigation paths",
      () => {
        const source =
          read(
            "src/app/api/investigate/commodity/route.ts",
          );

        expect(source).not.toContain(
          "production-sales",
        );

        expect(source).not.toContain(
          "site-license",
        );

        expect(source).not.toContain(
          "ob-strip",
        );

        expect(source).not.toContain(
          "resources-reserves",
        );

        expect(source).not.toContain(
          'path: "market"',
        );
      },
    );
  },
);