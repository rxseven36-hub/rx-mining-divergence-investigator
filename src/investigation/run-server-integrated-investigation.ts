import {
  createInvestigationServerRuntime,
} from "./create-investigation-server-runtime";

import type {
  RXInvestigationServerRuntime,
} from "./create-investigation-server-runtime";

import {
  runIntegratedInvestigation,
} from "./run-integrated-investigation";

import type {
  RXIntegratedInvestigationRunInput,
  RXIntegratedInvestigationRunResult,
} from "./run-integrated-investigation";

export interface RXServerIntegratedInvestigationInput
  extends RXIntegratedInvestigationRunInput {
  sectorsApiKey:
    string;

  mcpEndpoint?:
    string;

  restEstimatedCreditBudget?:
    number;
}

export interface RXServerIntegratedInvestigationDependencies {
  createRuntime(
    input: {
      sectorsApiKey:
        string;

      mcpEndpoint?:
        string;

      restEstimatedCreditBudget?:
        number;
    },
  ): Promise<RXInvestigationServerRuntime>;

  runApplication(
    adapter:
      RXInvestigationServerRuntime[
        "adapter"
      ],

    mcpCaller:
      RXInvestigationServerRuntime[
        "mcpCaller"
      ],

    input:
      RXIntegratedInvestigationRunInput,
  ): Promise<RXIntegratedInvestigationRunResult>;
}

function defaultDependencies():
  RXServerIntegratedInvestigationDependencies {
  return {
    createRuntime:
      createInvestigationServerRuntime,

    runApplication:
      runIntegratedInvestigation,
  };
}

/**
 * Owns the lifecycle around one integrated server investigation.
 *
 * Runtime resources are always closed after application execution,
 * including when deterministic execution throws.
 *
 * No AI synthesis occurs here.
 */
export async function runServerIntegratedInvestigation(
  input:
    RXServerIntegratedInvestigationInput,

  dependencies:
    RXServerIntegratedInvestigationDependencies =
      defaultDependencies(),
): Promise<RXIntegratedInvestigationRunResult> {
  const runtime =
    await dependencies.createRuntime({
      sectorsApiKey:
        input.sectorsApiKey,

      mcpEndpoint:
        input.mcpEndpoint,

      restEstimatedCreditBudget:
        input.restEstimatedCreditBudget,
    });

  try {
    return await dependencies.runApplication(
      runtime.adapter,
      runtime.mcpCaller,
      {
        investigationCase:
          input.investigationCase,

        operationContext:
          input.operationContext,

        retrievedAt:
          input.retrievedAt,
      },
    );
  } finally {
    await runtime.close();
  }
}