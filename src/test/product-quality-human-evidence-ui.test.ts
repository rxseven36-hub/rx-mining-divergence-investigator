import {
  readFileSync,
} from "node:fs";

import {
  describe,
  expect,
  it,
} from "vitest";

const source =
  readFileSync(
    "src/app/investigations/ProductQualityInvestigator.tsx",
    "utf8",
  );

describe(
  "Product Quality V2.8H human evidence UI",
  () => {
    it(
      "uses the normalized unit object contract",
      () => {
        expect(source).toContain(
          'symbol: "kcal/kg" | "%";',
        );

        expect(source).toContain(
          '"ENERGY_PER_MASS"',
        );

        expect(source).toContain(
          '"PERCENTAGE"',
        );
      },
    );

    it(
      "renders the unit symbol instead of coercing the unit object",
      () => {
        expect(source).toContain(
          "const unitSymbol =",
        );

        expect(source).toContain(
          "unit.symbol",
        );

        expect(source).not.toContain(
          "${formatNumber(min)} ${unit}`",
        );
      },
    );

    it(
      "renders admitted observations as human-readable evidence",
      () => {
        expect(source).toContain(
          "Human-readable source facts",
        );

        expect(source).toContain(
          ".admittedObservations",
        );

        expect(source).toContain(
          "<HumanEvidenceCard",
        );
      },
    );

    it(
      "shows human evidence before raw JSON",
      () => {
        const humanIndex =
          source.indexOf(
            "Human-readable source facts",
          );

        const rawIndex =
          source.indexOf(
            "VIEW RAW EVIDENCE",
          );

        expect(humanIndex).toBeGreaterThan(
          -1,
        );

        expect(rawIndex).toBeGreaterThan(
          humanIndex,
        );
      },
    );

    it(
      "keeps raw evidence available only on demand",
      () => {
        expect(source).toContain(
          "showRawEvidence",
        );

        expect(source).toContain(
          "VIEW RAW EVIDENCE",
        );

        expect(source).toContain(
          "HIDE RAW EVIDENCE",
        );

        expect(source).toContain(
          "JSON.stringify(",
        );
      },
    );

    it(
      "labels evidence in human terms",
      () => {
        expect(source).toContain(
          "Source: Sectors",
        );

        expect(source).toContain(
          "Evidence type: Source Fact",
        );

        expect(source).toContain(
          "Status: Admitted by RX",
        );

        expect(source).toContain(
          "Reporting period:",
        );
      },
    );

    it(
      "preserves the no-derivation doctrine",
      () => {
        expect(source).toContain(
          "NO QUALITY SCORE",
        );

        expect(source).toContain(
          "NO MIDPOINT DERIVATION",
        );

        expect(source).toContain(
          "CAUSALITY",
        );

        expect(source).toContain(
          "UNKNOWN",
        );
      },
    );

    it(
      "does not introduce a new API path",
      () => {
        expect(source).toContain(
          '"/api/investigate/product-quality"',
        );

        expect(source).not.toContain(
          "/api/investigate/product-quality/evidence",
        );
      },
    );
  },
);