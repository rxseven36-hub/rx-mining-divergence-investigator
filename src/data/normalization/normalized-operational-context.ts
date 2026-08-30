import type {
  SectorsMiningCompanyDetail,
} from "../schemas/sectors-mining-company-detail";

import type {
  RXSourceEvidence,
} from "../../truth/evidence";

import type {
  RXSemanticKnowledge,
} from "./semantic-state";

export interface RXOperationalFact<T> {
  /**
   * Exact transport field that produced this fact.
   *
   * This is retained for auditability and MUST NOT
   * be interpreted as a causal explanation.
   */
  sourceField: string;

  /**
   * Direct normalized value.
   *
   * null remains null.
   * Missing transport data is not manufactured here.
   */
  value: T;

  semantic:
    RXSemanticKnowledge;

  evidence:
    RXSourceEvidence[];
}

export interface RXNormalizedOperationalContext {
  /**
   * RX internal identifier.
   *
   * This is deliberately separate from the Sectors slug.
   */
  companyId: string;

  /**
   * Sectors mining company identifier.
   */
  sectorsSlug: string;

  name:
    RXOperationalFact<string>;

  symbol:
    RXOperationalFact<
      string | null
    >;

  companyType:
    RXOperationalFact<string>;

  keyOperation:
    RXOperationalFact<string>;

  activities:
    RXOperationalFact<
      string[]
    >;

  commodityTypes:
    RXOperationalFact<
      string[]
    >;

  operationProvince:
    RXOperationalFact<
      string | null
    >;

  operationDistrict:
    RXOperationalFact<
      string | null
    >;

  miningSiteCount:
    RXOperationalFact<number>;

  /**
   * OpenAPI guarantees arrays of generic objects,
   * but does not define nested object requirements.
   *
   * Preserve the objects without inventing nested
   * license or contract semantics.
   */
  miningLicenses:
    RXOperationalFact<
      Record<string, unknown>[]
    >;

  miningContracts:
    RXOperationalFact<
      Record<string, unknown>[]
    >;

  /**
   * Context is company-scoped.
   *
   * There is intentionally no synthetic period here.
   */
  evidence:
    RXSourceEvidence[];
}

export interface NormalizeMiningOperationalContextInput {
  companyId: string;

  detail:
    SectorsMiningCompanyDetail;

  source: string;

  retrievedAt?: string;
}

function createSourceEvidence(
  source: string,
  retrievedAt?: string
): RXSourceEvidence {
  return {
    id:
      `sectors-operational-context:${source}`,

    provider:
      "SECTORS",

    source,

    retrievedAt,

    truthClass:
      "SOURCE_FACT",
  };
}

function knownSemantic(
  sourceField: string
): RXSemanticKnowledge {
  return {
    state:
      "KNOWN",

    basis:
      `Official Sectors MiningCompanyDetail field: ${sourceField}`,
  };
}

function createFact<T>(
  sourceField: string,
  value: T,
  evidence:
    RXSourceEvidence
): RXOperationalFact<T> {
  return {
    sourceField,

    value,

    semantic:
      knownSemantic(
        sourceField
      ),

    evidence: [
      evidence,
    ],
  };
}

export function normalizeMiningOperationalContext(
  input:
    NormalizeMiningOperationalContextInput
): RXNormalizedOperationalContext {
  const evidence =
    createSourceEvidence(
      input.source,
      input.retrievedAt
    );

  return {
    companyId:
      input.companyId,

    sectorsSlug:
      input.detail.slug,

    name:
      createFact(
        "name",
        input.detail.name,
        evidence
      ),

    symbol:
      createFact(
        "symbol",
        input.detail.symbol,
        evidence
      ),

    companyType:
      createFact(
        "company_type",
        input.detail.company_type,
        evidence
      ),

    keyOperation:
      createFact(
        "key_operation",
        input.detail.key_operation,
        evidence
      ),

    activities:
      createFact(
        "activities",
        [
          ...input.detail.activities,
        ],
        evidence
      ),

    commodityTypes:
      createFact(
        "commodity_type",
        [
          ...input.detail.commodity_type,
        ],
        evidence
      ),

    operationProvince:
      createFact(
        "operation_province",
        input.detail.operation_province,
        evidence
      ),

    operationDistrict:
      createFact(
        "operation_district",
        input.detail.operation_district,
        evidence
      ),

    miningSiteCount:
      createFact(
        "mining_site_count",
        input.detail.mining_site_count,
        evidence
      ),

    miningLicenses:
      createFact(
        "mining_license",
        input.detail.mining_license.map(
          (license) => ({
            ...license,
          })
        ),
        evidence
      ),

    miningContracts:
      createFact(
        "mining_contract",
        input.detail.mining_contract.map(
          (contract) => ({
            ...contract,
          })
        ),
        evidence
      ),

    evidence: [
      evidence,
    ],
  };
}