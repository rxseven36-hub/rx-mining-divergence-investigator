import fs from "node:fs";

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  enrichSectorsMcpCompanyWithCaller,
  runSectorsMcpCompanyEnrichment,
  type RXSectorsMcpToolCaller,
} from "../data/sectors-mcp/sectors-mcp-company-enrichment";

const BUMI = {
  name:
    "PT Bumi Resources Tbk",
  slug:
    "pt-bumi-resources-tbk",
  symbol:
    "BUMI.JK",
} as const;

describe(
  "Sectors MCP canonical company enrichment",
  () => {
    it(
      "rejects an ambiguous wrong Bumi match",
      async () => {
        const calls: string[] = [];

        const caller:
          RXSectorsMcpToolCaller = {
          async callTool(
            name,
          ) {
            calls.push(name);

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify([
                    {
                      name:
                        "PT Bumi Bintang Silika",
                      slug:
                        "pt-bumi-bintang-silika",
                      symbol:
                        "BBS",
                    },
                  ]),
                },
              ],
            };
          },
        };

        const result =
          await enrichSectorsMcpCompanyWithCaller(
            caller,
            BUMI,
          );

        expect(
          result.status,
        ).toBe(
          "UNRESOLVED",
        );

        expect(
          calls,
        ).toEqual([
          "fetch-mining-companies",
        ]);
      },
    );

    it(
      "uses only the bounded golden tool path after canonical resolution",
      async () => {
        const calls: Array<{
          name: string;
          args:
            Record<string, unknown>;
        }> = [];

        const caller:
          RXSectorsMcpToolCaller = {
          async callTool(
            name,
            args,
          ) {
            calls.push({
              name,
              args,
            });

            if (
              name ===
              "fetch-mining-companies"
            ) {
              return {
                content: [
                  {
                    type:
                      "text",
                    text:
                      JSON.stringify([
                        {
                          name:
                            BUMI.name,
                          slug:
                            BUMI.slug,
                          symbol:
                            BUMI.symbol,
                        },
                      ]),
                  },
                ],
              };
            }

            if (
              name ===
              "fetch-mining-company-detail"
            ) {
              return {
                structuredContent: {
                  name:
                    BUMI.name,
                  slug:
                    BUMI.slug,
                  symbol:
                    BUMI.symbol,
                  company_type:
                    "Holding",
                },
              };
            }

            return {
              structuredContent: {
                symbol:
                  "BUMI",
                overview: {
                  available:
                    true,
                },
              },
            };
          },
        };

        const result =
          await enrichSectorsMcpCompanyWithCaller(
            caller,
            BUMI,
          );

        expect(
          result.status,
        ).toBe("OK");

        expect(
          calls.map(
            (call) =>
              call.name,
          ),
        ).toEqual([
          "fetch-mining-companies",
          "fetch-mining-company-detail",
          "fetch-company-report",
        ]);

        expect(
          calls[0]?.args,
        ).toEqual({
          keyword: "BUMI",
          limit: 20,
        });

        expect(
          calls[1]?.args,
        ).toEqual({
          slug:
            BUMI.slug,
        });

        expect(
          calls[2]?.args,
        ).toEqual({
          symbol: "BUMI",
          sections: [
            "overview",
            "financials",
            "ownership",
            "valuation",
          ],
        });
      },
    );
  },
);

function readEnvValue(
  file: string,
  key: string,
): string | null {
  if (!fs.existsSync(file)) {
    return null;
  }

  for (
    const raw of fs
      .readFileSync(
        file,
        "utf8",
      )
      .split(/\r?\n/)
  ) {
    const line =
      raw.trim();

    if (
      !line ||
      line.startsWith("#")
    ) {
      continue;
    }

    const index =
      line.indexOf("=");

    if (index < 1) {
      continue;
    }

    if (
      line
        .slice(0, index)
        .trim() !== key
    ) {
      continue;
    }

    let value =
      line
        .slice(index + 1)
        .trim();

    if (
      (
        value.startsWith('"') &&
        value.endsWith('"')
      ) ||
      (
        value.startsWith("'") &&
        value.endsWith("'")
      )
    ) {
      value =
        value.slice(1, -1);
    }

    return value;
  }

  return null;
}

const liveEnabled =
  process.env.RX_MCP_LIVE ===
  "1";

const liveIt =
  liveEnabled
    ? it
    : it.skip;

liveIt(
  "LIVE GOLDEN BUMI resolves and enriches through Sectors MCP",
  async () => {
    const apiKey =
      process.env
        .SECTORS_API_KEY ??
      readEnvValue(
        ".env.local",
        "SECTORS_API_KEY",
      );

    expect(apiKey).toBeTruthy();

    const result =
      await runSectorsMcpCompanyEnrichment({
        apiKey:
          apiKey as string,
        company:
          BUMI,
      });

    console.log(
      "\nMCP GOLDEN BUMI:",
      JSON.stringify(
        {
          status:
            result.status,
          entity:
            result.entity,
          toolsUsed:
            result.toolsUsed,
          issue:
            "issue" in result
              ? result.issue
              : null,
        },
        null,
        2,
      ),
    );

    expect(
      result.status,
    ).toBe("OK");

    expect(
      result.entity,
    ).toEqual({
      ...BUMI,
      resolved: true,
    });

    expect(
      result.toolsUsed,
    ).toEqual([
      "fetch-mining-companies",
      "fetch-mining-company-detail",
      "fetch-company-report",
    ]);
  },
);
