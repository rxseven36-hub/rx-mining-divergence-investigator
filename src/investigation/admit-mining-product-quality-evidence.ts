import {
  sectorsMiningPerformanceResponseSchema,
} from "../data/schemas/sectors-mining-performance";

import {
  normalizeMiningProductQuality,
} from "../data/normalization/normalize-mining-product-quality";

import type {
  RXNormalizedProductQualityObservation,
} from "../data/normalization/normalize-mining-product-quality";

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

export interface RXMiningProductQualityEvidenceAdmissionInput {
  request:
    RXInvestigationDataRequest;

  companyId:
    string;

  sourceReference:
    string;

  payload:
    unknown;

  retrievedAt?:
    string;
}

export type RXMiningProductQualityEvidenceAdmissionResult =
  | {
      status:
        "ADMITTED";

      collection:
        RXEvidenceCollectionResult;

      observations:
        RXNormalizedProductQualityObservation[];

      admittedObservations:
        RXNormalizedProductQualityObservation[];
    }
  | {
      status:
        "REJECTED";

      collection:
        RXEvidenceCollectionResult;

      observations:
        RXNormalizedProductQualityObservation[];

      admittedObservations:
        [];
    };

function formatRange(
  observation:
    RXNormalizedProductQualityObservation,
): string {
  if (
    observation.min !== null &&
    observation.max !== null
  ) {
    if (
      observation.min ===
      observation.max
    ) {
      return `${observation.min} ${observation.unit.symbol}`;
    }

    return `${observation.min}-${observation.max} ${observation.unit.symbol}`;
  }

  if (
    observation.min !== null
  ) {
    return `minimum ${observation.min} ${observation.unit.symbol}`;
  }

  return `maximum ${observation.max} ${observation.unit.symbol}`;
}

function createEvidenceItems(
  observations:
    RXNormalizedProductQualityObservation[],
): RXCollectedEvidenceItem[] {
  return observations.map(
    (observation) => ({
      evidenceId:
        `EVIDENCE-${observation.id}`,

      source:
        "SECTORS",

      sourceReference:
        observation.evidence[0]?.source ??
        observation.id,

      truthClass:
        "SOURCE_FACT",

      description: [
        observation.semantic.description,
        formatRange(observation),
        observation.sourcePerformanceYear === null
          ? "performance year unavailable"
          : `performance year ${observation.sourcePerformanceYear}`,
      ].join(": "),
    }),
  );
}

function finalizeCollection(
  collection:
    RXEvidenceCollectionResult,

  observations:
    RXNormalizedProductQualityObservation[],

  admittedObservations:
    RXNormalizedProductQualityObservation[],
): RXMiningProductQualityEvidenceAdmissionResult {
  const validation =
    validateEvidenceCollection(
      collection,
    );

  if (
    !validation.valid ||
    collection.status !==
      "AVAILABLE"
  ) {
    return {
      status:
        "REJECTED",

      collection,

      observations,

      admittedObservations: [],
    };
  }

  return {
    status:
      "ADMITTED",

    collection,

    observations,

    admittedObservations,
  };
}

/**
 * Dedicated product-quality evidence admission boundary.
 *
 * IMPORTANT:
 * - Reuses MINING_HISTORICAL_PERFORMANCE only as the
 *   verified Sectors transport capability.
 * - Product-quality semantics are not inherited from
 *   production/sales observations.
 * - Only commodity_stats.products[] quality observations
 *   can cross this boundary.
 * - ARB and ADB remain distinct.
 * - Source min/max ranges remain intact.
 * - Missing/null values are never converted to zero.
 * - No midpoint, average, product score, or causal
 *   conclusion is manufactured.
 */
export function admitMiningProductQualityEvidence(
  input:
    RXMiningProductQualityEvidenceAdmissionInput,
): RXMiningProductQualityEvidenceAdmissionResult {
  if (
    input.request.capability !==
      "MINING_HISTORICAL_PERFORMANCE"
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
      [],
      [],
    );
  }

  const parsed =
    sectorsMiningPerformanceResponseSchema.safeParse(
      input.payload,
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
      [],
      [],
    );
  }

  const rows =
    parsed.data.data ?? [];

  if (rows.length === 0) {
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
      [],
      [],
    );
  }

  const observations =
    rows.flatMap(
      (row) =>
        normalizeMiningProductQuality({
          companyId:
            input.companyId,

          row,

          source:
            input.sourceReference,

          retrievedAt:
            input.retrievedAt,
        }),
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
      observations,
      [],
    );
  }

  const evidence =
    createEvidenceItems(
      observations,
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
    observations,
    observations,
  );
}