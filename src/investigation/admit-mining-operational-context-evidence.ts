import {
  sectorsMiningCompanyDetailSchema,
} from "../data/schemas/sectors-mining-company-detail";

import {
  normalizeMiningOperationalContext,
} from "../data/normalization/normalized-operational-context";

import type {
  RXNormalizedOperationalContext,
  RXOperationalFact,
} from "../data/normalization/normalized-operational-context";

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

export interface RXMiningOperationalContextEvidenceAdmissionInput {
  request:
    RXInvestigationDataRequest;

  companyId: string;

  sourceReference: string;

  payload: unknown;

  retrievedAt?: string;
}

export type RXMiningOperationalContextEvidenceAdmissionResult =
  | {
      status: "ADMITTED";

      collection:
        RXEvidenceCollectionResult;

      context:
        RXNormalizedOperationalContext;
    }
  | {
      status: "REJECTED";

      collection:
        RXEvidenceCollectionResult;

      context:
        RXNormalizedOperationalContext | null;
    };

interface RXNamedOperationalFact {
  name: string;

  fact:
    RXOperationalFact<unknown>;
}

function describeValue(
  value: unknown
): string {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  if (
    typeof value === "object"
  ) {
    return JSON.stringify(value);
  }

  return String(value);
}

function createEvidenceItems(
  context:
    RXNormalizedOperationalContext
): RXCollectedEvidenceItem[] {
  const facts:
    RXNamedOperationalFact[] = [
      {
        name:
          "name",
        fact:
          context.name,
      },
      {
        name:
          "symbol",
        fact:
          context.symbol,
      },
      {
        name:
          "companyType",
        fact:
          context.companyType,
      },
      {
        name:
          "keyOperation",
        fact:
          context.keyOperation,
      },
      {
        name:
          "activities",
        fact:
          context.activities,
      },
      {
        name:
          "commodityTypes",
        fact:
          context.commodityTypes,
      },
      {
        name:
          "operationProvince",
        fact:
          context.operationProvince,
      },
      {
        name:
          "operationDistrict",
        fact:
          context.operationDistrict,
      },
      {
        name:
          "miningSiteCount",
        fact:
          context.miningSiteCount,
      },
      {
        name:
          "miningLicenses",
        fact:
          context.miningLicenses,
      },
      {
        name:
          "miningContracts",
        fact:
          context.miningContracts,
      },
    ];

  return facts
    .filter(
      ({ fact }) =>
        fact.semantic.state ===
          "KNOWN" &&
        typeof fact.semantic.basis ===
          "string" &&
        fact.semantic.basis.trim()
          .length > 0
    )
    .map(
      ({ name, fact }) => ({
        evidenceId:
          `EVIDENCE-OPERATIONAL-${name}`,

        source:
          "SECTORS",

        sourceReference:
          fact.evidence[0]?.source ??
          context.sectorsSlug,

        truthClass:
          "SOURCE_FACT",

        description:
          `${fact.sourceField}: ${describeValue(
            fact.value
          )}`,
      })
    );
}

function finalizeCollection(
  collection:
    RXEvidenceCollectionResult,
  context:
    RXNormalizedOperationalContext | null
): RXMiningOperationalContextEvidenceAdmissionResult {
  const validation =
    validateEvidenceCollection(
      collection
    );

  if (!validation.valid) {
    return {
      status:
        "REJECTED",

      collection,

      context,
    };
  }

  if (
    collection.status !==
    "AVAILABLE" ||
    context === null
  ) {
    return {
      status:
        "REJECTED",

      collection,

      context,
    };
  }

  return {
    status:
      "ADMITTED",

    collection,

    context,
  };
}

export function admitMiningOperationalContextEvidence(
  input:
    RXMiningOperationalContextEvidenceAdmissionInput
): RXMiningOperationalContextEvidenceAdmissionResult {
  if (
    input.request.capability !==
    "MINING_OPERATIONAL_CONTEXT"
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
      null
    );
  }

  const parsed =
    sectorsMiningCompanyDetailSchema.safeParse(
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
      null
    );
  }

  const context =
    normalizeMiningOperationalContext({
      companyId:
        input.companyId,

      detail:
        parsed.data,

      source:
        input.sourceReference,

      retrievedAt:
        input.retrievedAt,
    });

  const evidence =
    createEvidenceItems(
      context
    );

  if (evidence.length === 0) {
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
      context
    );
  }

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
    context
  );
}