import {
  sectorsMarketTransactionResponseSchema,
} from "../data/schemas/sectors-market-transaction";

import {
  normalizeMarketTransaction,
} from "../data/normalization/normalize-market-transaction";

import type {
  RXNormalizedMarketTransactionObservation,
} from "../data/normalization/normalized-market-transaction";

import type {
  RXTimePeriod,
} from "../types/time";

import type {
  RXInvestigationDataRequest,
} from "./investigation-plan";

import type {
  RXCollectedEvidenceItem,
  RXEvidenceCollectionResult,
} from "./evidence-collection";

import {
  createEvidenceCollectionResult,
} from "./create-evidence-collection-result";

import {
  validateEvidenceCollection,
} from "./validate-evidence-collection";

export interface RXMarketTransactionEvidenceAdmissionInput {
  request:
    RXInvestigationDataRequest;

  requestedTicker:
    string;

  requestedPeriod:
    RXTimePeriod;

  sourceReference:
    string;

  payload:
    unknown;

  retrievedAt?:
    string;
}

export type RXMarketTransactionEvidenceAdmissionResult =
  | {
      status:
        "ADMITTED";

      collection:
        RXEvidenceCollectionResult;

      observations:
        RXNormalizedMarketTransactionObservation[];
    }
  | {
      status:
        "REJECTED";

      collection:
        RXEvidenceCollectionResult;

      observations:
        RXNormalizedMarketTransactionObservation[];
    };

function finalizeCollection(
  collection:
    RXEvidenceCollectionResult,
  observations:
    RXNormalizedMarketTransactionObservation[]
): RXMarketTransactionEvidenceAdmissionResult {
  const validation =
    validateEvidenceCollection(
      collection
    );

  if (!validation.valid) {
    return {
      status:
        "REJECTED",

      collection,

      observations,
    };
  }

  return {
    status:
      collection.status ===
      "AVAILABLE"
        ? "ADMITTED"
        : "REJECTED",

    collection,

    observations,
  };
}

/**
 * Canonicalize an IDX symbol only for relationship comparison.
 *
 * The original source symbol remains untouched in normalized
 * observations for auditability.
 *
 * Sectors Daily Transaction Data accepts IDX symbols with or
 * without the .JK suffix and is case-insensitive.
 */
function canonicalizeIdxSymbol(
  symbol:
    string
): string {
  const normalized =
    symbol
      .trim()
      .toUpperCase();

  return normalized.endsWith(
    ".JK"
  )
    ? normalized.slice(
        0,
        -3
      )
    : normalized;
}

function symbolsMatch(
  requestedTicker:
    string,
  sourceSymbol:
    string
): boolean {
  const requested =
    canonicalizeIdxSymbol(
      requestedTicker
    );

  const source =
    canonicalizeIdxSymbol(
      sourceSymbol
    );

  return (
    requested.length > 0 &&
    source.length > 0 &&
    requested === source
  );
}

function dateBelongsToPeriod(
  date:
    string,
  period:
    RXTimePeriod
): boolean {
  if (
    period.kind ===
      "DATE" &&
    period.start
  ) {
    return (
      date ===
      period.start
    );
  }

  if (
    period.kind ===
      "RANGE" &&
    period.start &&
    period.end
  ) {
    return (
      date >= period.start &&
      date <= period.end
    );
  }

  return false;
}

function createEvidenceItems(
  observations:
    RXNormalizedMarketTransactionObservation[]
): RXCollectedEvidenceItem[] {
  return observations.map(
    (observation) => ({
      evidenceId:
        `EVIDENCE-${observation.id}`,

      source:
        "SECTORS",

      sourceReference:
        observation.evidence[0]
          ?.source ??
        observation.id,

      truthClass:
        "SOURCE_FACT",

      description:
        [
          observation
            .semanticDescription,

          observation.symbol,

          observation.period.start,

          `value ${observation.value}`,

          observation.unit.symbol,
        ].join(": "),
    })
  );
}

export function admitMarketTransactionEvidence(
  input:
    RXMarketTransactionEvidenceAdmissionInput
): RXMarketTransactionEvidenceAdmissionResult {
  if (
    input.request.capability !==
    "COMPANY_MARKET_TRANSACTION_HISTORY"
  ) {
    const collection =
      createEvidenceCollectionResult({
        request:
          input.request,

        status:
          "NOT_COMPARABLE",

        issues: [
          "RELATIONSHIP_INVALID",
        ],
      });

    return finalizeCollection(
      collection,
      []
    );
  }

  const parsed =
    sectorsMarketTransactionResponseSchema.safeParse(
      input.payload
    );

  if (!parsed.success) {
    const collection =
      createEvidenceCollectionResult({
        request:
          input.request,

        status:
          "INVALID",

        issues: [
          "INVALID_RESPONSE",
        ],
      });

    return finalizeCollection(
      collection,
      []
    );
  }

  if (
    parsed.data.length === 0
  ) {
    const collection =
      createEvidenceCollectionResult({
        request:
          input.request,

        status:
          "UNAVAILABLE",

        issues: [
          "NO_DATA",
        ],
      });

    return finalizeCollection(
      collection,
      []
    );
  }

  const observations =
    parsed.data.flatMap(
      (item) =>
        normalizeMarketTransaction(
          item,
          {
            sourceReference:
              input.sourceReference,

            retrievedAt:
              input.retrievedAt,
          }
        )
    );

  if (
    observations.length === 0
  ) {
    const collection =
      createEvidenceCollectionResult({
        request:
          input.request,

        status:
          "NOT_COMPARABLE",

        issues: [
          "SEMANTICS_UNKNOWN",
        ],
      });

    return finalizeCollection(
      collection,
      []
    );
  }

  const alignedObservations =
    observations.filter(
      (observation) =>
        symbolsMatch(
          input.requestedTicker,
          observation.symbol
        ) &&
        observation.semantic.state ===
          "KNOWN" &&
        dateBelongsToPeriod(
          observation.period.start ??
            "",
          input.requestedPeriod
        )
    );

  if (
    alignedObservations.length !==
    observations.length
  ) {
    const collection =
      createEvidenceCollectionResult({
        request:
          input.request,

        status:
          "NOT_COMPARABLE",

        issues: [
          "RELATIONSHIP_INVALID",
        ],
      });

    return finalizeCollection(
      collection,
      observations
    );
  }

  const evidence =
    createEvidenceItems(
      alignedObservations
    );

  const collection =
    createEvidenceCollectionResult({
      request:
        input.request,

      status:
        "AVAILABLE",

      evidence,
    });

  return finalizeCollection(
    collection,
    observations
  );
}