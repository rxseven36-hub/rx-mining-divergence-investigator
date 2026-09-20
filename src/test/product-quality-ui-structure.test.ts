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
  "Product Quality UI structural wiring",
  () => {
    it(
      "registers Product Quality as an executable investigation path",
      () => {
        const source =
          read(
            "src/investigation/investigation-path.ts",
          );

        expect(source).toContain(
          '"product-quality"',
        );

        expect(source).toContain(
          'label:\n      "Product Quality"',
        );

        expect(source).toContain(
          'primaryCapability:\n      "MINING_HISTORICAL_PERFORMANCE"',
        );
      },
    );

    it(
      "routes Product Quality to its dedicated investigator",
      () => {
        const source =
          read(
            "src/app/investigations/page.tsx",
          );

        expect(source).toContain(
          'import ProductQualityInvestigator from "./ProductQualityInvestigator";',
        );

        expect(source).toContain(
          'resolvedPath ===\n      "product-quality"',
        );

        expect(source).toContain(
          "<ProductQualityInvestigator",
        );
      },
    );

    it(
      "moves Product Quality into READY paths",
      () => {
        const source =
          read(
            "src/app/investigations/page.tsx",
          );

        const readyStart =
          source.indexOf(
            "const READY_PATHS",
          );

        const futureStart =
          source.indexOf(
            "const FUTURE_PATHS",
          );

        const readySource =
          source.slice(
            readyStart,
            futureStart,
          );

        const futureSource =
          source.slice(
            futureStart,
          );

        expect(
          readySource,
        ).toContain(
          'path: "product-quality"',
        );

        expect(
          futureSource,
        ).not.toContain(
          'path: "product-quality"',
        );
      },
    );

    it(
      "uses direct buttons for the five controlled companies",
      () => {
        const source =
          read(
            "src/app/investigations/ProductQualityInvestigator.tsx",
          );

        for (
          const symbol of [
            "BUMI",
            "ADMR",
            "BYAN",
            "ITMG",
            "GEMS",
          ]
        ) {
          expect(
            source,
          ).toContain(
            `${symbol}: {`,
          );
        }

        expect(source).toContain(
          "rx-geology-options",
        );
      },
    );

    it(
      "uses the dedicated Product Quality API and year selector",
      () => {
        const source =
          read(
            "src/app/investigations/ProductQualityInvestigator.tsx",
          );

        expect(source).toContain(
          '"/api/investigate/product-quality"',
        );

        expect(source).toContain(
          "const YEARS =",
        );

        expect(source).toContain(
          "[2024, 2023]",
        );
      },
    );

    it(
      "renders source ranges without midpoint or quality-score calculation",
      () => {
        const source =
          read(
            "src/app/investigations/ProductQualityInvestigator.tsx",
          );

        expect(source).toContain(
          "formatRange",
        );

        expect(source).toContain(
          "const {",
        );

        expect(source).toContain(
          "min,",
        );

        expect(source).toContain(
          "max,",
        );

        expect(source).toContain(
          "} = observation;",
        );

        expect(source).not.toMatch(
          /\(\s*min\s*\+\s*max\s*\)\s*\/\s*2/,
        );

        expect(source).not.toContain(
          "qualityScore",
        );
      },
    );

    it(
      "keeps ARB and ADB visible as distinct source bases",
      () => {
        const source =
          read(
            "src/app/investigations/ProductQualityInvestigator.tsx",
          );

        expect(source).toContain(
          '"ASH / ARB"',
        );

        expect(source).toContain(
          '"TOTAL SULPHUR / ARB"',
        );

        expect(source).toContain(
          '"ASH / ADB"',
        );

        expect(source).toContain(
          '"TOTAL SULPHUR / ADB"',
        );
      },
    );

    it(
      "preserves the causality-unknown guardrail",
      () => {
        const source =
          read(
            "src/app/investigations/ProductQualityInvestigator.tsx",
          );

        expect(source).toContain(
          "CAUSALITY UNKNOWN",
        );

        expect(source).toContain(
          "NO QUALITY SCORE",
        );

        expect(source).toContain(
          "NO MIDPOINT DERIVATION",
        );
      },
    );
  },
);