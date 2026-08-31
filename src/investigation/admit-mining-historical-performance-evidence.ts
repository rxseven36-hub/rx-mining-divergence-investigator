import {
  sectorsMiningPerformanceResponseSchema,
} from "../data/schemas/sectors-mining-performance";

import {
  normalizeMiningPerformanceRow,
} from "../data/normalization/normalize-mining-performance";

import type {
  RXNormalizedObservation,
} from "../data/normalization/normalized-observation";

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

export interface RXMiningHistoricalPerformanceEvidenceAdmissionInput {
  request:
    RXInvestigationDataRequest;

  companyId: string;

  sourceReference: string;

  payload: unknown;

  retrievedAt?: string;
}

export type RXMiningHistoricalPerformanceEvidenceAdmissionResult =
  | {
      status: "ADMITTED";

      collection:
        RXEvidenceCollectionResult;

      /**
       * All normalized observations produced from the
       * validated Sectors payload.
       *
       * This collection may contain observations that
       * were not admitted as evidence.
       */
      observations:
        RXNormalizedObservation[];

      /**
       * Exact normalized subset accepted by this
       * admission boundary.
       *
       * Downstream deterministic intelligence must use
       * this subset rather than the broader normalized
       * observation collection.
       */
      admittedObservations:
        RXNormalizedObservation[];
    }
  | {
      status: "REJECTED";

      collection:
        RXEvidenceCollectionResult;

      /**
       * Normalized observations may remain available for
       * audit/debug purposes even when admission fails.
       */
      observations:
        RXNormalizedObservation[];

      /**
       * Rejected admission never grants observations
       * permission to enter downstream intelligence.
       */
      admittedObservations:
        [];
    };

function createEvidenceItems(
  observations:
    RXNormalizedObservation[]
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
        observation.semanticDescription,
        observation.value === null
          ? "value unavailable"
          : `value ${observation.value}`,
      ].join(": "),
    })
  );
}

function finalizeCollection(
  collection:
    RXEvidenceCollectionResult,
  observations:
    RXNormalizedObservation[],
  admittedObservations:
    RXNormalizedObservation[]
): RXMiningHistoricalPerformanceEvidenceAdmissionResult {
  const validation =
    validateEvidenceCollection(
      collection
    );

  if (
    !validation.valid ||
    collection.status !== "AVAILABLE"
  ) {
    return {
      status: "REJECTED",
      collection,
      observations,
      admittedObservations: [],
    };
  }

  return {
    status: "ADMITTED",
    collection,
    observations,
    admittedObservations,
  };
}

export function admitMiningHistoricalPerformanceEvidence(
  input:
    RXMiningHistoricalPerformanceEvidenceAdmissionInput
): RXMiningHistoricalPerformanceEvidenceAdmissionResult {
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
      []
    );
  }

  const parsed =
    sectorsMiningPerformanceResponseSchema.safeParse(
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
      [],
      []
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
      []
    );
  }

  const observations =
    rows.flatMap(
      (row) =>
        normalizeMiningPerformanceRow({
          companyId:
            input.companyId,

          row,

          source:
            input.sourceReference,

          retrievedAt:
            input.retrievedAt,
        })
    );

  const admissibleObservations =
    observations.filter(
      (observation) =>
        (
          observation.metric ===
            "PRODUCTION" ||
          observation.metric ===
            "SALES"
        ) &&
        observation.semantic.state ===
          "KNOWN" &&
        observation.value !== null
    );

  if (
    admissibleObservations.length === 0
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
      []
    );
  }

  const evidence =
    createEvidenceItems(
      admissibleObservations
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
    admissibleObservations
  );
}
