import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXEvidenceCollectionResult,
} from "../investigation/evidence-collection";

import {
  validateEvidenceCollection,
} from "../investigation/validate-evidence-collection";

function available():
  RXEvidenceCollectionResult {
  return {
    requestId: "R1",

    requirementId: "E1",

    capability:
      "MINING_OPERATIONAL_CONTEXT",

    status: "AVAILABLE",

    evidence: [
      {
        evidenceId: "EV1",

        source: "SECTORS",

        sourceReference:
          "observation-1",

        truthClass:
          "SOURCE_FACT",

        description:
          "Operational observation.",
      },
    ],

    issues: [],

    causalConclusion:
      "UNKNOWN",
  };
}

describe(
  "validateEvidenceCollection",
  () => {
    it("accepts valid available evidence", () => {
      const validation =
        validateEvidenceCollection(
          available()
        );

      expect(
        validation.valid
      ).toBe(true);

      expect(
        validation.issues
      ).toEqual([]);
    });

    it("rejects AVAILABLE without evidence", () => {
      const result =
        available();

      result.evidence = [];

      const validation =
        validateEvidenceCollection(
          result
        );

      expect(
        validation.issues
      ).toContain(
        "AVAILABLE_WITHOUT_EVIDENCE"
      );
    });

    it("rejects AVAILABLE with collection issues", () => {
      const result =
        available();

      result.issues = [
        "SEMANTICS_UNKNOWN",
      ];

      const validation =
        validateEvidenceCollection(
          result
        );

      expect(
        validation.issues
      ).toContain(
        "AVAILABLE_WITH_ISSUES"
      );

      expect(
        validation.issues
      ).toContain(
        "ISSUE_NOT_ALLOWED_FOR_STATUS"
      );
    });

    it("accepts UNAVAILABLE only with explicit NO_DATA", () => {
      const result:
        RXEvidenceCollectionResult = {
        ...available(),

        status:
          "UNAVAILABLE",

        evidence: [],

        issues: ["NO_DATA"],
      };

      const validation =
        validateEvidenceCollection(
          result
        );

      expect(
        validation.valid
      ).toBe(true);
    });

    it("accepts INVALID with INVALID_RESPONSE", () => {
      const result:
        RXEvidenceCollectionResult = {
        ...available(),

        status: "INVALID",

        evidence: [],

        issues: [
          "INVALID_RESPONSE",
        ],
      };

      const validation =
        validateEvidenceCollection(
          result
        );

      expect(
        validation.valid
      ).toBe(true);
    });

    it("accepts NOT_COMPARABLE with an explicit comparability issue", () => {
      const result:
        RXEvidenceCollectionResult = {
        ...available(),

        status:
          "NOT_COMPARABLE",

        evidence: [],

        issues: [
          "UNIT_NOT_COMPARABLE",
        ],
      };

      const validation =
        validateEvidenceCollection(
          result
        );

      expect(
        validation.valid
      ).toBe(true);
    });

    it("rejects non-available state carrying evidence", () => {
      const result:
        RXEvidenceCollectionResult = {
        ...available(),

        status: "INVALID",

        issues: [
          "INVALID_RESPONSE",
        ],
      };

      const validation =
        validateEvidenceCollection(
          result
        );

      expect(
        validation.issues
      ).toContain(
        "NON_AVAILABLE_WITH_EVIDENCE"
      );
    });

    it("rejects duplicate evidence identifiers", () => {
      const result =
        available();

      result.evidence.push({
        ...result.evidence[0],
      });

      const validation =
        validateEvidenceCollection(
          result
        );

      expect(
        validation.issues
      ).toContain(
        "DUPLICATE_EVIDENCE_ID"
      );
    });

    it("rejects UNAVAILABLE with a comparability issue", () => {
      const result:
        RXEvidenceCollectionResult = {
        ...available(),

        status:
          "UNAVAILABLE",

        evidence: [],

        issues: [
          "SEMANTICS_UNKNOWN",
        ],
      };

      const validation =
        validateEvidenceCollection(
          result
        );

      expect(
        validation.valid
      ).toBe(false);

      expect(
        validation.issues
      ).toContain(
        "ISSUE_NOT_ALLOWED_FOR_STATUS"
      );
    });

    it("rejects INVALID with NO_DATA", () => {
      const result:
        RXEvidenceCollectionResult = {
        ...available(),

        status: "INVALID",

        evidence: [],

        issues: [
          "NO_DATA",
        ],
      };

      const validation =
        validateEvidenceCollection(
          result
        );

      expect(
        validation.valid
      ).toBe(false);

      expect(
        validation.issues
      ).toContain(
        "ISSUE_NOT_ALLOWED_FOR_STATUS"
      );
    });

    it("rejects NOT_COMPARABLE with INVALID_RESPONSE", () => {
      const result:
        RXEvidenceCollectionResult = {
        ...available(),

        status:
          "NOT_COMPARABLE",

        evidence: [],

        issues: [
          "INVALID_RESPONSE",
        ],
      };

      const validation =
        validateEvidenceCollection(
          result
        );

      expect(
        validation.valid
      ).toBe(false);

      expect(
        validation.issues
      ).toContain(
        "ISSUE_NOT_ALLOWED_FOR_STATUS"
      );
    });
  }
);