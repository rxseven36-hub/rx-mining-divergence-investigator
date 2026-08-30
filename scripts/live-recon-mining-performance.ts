import {
  existsSync,
} from "node:fs";

import {
  mkdir,
  writeFile,
} from "node:fs/promises";

import {
  join,
} from "node:path";

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

import {
  sectorsMiningPerformanceResponseSchema,
} from "../src/data/schemas/sectors-mining-performance";

import type {
  RXSectorsTypedOperationRequest,
} from "../src/data/sectors/sectors-operation-request";

const AUTHORITATIVE_SECTORS_SLUG =
  "pt-adaro-andalan-indonesia-tbk";

const TARGET_YEAR = 2024;

const MAX_ESTIMATED_CREDITS = 1;

const PURPOSE =
  "Capture one controlled Sectors mining performance response for PT Adaro Andalan Indonesia Tbk in 2024 to validate the live RX data contract.";

const EVIDENCE_DIRECTORY =
  join(
    process.cwd(),
    "tmp",
    "live-recon"
  );

const ATTEMPT_MARKER_PATH =
  join(
    EVIDENCE_DIRECTORY,
    "aadi-mining-performance-2024.attempt.json"
  );

const RAW_EVIDENCE_PATH =
  join(
    EVIDENCE_DIRECTORY,
    "aadi-mining-performance-2024.raw.json"
  );

const VALIDATION_EVIDENCE_PATH =
  join(
    EVIDENCE_DIRECTORY,
    "aadi-mining-performance-2024.validation.json"
  );

const MANIFEST_PATH =
  join(
    EVIDENCE_DIRECTORY,
    "aadi-mining-performance-2024.manifest.json"
  );

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

async function writeJsonEvidence(
  path: string,
  value: unknown
): Promise<void> {
  await writeFile(
    path,
    `${JSON.stringify(
      value,
      null,
      2
    )}\n`,
    {
      encoding: "utf8",
    }
  );
}

