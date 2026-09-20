import {
  RestSectorsAdapter,
  type SectorsAdapter,
} from "../data/sectors/sectors-adapter";

import {
  SectorsCreditBudget,
} from "../data/sectors/credit-budget";

import {
  SectorsHttpClient,
} from "../data/sectors/sectors-http-client";

import {
  openSectorsMcpSession,
  type RXSectorsMcpSession,
} from "../data/sectors-mcp/sectors-mcp-session";

import type {
  RXSectorsMcpToolCaller,
} from "../data/sectors-mcp/sectors-mcp-company-enrichment";

export interface RXInvestigationServerRuntime {
  adapter:
    SectorsAdapter;

  mcpCaller:
    RXSectorsMcpToolCaller;

  close():
    Promise<void>;
}

export interface RXCreateInvestigationServerRuntimeInput {
  sectorsApiKey:
    string;

  restEstimatedCreditBudget?:
    number;

  mcpEndpoint?:
    string;
}

export interface RXInvestigationServerRuntimeDependencies {
  createRestAdapter(
    apiKey:
      string,

    estimatedCreditBudget:
      number,
  ): SectorsAdapter;

  openMcpSession(
    input: {
      apiKey:
        string;

      endpoint?:
        string;
    },
  ): Promise<RXSectorsMcpSession>;
}

const DEFAULT_REST_ESTIMATED_CREDIT_BUDGET =
  4;

function defaultDependencies():
  RXInvestigationServerRuntimeDependencies {
  return {
    createRestAdapter(
      apiKey,
      estimatedCreditBudget,
    ) {
      const client =
        new SectorsHttpClient({
          apiKey,

          creditBudget:
            new SectorsCreditBudget(
              estimatedCreditBudget,
            ),
        });

      return new RestSectorsAdapter(
        client,
      );
    },

    openMcpSession(
      input,
    ) {
      return openSectorsMcpSession(
        input,
      );
    },
  };
}

/**
 * Server-only provider composition for the integrated
 * investigation application.
 *
 * REST and MCP share the same Sectors credential value but retain
 * their independent transport/auth implementations:
 *
 * - REST authentication remains owned by SectorsHttpClient.
 * - MCP Bearer authentication remains owned by sectors-mcp-session.
 *
 * No provider request is executed merely by creating the REST
 * adapter. Opening the MCP session performs only MCP connection
 * establishment; tool execution remains owned by the Financial
 * executor.
 */
export async function createInvestigationServerRuntime(
  input:
    RXCreateInvestigationServerRuntimeInput,

  dependencies:
    RXInvestigationServerRuntimeDependencies =
      defaultDependencies(),
): Promise<RXInvestigationServerRuntime> {
  const sectorsApiKey =
    input.sectorsApiKey.trim();

  if (sectorsApiKey.length === 0) {
    throw new Error(
      "SECTORS_API_KEY is required",
    );
  }

  const restEstimatedCreditBudget =
    input.restEstimatedCreditBudget ??
      DEFAULT_REST_ESTIMATED_CREDIT_BUDGET;

  if (
    !Number.isInteger(
      restEstimatedCreditBudget,
    ) ||
    restEstimatedCreditBudget < 0
  ) {
    throw new Error(
      "restEstimatedCreditBudget must be a non-negative integer",
    );
  }

  const adapter =
    dependencies.createRestAdapter(
      sectorsApiKey,
      restEstimatedCreditBudget,
    );

  const mcpSession =
    await dependencies.openMcpSession({
      apiKey:
        sectorsApiKey,

      endpoint:
        input.mcpEndpoint,
    });

  return {
    adapter,

    mcpCaller:
      mcpSession.caller,

    async close() {
      await mcpSession.close();
    },
  };
}