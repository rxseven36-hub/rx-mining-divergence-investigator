import {
  sectorsCommodityPriceResponseSchema,
} from "../data/schemas/sectors-commodity-price";

import {
  normalizeCommodityPrice,
} from "../data/normalization/normalize-commodity-price";

import type {
  RXNormalizedCommodityPriceObservation,
} from "../data/normalization/normalized-commodity-price";

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

export interface RXCommodityPriceEvidenceAdmissionInput {
  request:
    RXInvestigationDataRequest;

  requestedCommodity: string;

  requestedPeriod:
    RXTimePeriod;

  sourceReference: string;

  payload: unknown;

  retrievedAt?: string;
}

export type RXCommodityPriceEvidenceAdmissionResult =
  | {
      status: "ADMITTED";

      collection:
        RXEvidenceCollectionResult;

      observations:
        RXNormalizedCommodityPriceObservation[];
    }
  | {
      status: "REJECTED";

      collection:
        RXEvidenceCollectionResult;

      observations:
        RXNormalizedCommodityPriceObservation[];
    };

function finalizeCollection(
  collection:
    RXEvidenceCollectionResult,
  observations:
    RXNormalizedCommodityPriceObservation[]
): RXCommodityPriceEvidenceAdmissionResult {
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

function dateBelongsToPeriod(
  date:
    string,
  period:
    RXTimePeriod
): boolean {
  const year =
    Number(
      date.slice(0, 4)
    );

  if (
    !Number.isInteger(year)
  ) {
    return false;
  }

  if (
    period.kind ===
      "YEAR" &&
    Number.isInteger(
      period.year
    )
  ) {
    return (
      year ===
      period.year
    );
  }

  if (
    period.kind ===
      "RANGE" &&
    period.start &&
    period.end
  ) {
    const startYear =
      Number(
        period.start.slice(
          0,
          4
        )
      );

    const endYear =
      Number(
        period.end.slice(
          0,
          4
        )
      );

    return (
      Number.isInteger(
        startYear
      ) &&
      Number.isInteger(
        endYear
      ) &&
      year >= startYear &&
      year <= endYear
    );
  }

  return false;
}

function createEvidenceItems(
  observations:
    RXNormalizedCommodityPriceObservation[]
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

          `${observation.commodity}`,

          `${observation.period.start}`,

          `value ${observation.value}`,

          observation.unit.symbol,
        ].join(": "),
    })
  );
}

export function admitCommodityPriceEvidence(
  input:
    RXCommodityPriceEvidenceAdmissionInput
): RXCommodityPriceEvidenceAdmissionResult {
  if (
    input.request.capability !==
    "COMMODITY_PRICE_HISTORY"
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
    sectorsCommodityPriceResponseSchema.safeParse(
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
      (item) => {
        const normalized =
          normalizeCommodityPrice(
            item,
            {
              sourceReference:
                input.sourceReference,

              retrievedAt:
                input.retrievedAt,
            }
          );

        return normalized
          ? [normalized]
          : [];
      }
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
        observation.commodity ===
          input.requestedCommodity &&
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