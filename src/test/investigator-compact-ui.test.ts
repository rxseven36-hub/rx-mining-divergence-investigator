import {
  describe,
  expect,
  it,
} from "vitest";

import fs from "node:fs";
import path from "node:path";

const readSource = (
  relativePath: string,
) =>
  fs.readFileSync(
    path.join(
      process.cwd(),
      relativePath,
    ),
    "utf8",
  );

const pageSource =
  readSource(
    "src/app/investigations/page.tsx",
  );

const siteSource =
  readSource(
    "src/app/investigations/SiteLicenseInvestigator.tsx",
  );

describe(
  "Investigator V2.3.1 compact desktop UI",
  () => {
    it(
      "keeps the path selector compact",
      () => {
        expect(
          pageSource,
        ).toContain(
          '"22px 0 14px"',
        );

        expect(
          pageSource,
        ).toContain(
          '"clamp(36px, 4.5vw, 60px)"',
        );

        expect(
          pageSource,
        ).toContain(
          "minHeight:\n                    180",
        );
      },
    );

    it(
      "keeps both ready paths executable",
      () => {
        expect(
          pageSource,
        ).toContain(
          'path: "production-sales"',
        );

        expect(
          pageSource,
        ).toContain(
          'path: "site-license"',
        );
      },
    );

    it(
      "compacts the site license launch hero",
      () => {
        expect(
          siteSource,
        ).toContain(
          'minHeight: "auto"',
        );

        expect(
          siteSource,
        ).toContain(
          'fontSize: "clamp(36px, 4vw, 56px)"',
        );

        expect(
          siteSource,
        ).toContain(
          'minHeight: 360',
        );
      },
    );

    it(
      "preserves the site license investigation action",
      () => {
        expect(
          siteSource,
        ).toContain(
          "INITIATE SITE / LICENSE INVESTIGATION",
        );

        expect(
          siteSource,
        ).toContain(
          '"/api/investigate/site-license"',
        );
      },
    );
  },
);