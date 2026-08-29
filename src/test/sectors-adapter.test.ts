import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  RestSectorsAdapter,
} from "../data/sectors/sectors-adapter";

import {
  SectorsHttpClient,
  type SectorsFetch,
} from "../data/sectors/sectors-http-client";

import {
  SectorsCreditBudget,
} from "../data/sectors/credit-budget";

describe("RestSectorsAdapter", () => {
  it("provides the official RX boundary to Sectors REST", async () => {
    const fetchMock =
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            data: ["ok"],
          }),
          {
            status: 200,
            headers: {
              "content-type":
                "application/json",
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

    const adapter =
      new RestSectorsAdapter(client);

    const result =
      await adapter.requestJson<{
        data: string[];
      }>({
        path: "/v2/subsectors/",
        purpose:
          "Adapter boundary test",
        estimatedCredits: 1,
      });

    expect(result).toEqual({
      data: ["ok"],
    });

    expect(fetchMock).toHaveBeenCalledTimes(
      1
    );
  });
});