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
  "Market Investigator UI",
  () => {
    it(
      "uses the dedicated Market API and never auto-runs it",
      () => {
        const source =
          read(
            "src/app/investigations/MarketInvestigator.tsx",
          );

        expect(source).toContain(
          '"/api/investigate/market"',
        );

        expect(source).toContain(
          "onClick={",
        );

        expect(source).toContain(
          "runInvestigation",
        );

        expect(source).not.toContain(
          "useEffect(",
        );

        expect(source).not.toContain(
          "production-sales",
        );
      },
    );

    it(
      "exposes five direct company choices and controlled 30 or 90 day periods",
      () => {
        const source =
          read(
            "src/app/investigations/MarketInvestigator.tsx",
          );

        for (
          const symbol of [
            "BUMI",
            "BYAN",
            "GEMS",
            "ITMG",
            "ADMR",
          ]
        ) {
          expect(
            source,
          ).toContain(
            `symbol: "${symbol}"`,
          );
        }

        expect(source).toContain(
          "type RangePreset",
        );

        expect(source).toContain(
          "| 30",
        );

        expect(source).toContain(
          "| 90",
        );

        expect(source).toContain(
          'type="date"',
        );
      },
    );

    it(
      "renders only admitted market metrics with causal unknown guardrails",
      () => {
        const source =
          read(
            "src/app/investigations/MarketInvestigator.tsx",
          );

        expect(source).toContain(
          'label="CLOSING PRICE"',
        );

        expect(source).toContain(
          'label="TRADING VOLUME"',
        );

        expect(source).toContain(
          'label="MARKET CAP"',
        );

        expect(source).toContain(
          "CAUSALITY UNKNOWN",
        );

        expect(source).toContain(
          "SHOW EVIDENCE",
        );

        expect(source).toMatch(
          /does\s+not\s+infer\s+bullish\s+or/i,
        );

        expect(source).toMatch(
          /bearish\s+state/i,
        );

        expect(source).not.toMatch(
          /\bcaused by\b|\bbecause of\b|\bcausal conclusion:\s*(?!unknown)/i,
        );
      },
    );
  },
);