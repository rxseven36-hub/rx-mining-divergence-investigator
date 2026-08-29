import {
  describe,
  expect,
  it,
} from "vitest";

import {
  isSemanticKnowledgeKnown,
} from "../data/normalization/semantic-state";

describe(
  "semantic knowledge",
  () => {
    it("accepts KNOWN only when an explicit basis exists", () => {
      expect(
        isSemanticKnowledgeKnown({
          state: "KNOWN",
          description:
            "Reported mining production.",
          basis:
            "Mapped from validated Sectors production field.",
        })
      ).toBe(true);
    });

    it("rejects KNOWN without a basis", () => {
      expect(
        isSemanticKnowledgeKnown({
          state: "KNOWN",
          description:
            "Looks descriptive.",
        })
      ).toBe(false);
    });

    it("rejects UNKNOWN even when a description exists", () => {
      expect(
        isSemanticKnowledgeKnown({
          state: "UNKNOWN",
          description:
            "A generated description exists.",
          basis:
            "A basis string must not override UNKNOWN state.",
        })
      ).toBe(false);
    });

    it("rejects an empty KNOWN basis", () => {
      expect(
        isSemanticKnowledgeKnown({
          state: "KNOWN",
          basis: "   ",
        })
      ).toBe(false);
    });
  }
);