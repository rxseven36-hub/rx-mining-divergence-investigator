import {
  readFileSync,
} from "node:fs";

import {
  describe,
  expect,
  it,
} from "vitest";

const component =
  readFileSync(
    "src/app/investigations/ProductQualityInvestigator.tsx",
    "utf8",
  );

const css =
  readFileSync(
    "src/app/globals.css",
    "utf8",
  );

describe(
  "Product Quality V2.8I presentation polish",
  () => {
    it(
      "uses a dedicated proportional product badge",
      () => {
        expect(component).toContain(
          'className="rx-product-quality-badge"',
        );

        expect(css).toContain(
          ".rx-product-quality-badge",
        );
      },
    );

    it(
      "preserves reported product quality labels",
      () => {
        expect(component).toContain(
          "PRODUCT",
        );

        expect(component).toContain(
          "REPORTED QUALITY",
        );
      },
    );

    it(
      "shows processing feedback only while running",
      () => {
        expect(component).toContain(
          "{running ? (",
        );

        expect(component).toContain(
          'className="rx-investigation-processing"',
        );

        expect(component).toContain(
          "Retrieving and admitting source evidence...",
        );
      },
    );

    it(
      "uses an indeterminate processing bar",
      () => {
        expect(component).toContain(
          "rx-investigation-processing-track",
        );

        expect(component).toContain(
          "rx-investigation-processing-bar",
        );

        expect(css).toContain(
          "@keyframes rx-investigation-processing-scan",
        );
      },
    );

    it(
      "does not invent progress percentage",
      () => {
        expect(component).not.toContain(
          "progressPercentage",
        );

        expect(component).not.toContain(
          "progressPercent",
        );
      },
    );

    it(
      "provides accessible running status",
      () => {
        expect(component).toContain(
          'role="status"',
        );

        expect(component).toContain(
          'aria-live="polite"',
        );

        expect(component).toContain(
          'aria-label="Product quality investigation in progress"',
        );
      },
    );

    it(
      "preserves product quality API",
      () => {
        expect(component).toContain(
          '"/api/investigate/product-quality"',
        );
      },
    );

    it(
      "supports reduced motion",
      () => {
        expect(css).toContain(
          "@media (prefers-reduced-motion: reduce)",
        );
      },
    );
  },
);