import {
  describe,
  expect,
  it,
} from "vitest";

import {
  redactSensitive,
} from "../security/redact-sensitive";

describe("redactSensitive", () => {
  it("redacts authorization fields", () => {
    expect(
      redactSensitive({
        Authorization: "test-key",
        path: "/v2/test/",
      })
    ).toEqual({
      Authorization: "[REDACTED]",
      path: "/v2/test/",
    });
  });

  it("redacts nested API keys and tokens", () => {
    expect(
      redactSensitive({
        config: {
          apiKey: "abc",
          access_token: "xyz",
        },
      })
    ).toEqual({
      config: {
        apiKey: "[REDACTED]",
        access_token: "[REDACTED]",
      },
    });
  });

  it("preserves non-sensitive data", () => {
    expect(
      redactSensitive({
        symbol: "ANTM.JK",
        commodity: "Nickel",
      })
    ).toEqual({
      symbol: "ANTM.JK",
      commodity: "Nickel",
    });
  });
});