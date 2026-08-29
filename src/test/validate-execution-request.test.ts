import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXCapabilityDefinition,
} from "../investigation/capability";

import type {
  RXEvidenceRequirement,
  RXInvestigationDataRequest,
} from "../investigation/investigation-plan";

import {
  validateExecutionRequest,
} from "../investigation/validate-execution-request";

function request(
  overrides:
    Partial<RXInvestigationDataRequest> = {}
): RXInvestigationDataRequest {
  return {
    requestId: "request-1",
    requirementId: "requirement-1",
    source: "SECTORS",
    capability:
      "MINING_OPERATIONAL_CONTEXT",
    purpose:
      "Collect operational context.",
    status: "PLANNED",
    ...overrides,
  };
}

function requirement(
  overrides:
    Partial<RXEvidenceRequirement> = {}
): RXEvidenceRequirement {
  return {
    requirementId:
      "requirement-1",
    questionId: "question-1",
    kind:
      "COMPANY_OPERATIONAL",
    description:
      "Company operational evidence.",
    required: true,
    ...overrides,
  };
}

function capability(
  overrides:
    Partial<RXCapabilityDefinition> = {}
): RXCapabilityDefinition {
  return {
    capability:
      "MINING_OPERATIONAL_CONTEXT",
    source: "SECTORS",
    requirementKind:
      "COMPANY_OPERATIONAL",
    description:
      "Mining operational context.",
    executionBoundary:
      "SECTORS_ADAPTER",
    enabled: true,
    ...overrides,
  };
}

describe(
  "validateExecutionRequest",
  () => {
    it("allows a planned request with matching enabled capability", () => {
      const result =
        validateExecutionRequest(
          request(),
          requirement(),
          capability()
        );

      expect(
        result.status
      ).toBe("READY");

      expect(
        result.issues
      ).toEqual([]);

      expect(
        result.causalConclusion
      ).toBe("UNKNOWN");
    });

    it("rejects a request that is no longer planned", () => {
      const result =
        validateExecutionRequest(
          request({
            status:
              "COLLECTED",
          }),
          requirement(),
          capability()
        );

      expect(
        result.status
      ).toBe("REJECTED");

      expect(
        result.issues
      ).toContain(
        "REQUEST_NOT_PLANNED"
      );
    });

    it("rejects an unregistered capability", () => {
      const result =
        validateExecutionRequest(
          request(),
          requirement(),
          undefined
        );

      expect(
        result.status
      ).toBe("REJECTED");

      expect(
        result.issues
      ).toContain(
        "CAPABILITY_NOT_REGISTERED"
      );
    });

    it("rejects a disabled capability", () => {
      const result =
        validateExecutionRequest(
          request(),
          requirement(),
          capability({
            enabled: false,
          })
        );

      expect(
        result.status
      ).toBe("REJECTED");

      expect(
        result.issues
      ).toContain(
        "CAPABILITY_DISABLED"
      );
    });

    it("rejects a capability whose requirement kind does not match", () => {
      const result =
        validateExecutionRequest(
          request(),
          requirement({
            kind:
              "COMMODITY_PRICE",
          }),
          capability()
        );

      expect(
        result.status
      ).toBe("REJECTED");

      expect(
        result.issues
      ).toContain(
        "REQUIREMENT_MISMATCH"
      );
    });

    it("rejects a missing evidence requirement", () => {
      const result =
        validateExecutionRequest(
          request(),
          undefined,
          capability()
        );

      expect(
        result.status
      ).toBe("REJECTED");

      expect(
        result.issues
      ).toContain(
        "REQUIREMENT_MISMATCH"
      );
    });
  }
);