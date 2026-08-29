import {
  describe,
  expect,
  it,
} from "vitest";

import {
  InMemorySectorsRequestLedger,
} from "../data/sectors/request-ledger";

describe("InMemorySectorsRequestLedger", () => {
  it("records request purpose without credentials", () => {
    const ledger =
      new InMemorySectorsRequestLedger();

    const id = ledger.begin({
      path: "/v2/example/",
      purpose:
        "Validate mining response shape",
      estimatedCredits: 1,
    });

    ledger.complete(
      id,
      "SUCCESS",
      200
    );

    const [entry] =
      ledger.snapshot();

    expect(entry).toMatchObject({
      path: "/v2/example/",
      purpose:
        "Validate mining response shape",
      estimatedCredits: 1,
      status: "SUCCESS",
      httpStatus: 200,
    });

    expect(entry).not.toHaveProperty(
      "authorization"
    );

    expect(entry).not.toHaveProperty(
      "apiKey"
    );
  });

  it("records locally blocked requests", () => {
    const ledger =
      new InMemorySectorsRequestLedger();

    ledger.blocked({
      path: "/v2/example/",
      purpose:
        "Blocked test request",
      estimatedCredits: 2,
    });

    expect(
      ledger.snapshot()[0].status
    ).toBe("BLOCKED");
  });
});