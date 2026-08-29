import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  SectorsCreditBudget,
} from "../data/sectors/credit-budget";

import {
  SectorsClientError,
} from "../data/sectors/sectors-errors";

import {
  SectorsHttpClient,
  type SectorsFetch,
} from "../data/sectors/sectors-http-client";

describe("SectorsHttpClient", () => {
  it("uses raw API key authorization for REST v2", async () => {
    const fetchMock = vi.fn(
      async (
        _input: string | URL,
        init?: RequestInit
      ) => {
        const headers =
          init?.headers as Record<
            string,
            string
          >;

        expect(
          headers.Authorization
        ).toBe("test-key");

        expect(
          headers.Authorization
            .startsWith("Bearer ")
        ).toBe(false);

        return new Response(
          JSON.stringify({
            ok: true,
          }),
          {
            status: 200,
            headers: {
              "content-type":
                "application/json",
            },
          }
        );
      }
    ) as SectorsFetch;

    const client =
      new SectorsHttpClient({
        apiKey: "test-key",
        fetchImpl: fetchMock,
        creditBudget:
          new SectorsCreditBudget(1),
      });

    const result =
      await client.requestJson<{
        ok: boolean;
      }>({
        path: "/v2/subsectors/",
        purpose:
          "Test REST authorization contract",
        estimatedCredits: 1,
      });

    expect(result.ok).toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(
      1
    );

    expect(
      client.ledger.snapshot()[0]
    ).toMatchObject({
      status: "SUCCESS",
      httpStatus: 200,
    });
  });

  it("rejects construction without an API key", () => {
    expect(
      () =>
        new SectorsHttpClient({
          apiKey: "   ",
        })
    ).toThrowError(
      expect.objectContaining({
        code: "MISSING_API_KEY",
      })
    );
  });

  it("blocks requests before network access when budget is exhausted", async () => {
    const fetchMock =
      vi.fn() as unknown as SectorsFetch;

    const client =
      new SectorsHttpClient({
        apiKey: "test-key",
        fetchImpl: fetchMock,
        creditBudget:
          new SectorsCreditBudget(0),
      });

    await expect(
      client.requestJson({
        path: "/v2/subsectors/",
        purpose:
          "Budget guard test",
        estimatedCredits: 1,
      })
    ).rejects.toMatchObject({
      code:
        "CREDIT_BUDGET_EXCEEDED",
    });

    expect(fetchMock).not.toHaveBeenCalled();

    expect(
      client.ledger.snapshot()[0]
        .status
    ).toBe("BLOCKED");
  });

  it("returns typed HTTP error for 429", async () => {
    const fetchMock =
      vi.fn(async () => {
        return new Response(
          "",
          {
            status: 429,
            headers: {
              "retry-after": "10",
            },
          }
        );
      }) as SectorsFetch;

    const client =
      new SectorsHttpClient({
        apiKey: "test-key",
        fetchImpl: fetchMock,
        creditBudget:
          new SectorsCreditBudget(1),
      });

    try {
      await client.requestJson({
        path: "/v2/subsectors/",
        purpose:
          "429 handling test",
        estimatedCredits: 1,
      });

      throw new Error(
        "Expected request to fail"
      );
    } catch (error) {
      expect(
        error
      ).toBeInstanceOf(
        SectorsClientError
      );

      expect(error).toMatchObject({
        code: "HTTP_ERROR",
        status: 429,
        retryAfter: "10",
      });
    }

    expect(
      client.ledger.snapshot()[0]
    ).toMatchObject({
      status: "FAILED",
      httpStatus: 429,
    });
  });

  it("rejects invalid JSON without inventing data", async () => {
    const fetchMock =
      vi.fn(async () => {
        return new Response(
          "not-json",
          {
            status: 200,
          }
        );
      }) as SectorsFetch;

    const client =
      new SectorsHttpClient({
        apiKey: "test-key",
        fetchImpl: fetchMock,
        creditBudget:
          new SectorsCreditBudget(1),
      });

    await expect(
      client.requestJson({
        path: "/v2/subsectors/",
        purpose:
          "Invalid JSON test",
        estimatedCredits: 1,
      })
    ).rejects.toMatchObject({
      code: "INVALID_JSON",
    });

    expect(
      client.ledger.snapshot()[0]
        .status
    ).toBe("FAILED");
  });

  it("rejects non-v2 API paths", async () => {
    const fetchMock =
      vi.fn() as unknown as SectorsFetch;

    const client =
      new SectorsHttpClient({
        apiKey: "test-key",
        fetchImpl: fetchMock,
        creditBudget:
          new SectorsCreditBudget(1),
      });

    await expect(
      client.requestJson({
        path: "/v1/subsectors/",
        purpose:
          "Reject legacy API",
        estimatedCredits: 1,
      })
    ).rejects.toMatchObject({
      code: "INVALID_REQUEST",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("converts network failures into typed errors", async () => {
    const fetchMock =
      vi.fn(async () => {
        throw new Error(
          "network unavailable"
        );
      }) as SectorsFetch;

    const client =
      new SectorsHttpClient({
        apiKey: "test-key",
        fetchImpl: fetchMock,
        creditBudget:
          new SectorsCreditBudget(1),
      });

    await expect(
      client.requestJson({
        path: "/v2/subsectors/",
        purpose:
          "Network failure test",
        estimatedCredits: 1,
      })
    ).rejects.toMatchObject({
      code: "NETWORK_ERROR",
    });

    expect(
      client.ledger.snapshot()[0]
        .status
    ).toBe("FAILED");
  });
});