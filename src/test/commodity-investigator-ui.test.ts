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
  "Commodity Context Investigator UI",
  () => {
    it(
      "uses the dedicated Commodity API and never auto-runs it",
      () => {
        const source =
          read(
            "src/app/investigations/CommodityInvestigator.tsx",
          );

        expect(source).toContain(
          '"/api/investigate/commodity"',
        );

        expect(source).toContain(
          "runInvestigation",
        );

        expect(source).toContain(
          "onClick={",
        );

        expect(source).not.toContain(
          "useEffect(",
        );

        expect(source).not.toContain(
          "/api/investigate/market",
        );
      },
    );

    it(
      "exposes exactly the four admitted commodity choices",
      () => {
        const source =
          read(
            "src/app/investigations/CommodityInvestigator.tsx",
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
            `id: "${commodity}"`,
          );
        }

        expect(source).not.toContain(
          'id: "SILVER"',
        );

        expect(source).not.toContain(
          'id: "TIN"',
        );
      },
    );

    it(
      "exposes an explicit human-triggered movement investigation",
      () => {
        const source =
          read(
            "src/app/investigations/CommodityInvestigator.tsx",
          );

        expect(source).toContain(
          "INVESTIGATE MOVEMENT",
        );

        expect(source).toContain(
          "START YEAR",
        );

        expect(source).toContain(
          "END YEAR",
        );

        expect(source).toContain(
          "SHOW EVIDENCE",
        );

        expect(source).toContain(
          "CAUSALITY UNKNOWN",
        );
      },
    );

    it(
      "keeps commodity context independent from company attribution",
      () => {
        const source =
          read(
            "src/app/investigations/CommodityInvestigator.tsx",
          );

        expect(source).not.toContain(
          "companyId",
        );

        expect(source).not.toContain(
          "ticker",
        );

        expect(source).not.toContain(
          "initialSymbol",
        );

        expect(source).toContain(
          "GLOBAL",
        );

        expect(source).toMatch(
          /not\s+automatically\s+attributed\s+to\s+any/i,
        );
      },
    );

    it(
      "does not manufacture directional or causal conclusions",
      () => {
        const source =
          read(
            "src/app/investigations/CommodityInvestigator.tsx",
          );

        expect(source).toMatch(
          /does\s+not\s+infer\s+bullish/i,
        );

        expect(source).toMatch(
          /bearish\s+state/i,
        );

        expect(source).not.toMatch(
          /\bcaused by\b|\bbecause of\b|\bcausal conclusion:\s*(?!unknown)/i,
        );
      },
    );

    it(
      "is wired as executable path number six",
      () => {
        const page =
          read(
            "src/app/investigations/page.tsx",
          );

        expect(page).toContain(
          'import CommodityInvestigator from "./CommodityInvestigator";',
        );

        expect(page).toContain(
          'path: "commodity-context"',
        );

        expect(page).toContain(
          'resolvedPath ===\n      "commodity-context"',
        );

        expect(page).toContain(
          "<CommodityInvestigator />",
        );

        expect(page).not.toContain(
          "Commodity evidence exists in the intelligence stack, but the standalone investigation path is not yet open.",
        );
      },
    );
  },
);