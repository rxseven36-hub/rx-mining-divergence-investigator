import {
  SectorsCreditBudget,
} from "../src/data/sectors/credit-budget";

import {
  InMemorySectorsRequestLedger,
} from "../src/data/sectors/request-ledger";

import {
  SectorsHttpClient,
} from "../src/data/sectors/sectors-http-client";

import {
  RestSectorsAdapter,
} from "../src/data/sectors/sectors-adapter";

import {
  executeSectorsOperation,
} from "../src/data/sectors/execute-sectors-operation";

import {
  evaluateLiveReconGuard,
} from "../src/data/sectors/live-recon-guard";

import type {
  RXSectorsTypedOperationRequest,
} from "../src/data/sectors/sectors-operation-request";

const AUTHORITATIVE_SECTORS_SLUG =
  "pt-adaro-andalan-indonesia-tbk";

const MAX_ESTIMATED_CREDITS = 1;

const PURPOSE =
  "Verify the RX controlled live Sectors operational-context execution pipeline for PT Adaro Andalan Indonesia Tbk.";

function printSafeJson(
  label: string,
  value: unknown
): void {
  console.log(label);

  console.log(
    JSON.stringify(
      value,
      null,
      2
    )
  );
}

async function main(): Promise<void> {
  console.log("");

  console.log(
    "============================================"
  );

  console.log(
    " RX FIRST ENGINE START - B2B4-B"
  );

  console.log(
    "============================================"
  );

  const apiKey =
    process.env.SECTORS_API_KEY?.trim() ??
    "";

  console.log(
    `API key       : ${
      apiKey
        ? "PRESENT (hidden)"
        : "MISSING"
    }`
  );

  console.log(
    `Sectors slug  : ${AUTHORITATIVE_SECTORS_SLUG}`
  );

  console.log(
    `Local budget  : ${MAX_ESTIMATED_CREDITS}`
  );

  console.log(
    "Auto retry    : DISABLED"
  );

  console.log(
    "AI calls      : DISABLED"
  );

  const operationRequest:
    RXSectorsTypedOperationRequest = {
      operation:
        "GET_MINING_OPERATIONAL_CONTEXT",

      purpose: PURPOSE,

      params: {
        sectorsSlug:
          AUTHORITATIVE_SECTORS_SLUG,
      },
    };

  const guard =
    evaluateLiveReconGuard({
      operationRequest,

      authorizedOperation:
        "GET_MINING_OPERATIONAL_CONTEXT",

      apiKeyPresent:
        apiKey.length > 0,

      liveExecutionConfirmed:
        process.env.RX_LIVE_RECON ===
        "FIRE-RX",

      maxCredits:
        MAX_ESTIMATED_CREDITS,
    });

  console.log("");

  printSafeJson(
    "LIVE RECON GUARD:",
    guard
  );

  if (guard.status !== "READY") {
    console.log("");

    console.log(
      "BLOCKED: No Sectors API request was made."
    );

    process.exitCode = 1;
    return;
  }

  const creditBudget =
    new SectorsCreditBudget(
      MAX_ESTIMATED_CREDITS
    );

  const ledger =
    new InMemorySectorsRequestLedger();

  const client =
    new SectorsHttpClient({
      apiKey,
      creditBudget,
      ledger,
    });

  const adapter =
    new RestSectorsAdapter(
      client
    );

  console.log("");

  console.log(
    "FIRING RX CONTROLLED REQUEST #1..."
  );

  const result =
    await executeSectorsOperation<unknown>(
      adapter,
      operationRequest
    );

  console.log("");

  console.log(
    "============================================"
  );

  console.log(
    " EXECUTION RESULT"
  );

  console.log(
    "============================================"
  );

  console.log(
    `Status         : ${result.status}`
  );

  if (
    result.status ===
    "EXECUTED"
  ) {
    console.log(
      "Payload        : RECEIVED"
    );

    console.log(
      "Payload output : SUPPRESSED"
    );
  } else if (
    result.status ===
    "REJECTED"
  ) {
    printSafeJson(
      "Compile issues:",
      result.issues
    );
  } else {
    console.log(
      "Failure        : Adapter/client execution failed"
    );

    console.log(
      "Failure detail : SUPPRESSED FOR LIVE RECON SAFETY"
    );
  }

  console.log("");

  printSafeJson(
    "LOCAL CREDIT BUDGET:",
    creditBudget.snapshot()
  );

  console.log("");

  printSafeJson(
    "REQUEST LEDGER:",
    ledger.snapshot()
  );

  console.log("");

  console.log(
    "============================================"
  );

  console.log(
    " FIRST ENGINE START COMPLETE"
  );

  console.log(
    "============================================"
  );

  console.log(
    "Do not run this live command a second time."
  );

  if (
    result.status !==
    "EXECUTED"
  ) {
    process.exitCode = 1;
  }
}

main().catch(() => {
  console.error(
    "UNEXPECTED FAILURE: details suppressed."
  );

  process.exitCode = 1;
});