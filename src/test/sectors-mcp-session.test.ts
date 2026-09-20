import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  openSectorsMcpSession,
} from "../data/sectors-mcp/sectors-mcp-session";

describe(
  "Sectors MCP session",
  () => {
    it(
      "connects with the injected runtime and exposes the narrow caller",
      async () => {
        const connect =
          vi.fn(
            async () => undefined,
          );

        const callTool =
          vi.fn(
            async () => ({
              structuredContent: {
                ok:
                  true,
              },
            }),
          );

        const clientClose =
          vi.fn(
            async () => undefined,
          );

        const terminateSession =
          vi.fn(
            async () => undefined,
          );

        const createTransport =
          vi.fn(
            () => ({
              terminateSession,
            }),
          );

        const session =
          await openSectorsMcpSession(
            {
              apiKey:
                "TEST-KEY",

              endpoint:
                "https://example.test/mcp",

              cleanupTimeoutMs:
                50,
            },
            {
              createClient() {
                return {
                  connect,
                  callTool,
                  close:
                    clientClose,
                };
              },

              createTransport,
            },
          );

        expect(
          connect,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          createTransport,
        ).toHaveBeenCalledTimes(
          1,
        );

        const result =
          await session.caller.callTool(
            "fetch-company-report",
            {
              symbol:
                "BUMI",
            },
          );

        expect(
          result,
        ).toEqual({
          structuredContent: {
            ok:
              true,
          },
        });

        expect(
          callTool,
        ).toHaveBeenCalledTimes(
          1,
        );

        await session.close();

        expect(
          terminateSession,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          clientClose,
        ).toHaveBeenCalledTimes(
          1,
        );
      },
    );

    it(
      "is idempotent and rejects tool calls after close",
      async () => {
        const terminateSession =
          vi.fn(
            async () => undefined,
          );

        const clientClose =
          vi.fn(
            async () => undefined,
          );

        const session =
          await openSectorsMcpSession(
            {
              apiKey:
                "TEST-KEY",

              cleanupTimeoutMs:
                50,
            },
            {
              createClient() {
                return {
                  connect:
                    async () => undefined,

                  callTool:
                    async () => ({
                      ok:
                        true,
                    }),

                  close:
                    clientClose,
                };
              },

              createTransport() {
                return {
                  terminateSession,
                };
              },
            },
          );

        await session.close();
        await session.close();

        expect(
          terminateSession,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          clientClose,
        ).toHaveBeenCalledTimes(
          1,
        );

        await expect(
          session.caller.callTool(
            "fetch-company-report",
            {
              symbol:
                "BUMI",
            },
          ),
        ).rejects.toThrow(
          "SECTORS_MCP_SESSION_CLOSED",
        );
      },
    );

    it(
      "attempts client close when transport termination fails",
      async () => {
        const clientClose =
          vi.fn(
            async () => undefined,
          );

        const session =
          await openSectorsMcpSession(
            {
              apiKey:
                "TEST-KEY",

              cleanupTimeoutMs:
                50,
            },
            {
              createClient() {
                return {
                  connect:
                    async () => undefined,

                  callTool:
                    async () => ({
                      ok:
                        true,
                    }),

                  close:
                    clientClose,
                };
              },

              createTransport() {
                return {
                  terminateSession:
                    async () => {
                      throw new Error(
                        "TERMINATE_FAILED",
                      );
                    },
                };
              },
            },
          );

        await expect(
          session.close(),
        ).resolves.toBeUndefined();

        expect(
          clientClose,
        ).toHaveBeenCalledTimes(
          1,
        );
      },
    );

    it(
      "bounds a hanging transport termination and still attempts client close",
      async () => {
        const never =
          new Promise<void>(
            () => {
              // Intentionally unresolved.
            },
          );

        const clientClose =
          vi.fn(
            async () => undefined,
          );

        const session =
          await openSectorsMcpSession(
            {
              apiKey:
                "TEST-KEY",

              cleanupTimeoutMs:
                20,
            },
            {
              createClient() {
                return {
                  connect:
                    async () => undefined,

                  callTool:
                    async () => ({
                      ok:
                        true,
                    }),

                  close:
                    clientClose,
                };
              },

              createTransport() {
                return {
                  terminateSession:
                    () => never,
                };
              },
            },
          );

        const observed =
          await Promise.race([
            session.close()
              .then(
                () =>
                  "RETURNED" as const,
              ),

            new Promise<"TIMED_OUT">(
              (resolve) => {
                setTimeout(
                  () => resolve(
                    "TIMED_OUT",
                  ),
                  100,
                );
              },
            ),
          ]);

        expect(
          observed,
        ).toBe(
          "RETURNED",
        );

        expect(
          clientClose,
        ).toHaveBeenCalledTimes(
          1,
        );
      },
    );

    it(
      "bounds a hanging client close",
      async () => {
        const never =
          new Promise<void>(
            () => {
              // Intentionally unresolved.
            },
          );

        const session =
          await openSectorsMcpSession(
            {
              apiKey:
                "TEST-KEY",

              cleanupTimeoutMs:
                20,
            },
            {
              createClient() {
                return {
                  connect:
                    async () => undefined,

                  callTool:
                    async () => ({
                      ok:
                        true,
                    }),

                  close:
                    () => never,
                };
              },

              createTransport() {
                return {
                  terminateSession:
                    async () => undefined,
                };
              },
            },
          );

        const observed =
          await Promise.race([
            session.close()
              .then(
                () =>
                  "RETURNED" as const,
              ),

            new Promise<"TIMED_OUT">(
              (resolve) => {
                setTimeout(
                  () => resolve(
                    "TIMED_OUT",
                  ),
                  100,
                );
              },
            ),
          ]);

        expect(
          observed,
        ).toBe(
          "RETURNED",
        );
      },
    );
  },
);