import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";

import type {
  RXSectorsMcpToolCaller,
} from "./sectors-mcp-company-enrichment";

export interface RXSectorsMcpSession {
  caller:
    RXSectorsMcpToolCaller;

  close():
    Promise<void>;
}

export interface RXOpenSectorsMcpSessionInput {
  apiKey:
    string;

  endpoint?:
    string;

  cleanupTimeoutMs?:
    number;
}

export interface RXSectorsMcpSessionRuntime {
  createClient():
    {
      connect(
        transport: unknown,
      ): Promise<void>;

      callTool(
        request: {
          name: string;
          arguments: Record<string, unknown>;
        },
      ): Promise<unknown>;

      close():
        Promise<void>;
    };

  createTransport(
    endpoint:
      URL,

    apiKey:
      string,
  ): {
    terminateSession():
      Promise<void>;
  };
}

const DEFAULT_MCP_ENDPOINT =
  "https://sectors-mcp.supertype.ai/mcp";

const DEFAULT_CLEANUP_TIMEOUT_MS =
  5_000;

function defaultRuntime():
  RXSectorsMcpSessionRuntime {
  return {
    createClient() {
      return new Client(
        {
          name:
            "rx-mdi-sectors-mcp",

          version:
            "0.1.0",
        },
        {
          versionNegotiation: {
            mode:
              "auto",
          },
        },
      );
    },

    createTransport(
      endpoint,
      apiKey,
    ) {
      return new StreamableHTTPClientTransport(
        endpoint,
        {
          requestInit: {
            headers: {
              Authorization:
                `Bearer ${apiKey}`,
            },
          },
        },
      );
    },
  };
}

async function settleWithin(
  operation:
    () => Promise<void>,

  timeoutMs:
    number,
): Promise<
  "COMPLETED" |
  "FAILED" |
  "TIMED_OUT"
> {
  let timer:
    ReturnType<typeof setTimeout> |
    undefined;

  try {
    return await Promise.race([
      operation()
        .then(
          () =>
            "COMPLETED" as const,
          () =>
            "FAILED" as const,
        ),

      new Promise<"TIMED_OUT">(
        (resolve) => {
          timer =
            setTimeout(
              () => resolve(
                "TIMED_OUT",
              ),
              timeoutMs,
            );
        },
      ),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(
        timer,
      );
    }
  }
}

/**
 * Opens one reusable Sectors MCP session.
 *
 * Transport ownership is explicit:
 *
 * - this function creates/connects the MCP client;
 * - callers receive only the narrow RX tool-caller boundary;
 * - close() performs bounded best-effort transport termination;
 * - client close is attempted independently even when transport
 *   termination fails or times out;
 * - no REST behavior exists here.
 *
 * A runtime can be injected for deterministic tests so tests never
 * open a real MCP transport.
 */
export async function openSectorsMcpSession(
  input:
    RXOpenSectorsMcpSessionInput,

  runtime:
    RXSectorsMcpSessionRuntime =
      defaultRuntime(),
): Promise<RXSectorsMcpSession> {
  const apiKey =
    input.apiKey.trim();

  if (apiKey.length === 0) {
    throw new Error(
      "SECTORS_API_KEY is required",
    );
  }

  const cleanupTimeoutMs =
    input.cleanupTimeoutMs ??
      DEFAULT_CLEANUP_TIMEOUT_MS;

  if (
    !Number.isInteger(
      cleanupTimeoutMs,
    ) ||
    cleanupTimeoutMs <= 0
  ) {
    throw new Error(
      "cleanupTimeoutMs must be a positive integer",
    );
  }

  const endpoint =
    new URL(
      input.endpoint ??
        DEFAULT_MCP_ENDPOINT,
    );

  const client =
    runtime.createClient();

  const transport =
    runtime.createTransport(
      endpoint,
      apiKey,
    );

  await client.connect(
    transport,
  );

  let closed =
    false;

  return {
    caller: {
      async callTool(
        name,
        args,
      ) {
        if (closed) {
          throw new Error(
            "SECTORS_MCP_SESSION_CLOSED",
          );
        }

        return client.callTool({
          name,
          arguments:
            args,
        });
      },
    },

    async close() {
      if (closed) {
        return;
      }

      closed =
        true;

      await settleWithin(
        () =>
          transport.terminateSession(),
        cleanupTimeoutMs,
      );

      await settleWithin(
        () =>
          client.close(),
        cleanupTimeoutMs,
      );
    },
  };
}