import {
  describe,
  expect,
  it,
} from "vitest";

import fs from "node:fs";
import path from "node:path";

const source =
  fs.readFileSync(
    path.join(
      process.cwd(),
      "src/app/investigations/page.tsx",
    ),
    "utf8",
  );

describe(
  "Investigator V2.3 path selector",
  () => {
    it(
      "shows the selector when no path is supplied",
      () => {
        expect(
          source,
        ).toContain(
          "What do you want",
        );

        expect(
          source,
        ).toContain(
          "rawPath === null",
        );

        expect(
          source,
        ).toContain(
          "<InvestigationPathSelector",
        );
      },
    );

    it(
      "exposes the two executable investigation paths",
      () => {
        expect(
          source,
        ).toContain(
          'path: "production-sales"',
        );

        expect(
          source,
        ).toContain(
          'path: "site-license"',
        );
      },
    );

    it(
      "does not silently default a missing path to production-sales",
      () => {
        expect(
          source,
        ).not.toContain(
          'rawPath === null\n        ? "production-sales"',
        );
      },
    );

    it(
      "keeps future paths non-executable",
      () => {
        expect(
          source,
        ).toContain(
          'path: "ob-strip"',
        );

        expect(
          source,
        ).toContain(
          'path: "resources-reserves"',
        );

        expect(
          source,
        ).toContain(
          'path: "product-quality"',
        );

        expect(
          source,
        ).toContain(
          'path: "sales-destination"',
        );

        expect(
          source,
        ).toContain(
          'path: "financial"',
        );

        expect(
          source,
        ).toContain(
          'path: "market"',
        );

        expect(
          source,
        ).toContain(
          'path: "commodity-context"',
        );

        expect(
          source,
        ).toContain(
          'path: "news-event"',
        );

        expect(
          source,
        ).toContain(
          "CONTEXT ONLY",
        );
      },
    );

    it(
      "preserves hard blocking for unsupported explicit paths",
      () => {
        expect(
          source,
        ).toContain(
          "<UnsupportedInvestigationPath",
        );

        expect(
          source,
        ).toContain(
          "NO SILENT FALLBACK",
        );
      },
    );
  },
);