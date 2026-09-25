import {
  sectorsMiningSalesDestinationResponseSchema,
} from "../data/schemas/sectors-mining-sales-destination";

import {
  normalizeMiningSalesDestination,
} from "../data/normalization/normalize-mining-sales-destination";

import type {
  RXNormalizedMiningSalesDestinationObservation,
} from "../data/normalization/normalize-mining-sales-destination";

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

export interface RXMiningSalesDestinationEvidenceAdmissionInput {
  request:
    RXInvestigationDataRequest;

  companyId:
    string;

  requestedYear:
    number;

  sourceReference:
    string;

  payload:
    unknown;

  retrievedAt?:
    string;
}

export type RXMiningSalesDestinationEvidenceAdmissionResult =
  | {
      status:
        "ADMITTED";

      collection:
        RXEvidenceCollectionResult;

      observations:
        RXNormalizedMiningSalesDestinationObservation[];

      admittedObservations:
        RXNormalizedMiningSalesDestinationObservation[];
    }
  | {
      status:
        "REJECTED";

      collection:
        RXEvidenceCollectionResult;

      observations:
        RXNormalizedMiningSalesDestinationObservation[];

      admittedObservations:
        [];
    };

function describeObservation(
  observation:
    RXNormalizedMiningSalesDestinationObservation
): string {
  const facts: string[] = [
    observation.semantic.description,
    `destination ${observation.destinationLabel}`,
    `year ${observation.year}`,
  ];

  if (observation.revenueUsd !== null) {
    facts.push(
      `revenue USD ${observation.revenueUsd}`
    );
  }

  if (
    observation.percentageOfTotalRevenue !==
    null
  ) {
    facts.push(
      `revenue share ${observation.percentageOfTotalRevenue}%`
    );
  }

  if (observation.volume !== null) {
    facts.push(
      observation.unit === null
        ? `volume ${observation.volume}`
        : `volume ${observation.volume} ${observation.unit}`
    );
  }

  if (
    observation.percentageOfSalesVolume !==
    null
  ) {
    facts.push(
      `sales volume share ${observation.percentageOfSalesVolume}%`
    );
  }

  if (observation.commodityType !== null) {
    facts.push(
      `commodity ${observation.commodityType}`
    );
  }

  return facts.join(": ");
}

function createEvidenceItems(
  observations:
    RXNormalizedMiningSalesDestinationObservation[],

  sourceReference:
    string
): RXCollectedEvidenceItem[] {
  return observations.map(
    (observation) => ({
      evidenceId:
        `EVIDENCE-${observation.id}`,

      source:
        "SECTORS",

      sourceReference,

      truthClass:
        "SOURCE_FACT",

      description:
        describeObservation(
          observation
        ),
    })
  );
}

function finalizeCollection(
  collection:
    RXEvidenceCollectionResult,

  observations:
    RXNormalizedMiningSalesDestinationObservation[],

  admittedObservations:
    RXNormalizedMiningSalesDestinationObservation[]
): RXMiningSalesDestinationEvidenceAdmissionResult {
  const validation =
    validateEvidenceCollection(
      collection
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
 * Dedicated Sales Destination evidence boundary.
 *
 * Provider destination labels are preserved verbatim.
 * They are not assumed to be ISO countries.
 *
 * Missing revenue, volume, percentages, commodity,
 * and units remain missing.
 *
 * No missing provider value is derived.
 * No concentration score is calculated.
 * No causal conclusion is manufactured.
 */
export function admitMiningSalesDestinationEvidence(
  input:
    RXMiningSalesDestinationEvidenceAdmissionInput
): RXMiningSalesDestinationEvidenceAdmissionResult {
  if (
    input.request.capability !==
      "MINING_SALES_DESTINATION"
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
    sectorsMiningSalesDestinationResponseSchema.safeParse(
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

  if (
    parsed.data.year !==
      input.requestedYear
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

  if (
    Object.keys(parsed.data.data).length ===
    0
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
      [],
      []
    );
  }

  const observations =
    normalizeMiningSalesDestination(
      input.companyId,
      parsed.data
    );

  if (observations.length === 0) {
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
      observations,
      []
    );
  }

  const evidence =
    createEvidenceItems(
      observations,
      input.sourceReference
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
    observations
  );
}