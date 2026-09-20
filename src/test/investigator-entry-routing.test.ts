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
  "Investigator V2.2 entry-point routing",
  () => {
    it(
      "routes ProductionSalesVisual with explicit production-sales context",
      () => {
        const source =
          read(
            "src/components/rxmdi/ProductionSalesVisual.tsx",
          );

        expect(
          source,
        ).toContain(
          "/investigations?symbol=${symbol}&path=production-sales",
        );
      },
    );

    it(
      "routes TODAY production-sales cards explicitly",
      () => {
        const source =
          read(
            "src/app/today/page.tsx",
          );

        expect(
          source,
        ).toContain(
          "/investigations?symbol=${company.symbol}&path=production-sales",
        );
      },
    );

    it(
      "routes divergence Insights explicitly",
      () => {
        const source =
          read(
            "src/app/insights/InsightsClient.tsx",
          );

        expect(
          source,
        ).toContain(
          "/investigations?symbol=${item.companies[0]}&path=production-sales",
        );
      },
    );

    it(
      "routes the existing Explore BUMI investigation explicitly",
      () => {
        const source =
          read(
            "src/app/explore/ExploreClient.tsx",
          );

        expect(
          source,
        ).toContain(
          "/investigations?symbol=BUMI&path=production-sales",
        );
      },
    );

    it(
      "does not falsely convert News into production-sales",
      () => {
        const source =
          read(
            "src/app/news/[eventId]/page.tsx",
          );

        expect(
          source,
        ).not.toContain(
          "/investigations?symbol=${symbol}&path=production-sales",
        );
      },
    );
  },
);