async function main(): Promise<void> {
  console.log("");

  console.log(
    "============================================"
  );

  console.log(
    " RX LIVE PERFORMANCE EVIDENCE - B2B4-D"
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
    `Target year   : ${TARGET_YEAR}`
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

  console.log(
    "Attempt fuse  : ENABLED"
  );

  console.log(
    "Raw output    : Git-ignored local evidence"
  );

  /**
   * Permanent local one-shot fuse for this exact
   * reconnaissance target.
   *
   * ATTEMPT marker is more conservative than checking
   * only for a successful raw response.
   *
   * Once a network attempt has been authorized and the
   * marker has been written, this runner refuses to
   * attempt the same reconnaissance again.
   */
  if (
    existsSync(
      ATTEMPT_MARKER_PATH
    )
  ) {
    console.log("");

    console.log(
      "BLOCKED: A live attempt marker already exists."
    );

    console.log(
      "No Sectors API request was made."
    );

    console.log(
      `Attempt marker: ${ATTEMPT_MARKER_PATH}`
    );

    process.exitCode = 1;
    return;
  }

  /**
   * Raw evidence is checked independently.
   *
   * This also protects evidence captured by an older
   * version of the runner that did not yet use an
   * attempt marker.
   */
  if (
    existsSync(
      RAW_EVIDENCE_PATH
    )
  ) {
    console.log("");

    console.log(
      "BLOCKED: Raw evidence already exists."
    );

    console.log(
      "No Sectors API request was made."
    );

    console.log(
      `Evidence path : ${RAW_EVIDENCE_PATH}`
    );

    process.exitCode = 1;
    return;
  }

  const operationRequest:
    RXSectorsTypedOperationRequest = {
      operation:
        "GET_MINING_HISTORICAL_PERFORMANCE",

      purpose: PURPOSE,

      params: {
        sectorsSlug:
          AUTHORITATIVE_SECTORS_SLUG,

        period: {
          kind: "YEAR",
          year: TARGET_YEAR,
        },
      },
    };

  const liveExecutionConfirmed =
    process.env.RX_LIVE_RECON ===
    "FIRE-RX";

  const guard =
    evaluateLiveReconGuard({
      operationRequest,

      authorizedOperation:
        "GET_MINING_HISTORICAL_PERFORMANCE",

      apiKeyPresent:
        apiKey.length > 0,

      liveExecutionConfirmed,

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

  /**
   * IMPORTANT ORDER:
   *
   * Guard READY
   *   -> create evidence directory
   *   -> persist ATTEMPT marker
   *   -> only then construct/fire the network request.
   *
   * Therefore a crash after this point cannot silently
   * permit a second attempt.
   */
  await mkdir(
    EVIDENCE_DIRECTORY,
    {
      recursive: true,
    }
  );

  await writeJsonEvidence(
    ATTEMPT_MARKER_PATH,
    {
      evidenceType:
        "SECTORS_MINING_PERFORMANCE_LIVE_RECON_ATTEMPT",

      sectorsSlug:
        AUTHORITATIVE_SECTORS_SLUG,

      requestedYear:
        TARGET_YEAR,

      operation:
        operationRequest.operation,

      estimatedCredits:
        guard.estimatedCredits,

      liveExecutionConfirmed:
        true,

      apiKeyStored:
        false,

      authorizationHeaderStored:
        false,

      retryEnabled:
        false,

      aiUsed:
        false,

      /**
       * Intentionally no claim that Sectors received
       * or billed the request.
       *
       * This marker means only:
       * RX authorized a network attempt.
       */
      meaning:
        "RX authorized one live network attempt. This does not prove server receipt, HTTP success, or billing.",
    }
  );

  console.log("");

  console.log(
    "Attempt marker : WRITTEN"
  );

  console.log(
    "One-shot fuse  : ARMED"
  );

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
    "FIRING RX CONTROLLED PERFORMANCE REQUEST #1..."
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
    result.status !==
    "EXECUTED"
  ) {
    if (
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
      "Attempt marker remains in place."
    );

    console.log(
      "DO NOT retry this reconnaissance automatically."
    );

    process.exitCode = 1;
    return;
  }

  /**
   * Preserve exact JSON response BEFORE interpreting
   * it with the provisional RX schema.
   *
   * If validation fails, the real payload still exists
   * locally for contract reconciliation without another
   * Sectors request.
   *
   * Headers and API credentials are never persisted.
   */
  await writeJsonEvidence(
    RAW_EVIDENCE_PATH,
    result.data
  );

  console.log(
    "Payload        : RECEIVED"
  );

  console.log(
    "Raw evidence   : SAVED"
  );

  const validation =
    sectorsMiningPerformanceResponseSchema
      .safeParse(
        result.data
      );

  if (validation.success) {
    await writeJsonEvidence(
      VALIDATION_EVIDENCE_PATH,
      {
        status:
          "VALID",

        schema:
          "sectorsMiningPerformanceResponseSchema",

        sectorsSlug:
          AUTHORITATIVE_SECTORS_SLUG,

        requestedYear:
          TARGET_YEAR,
      }
    );

    console.log(
      "Schema         : VALID"
    );
  } else {
    await writeJsonEvidence(
      VALIDATION_EVIDENCE_PATH,
      {
        status:
          "INVALID",

        schema:
          "sectorsMiningPerformanceResponseSchema",

        sectorsSlug:
          AUTHORITATIVE_SECTORS_SLUG,

        requestedYear:
          TARGET_YEAR,

        issues:
          validation.error.issues,
      }
    );

    console.log(
      "Schema         : INVALID"
    );

    console.log(
      "Schema issues  : SAVED LOCALLY"
    );
  }

  await writeJsonEvidence(
    MANIFEST_PATH,
    {
      evidenceType:
        "SECTORS_MINING_PERFORMANCE_LIVE_RECON",

      sectorsSlug:
        AUTHORITATIVE_SECTORS_SLUG,

      requestedYear:
        TARGET_YEAR,

      executionStatus:
        result.status,

      estimatedCredits:
        guard.estimatedCredits,

      apiKeyStored:
        false,

      authorizationHeaderStored:
        false,

      retryEnabled:
        false,

      aiUsed:
        false,

      rawEvidenceStored:
        true,

      schemaValidation:
        validation.success
          ? "VALID"
          : "INVALID",
    }
  );

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
    "Evidence directory:"
  );

  console.log(
    EVIDENCE_DIRECTORY
  );

  console.log("");

  console.log(
    "============================================"
  );

  console.log(
    " PERFORMANCE EVIDENCE CAPTURE COMPLETE"
  );

  console.log(
    "============================================"
  );

  console.log(
    "One-shot fuse remains armed."
  );

  console.log(
    "Do not run this live command a second time."
  );

  if (!validation.success) {
    /**
     * HTTP execution succeeded and raw evidence was
     * preserved. Only contract reconciliation remains.
     */
    process.exitCode = 1;
  }
}

main().catch(() => {
  console.error(
    "UNEXPECTED FAILURE: details suppressed."
  );

  console.error(
    "If FIRE-RX was used, assume an attempt MAY have occurred."
  );

  console.error(
    "Do not retry until the local attempt marker and request evidence are inspected."
  );

  process.exitCode = 1;
});