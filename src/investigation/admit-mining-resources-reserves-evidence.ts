import {
  sectorsMiningPerformanceResponseSchema,
} from "../data/schemas/sectors-mining-performance";

import {
  normalizeMiningResourcesReserves,
} from "../data/normalization/normalize-mining-resources-reserves";

import type {
  RXNormalizedGeologicalObservation,
} from "../data/normalization/normalize-mining-resources-reserves";

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

export interface RXMiningResourcesReservesEvidenceAdmissionInput {
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

export type RXMiningResourcesReservesEvidenceAdmissionResult =
  | {
      status:
        "ADMITTED";

      collection:
        RXEvidenceCollectionResult;

      observations:
        RXNormalizedGeologicalObservation[];

      admittedObservations:
        RXNormalizedGeologicalObservation[];
    }
  | {
      status:
        "REJECTED";

      collection:
        RXEvidenceCollectionResult;

      observations:
        RXNormalizedGeologicalObservation[];

      admittedObservations:
        [];
    };

function createEvidenceItems(
  observations:
    RXNormalizedGeologicalObservation[],
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
        `value ${observation.value} ${observation.unit.symbol}`,
        observation.measurementYear === null
          ? "geological measurement year unavailable"
          : `geological measurement year ${observation.measurementYear}`,
      ].join(": "),
    }),
  );
}

function finalizeCollection(
  collection:
    RXEvidenceCollectionResult,

  observations:
    RXNormalizedGeologicalObservation[],

  admittedObservations:
    RXNormalizedGeologicalObservation[],
): RXMiningResourcesReservesEvidenceAdmissionResult {
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
 * Dedicated geological evidence admission boundary.
 *
 * IMPORTANT:
 * - Reuses MINING_HISTORICAL_PERFORMANCE only as the
 *   verified Sectors transport capability.
 * - Geological semantics are NOT inherited from
 *   production/sales performance semantics.
 * - Only dedicated normalized resource/reserve
 *   observations can cross this boundary.
 * - Missing geological measurement year is not replaced
 *   with row.year.
 * - null is not zero.
 * - No totals/components are derived.
 * - No causal conclusion is created here.
 */
export function admitMiningResourcesReservesEvidence(
  input:
    RXMiningResourcesReservesEvidenceAdmissionInput,
): RXMiningResourcesReservesEvidenceAdmissionResult {
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
        normalizeMiningResourcesReserves({
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