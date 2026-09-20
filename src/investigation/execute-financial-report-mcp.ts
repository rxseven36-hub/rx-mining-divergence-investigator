import type {
  RXSectorsMcpToolCaller,
} from "../data/sectors-mcp/sectors-mcp-company-enrichment";

import {
  bindFinancialReportMcpRequest,
} from "../data/sectors-mcp/financial-report-request";

import {
  admitCompanyFinancialEvidence,
} from "./admit-company-financial-evidence";

import {
  analyzeCompanyFinancialEvidence,
} from "./analyze-company-financial-evidence";

import type {
  RXCompanyFinancialAnalysis,
} from "./analyze-company-financial-evidence";

export interface RXFinancialMcpExecutionInput {
  companyId: string;

  symbol: string;

  sourceReference: string;

  retrievedAt?: string;
}

export type RXFinancialMcpExecutionResult =
  | {
      status:
        "BINDING_REJECTED";

      request:
        null;

      payload:
        null;

      admission:
        null;

      analysis:
        null;

      issue:
        "SYMBOL_REQUIRED";

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "EXECUTION_FAILED";

      request:
        NonNullable<
          ReturnType<
            typeof bindFinancialReportMcpRequest
          >["request"]
        >;

      payload:
        null;

      admission:
        null;

      analysis:
        null;

      issue:
        string;

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "EVIDENCE_REJECTED";

      request:
        NonNullable<
          ReturnType<
            typeof bindFinancialReportMcpRequest
          >["request"]
        >;

      payload:
        unknown;

      admission:
        ReturnType<
          typeof admitCompanyFinancialEvidence
        >;

      analysis:
        null;

      issue:
        null;

      causalConclusion:
        "UNKNOWN";
    }
  | {
      status:
        "ANALYZED";

      request:
        NonNullable<
          ReturnType<
            typeof bindFinancialReportMcpRequest
          >["request"]
        >;

      payload:
        unknown;

      admission:
        Extract<
          ReturnType<
            typeof admitCompanyFinancialEvidence
          >,
          {
            status: "ADMITTED";
          }
        >;

      analysis:
        RXCompanyFinancialAnalysis;

      issue:
        null;

      causalConclusion:
        "UNKNOWN";
    };

/**
 * Dedicated execution boundary for the
 * COMPANY_FINANCIAL_REPORT capability.
 *
 * The caller is injected deliberately:
 * - production may provide the real MCP caller;
 * - tests provide a fake caller;
 * - this runner owns no API key;
 * - this runner opens no network transport;
 * - this runner never falls through to REST.
 *
 * Execution success is not evidence admission.
 * Admission success is not causal proof.
 */
export async function executeFinancialReportMcp(
  caller:
    RXSectorsMcpToolCaller,

  input:
    RXFinancialMcpExecutionInput,
): Promise<RXFinancialMcpExecutionResult> {
  const binding =
    bindFinancialReportMcpRequest(
      input.symbol,
    );

  if (
    binding.status ===
    "REJECTED"
  ) {
    return {
      status:
        "BINDING_REJECTED",

      request:
        null,

      payload:
        null,

      admission:
        null,

      analysis:
        null,

      issue:
        "SYMBOL_REQUIRED",

      causalConclusion:
        "UNKNOWN",
    };
  }

  let payload:
    unknown;

  try {
    payload =
      await caller.callTool(
        binding.request.tool,
        binding.request.arguments,
      );
  } catch (error) {
    return {
      status:
        "EXECUTION_FAILED",

      request:
        binding.request,

      payload:
        null,

      admission:
        null,

      analysis:
        null,

      issue:
        error instanceof Error
          ? error.message
          : "MCP_FINANCIAL_EXECUTION_FAILURE",

      causalConclusion:
        "UNKNOWN",
    };
  }

  const materializedPayload =
    materializeFinancialToolResult(
      payload,
    );

  const admission =
    admitCompanyFinancialEvidence({
      companyId:
        input.companyId,

      sourceReference:
        input.sourceReference,

      payload:
        materializedPayload,

      retrievedAt:
        input.retrievedAt,
    });

  if (
    admission.status ===
    "REJECTED"
  ) {
    return {
      status:
        "EVIDENCE_REJECTED",

      request:
        binding.request,

      payload:
        materializedPayload,

      admission,

      analysis:
        null,

      issue:
        null,

      causalConclusion:
        "UNKNOWN",
    };
  }

  const analysis =
    analyzeCompanyFinancialEvidence(
      admission.admittedObservations,
    );

  return {
    status:
      "ANALYZED",

    request:
      binding.request,

    payload:
      materializedPayload,

    admission,

    analysis,

    issue:
      null,

    causalConclusion:
      "UNKNOWN",
  };
}

function parseMaybeJson(
  value:
    string,
): unknown {
  const trimmed =
    value.trim();

  if (
    !trimmed.startsWith("{") &&
    !trimmed.startsWith("[")
  ) {
    return value;
  }

  try {
    return JSON.parse(
      trimmed,
    );
  } catch {
    return value;
  }
}

/**
 * MCP SDK tool results may expose provider data through
 * structuredContent or text content.
 *
 * Keep this transport materialization deterministic.
 * It does not interpret financial meaning.
 */
function materializeFinancialToolResult(
  value:
    unknown,
): unknown {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return value;
  }

  const record =
    value as Record<
      string,
      unknown
    >;

  if (
    record.structuredContent !==
    undefined
  ) {
    return record.structuredContent;
  }

  if (
    !Array.isArray(
      record.content,
    )
  ) {
    return value;
  }

  const items =
    record.content.map(
      (item) => {
        if (
          typeof item !== "object" ||
          item === null ||
          Array.isArray(item)
        ) {
          return item;
        }

        const content =
          item as Record<
            string,
            unknown
          >;

        if (
          content.type ===
            "text" &&
          typeof content.text ===
            "string"
        ) {
          return parseMaybeJson(
            content.text,
          );
        }

        return item;
      },
    );

  return items.length === 1
    ? items[0]
    : items;
}