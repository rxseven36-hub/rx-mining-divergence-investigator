import {
  describe,
  expect,
  it,
} from "vitest";

import {
  sectorsMiningCompanyDetailSchema,
} from "../data/schemas/sectors-mining-company-detail";

import {
  normalizeMiningOperationalContext,
} from "../data/normalization/normalized-operational-context";

describe(
  "mining operational context normalization",
  () => {
    const detail =
      sectorsMiningCompanyDetailSchema.parse({
        name:
          "PT Adaro Andalan Indonesia Tbk",

        slug:
          "pt-adaro-andalan-indonesia-tbk",

        symbol:
          "AADI.JK",

        company_type:
          "Holding",

        operation_province:
          "Jakarta",

        operation_district:
          "Jakarta Selatan",

        key_operation:
          "Coal Trading",

        activities: [
          "Trading",
        ],

        commodity_type: [
          "Coal",
        ],

        mining_license: [
          {
            license_type:
              "IUPK",

            license_number:
              "11/1/IUP/PMA/2022",
          },
        ],

        mining_contract:
          [],

        mining_site_count:
          0,

        representative_address:
          "Example address",

        website:
          "www.adaroindonesia.com",

        phone_number:
          "021-25533065",

        email:
          "example@example.com",
      });

    it(
      "normalizes official company-scoped operational fields as source facts",
      () => {
        const normalized =
          normalizeMiningOperationalContext({
            companyId:
              "rx-company-aadi",

            detail,

            source:
              "/v2/mining/companies/pt-adaro-andalan-indonesia-tbk/",

            retrievedAt:
              "2026-08-30T00:00:00.000Z",
          });

        expect(
          normalized.companyId
        ).toBe(
          "rx-company-aadi"
        );

        expect(
          normalized.sectorsSlug
        ).toBe(
          "pt-adaro-andalan-indonesia-tbk"
        );

        expect(
          normalized.companyType.value
        ).toBe("Holding");

        expect(
          normalized.keyOperation.value
        ).toBe(
          "Coal Trading"
        );

        expect(
          normalized.activities.value
        ).toEqual([
          "Trading",
        ]);

        expect(
          normalized.commodityTypes.value
        ).toEqual([
          "Coal",
        ]);

        expect(
          normalized.miningSiteCount.value
        ).toBe(0);
      }
    );

    it(
      "marks activated operational fields as semantically known source facts",
      () => {
        const normalized =
          normalizeMiningOperationalContext({
            companyId:
              "rx-company-aadi",

            detail,

            source:
              "sectors-company-detail",
          });

        expect(
          normalized.companyType.semantic.state
        ).toBe("KNOWN");

        expect(
          normalized.companyType.semantic.basis
        ).toContain(
          "company_type"
        );

        expect(
          normalized.companyType.evidence[0]
            ?.truthClass
        ).toBe(
          "SOURCE_FACT"
        );

        expect(
          normalized.companyType.evidence[0]
            ?.provider
        ).toBe(
          "SECTORS"
        );

        expect(
          normalized.companyType.sourceField
        ).toBe(
          "company_type"
        );
      }
    );

    it(
      "preserves explicit null instead of manufacturing a value",
      () => {
        const nullableDetail =
          sectorsMiningCompanyDetailSchema.parse({
            ...detail,

            symbol:
              null,

            operation_province:
              null,

            operation_district:
              null,

            representative_address:
              null,

            website:
              null,

            phone_number:
              null,

            email:
              null,
          });

        const normalized =
          normalizeMiningOperationalContext({
            companyId:
              "rx-company-aadi",

            detail:
              nullableDetail,

            source:
              "nullable-context-test",
          });

        expect(
          normalized.symbol.value
        ).toBeNull();

        expect(
          normalized.operationProvince.value
        ).toBeNull();

        expect(
          normalized.operationDistrict.value
        ).toBeNull();
      }
    );

    it(
      "preserves explicit zero mining site count as zero",
      () => {
        const normalized =
          normalizeMiningOperationalContext({
            companyId:
              "rx-company-aadi",

            detail,

            source:
              "zero-test",
          });

        expect(
          normalized.miningSiteCount.value
        ).toBe(0);

        expect(
          normalized.miningSiteCount.value
        ).not.toBeNull();
      }
    );

    it(
      "preserves empty arrays instead of treating them as missing",
      () => {
        const emptyDetail =
          sectorsMiningCompanyDetailSchema.parse({
            ...detail,

            activities: [],

            commodity_type: [],

            mining_license: [],

            mining_contract: [],
          });

        const normalized =
          normalizeMiningOperationalContext({
            companyId:
              "rx-company-aadi",

            detail:
              emptyDetail,

            source:
              "empty-array-test",
          });

        expect(
          normalized.activities.value
        ).toEqual([]);

        expect(
          normalized.commodityTypes.value
        ).toEqual([]);

        expect(
          normalized.miningLicenses.value
        ).toEqual([]);

        expect(
          normalized.miningContracts.value
        ).toEqual([]);
      }
    );

    it(
      "preserves generic license and contract objects without inventing nested semantics",
      () => {
        const genericDetail =
          sectorsMiningCompanyDetailSchema.parse({
            ...detail,

            mining_license: [
              {
                unknown_license_field:
                  "preserved",
              },
            ],

            mining_contract: [
              {
                unknown_contract_field:
                  "preserved",
              },
            ],
          });

        const normalized =
          normalizeMiningOperationalContext({
            companyId:
              "rx-company-aadi",

            detail:
              genericDetail,

            source:
              "generic-object-test",
          });

        expect(
          normalized.miningLicenses.value[0]
        ).toMatchObject({
          unknown_license_field:
            "preserved",
        });

        expect(
          normalized.miningContracts.value[0]
        ).toMatchObject({
          unknown_contract_field:
            "preserved",
        });
      }
    );

    it(
      "does not activate contact fields into investigation operational context",
      () => {
        const normalized =
          normalizeMiningOperationalContext({
            companyId:
              "rx-company-aadi",

            detail,

            source:
              "contact-boundary-test",
          });

        expect(
          "website" in normalized
        ).toBe(false);

        expect(
          "phoneNumber" in normalized
        ).toBe(false);

        expect(
          "email" in normalized
        ).toBe(false);

        expect(
          "representativeAddress" in normalized
        ).toBe(false);
      }
    );

    it(
      "keeps operational context company-scoped without manufacturing a time period",
      () => {
        const normalized =
          normalizeMiningOperationalContext({
            companyId:
              "rx-company-aadi",

            detail,

            source:
              "company-scope-test",
          });

        expect(
          "period" in normalized
        ).toBe(false);
      }
    );

    it(
      "keeps RX company id separate from Sectors slug",
      () => {
        const normalized =
          normalizeMiningOperationalContext({
            companyId:
              "rx-internal-company-id",

            detail,

            source:
              "identifier-boundary-test",
          });

        expect(
          normalized.companyId
        ).toBe(
          "rx-internal-company-id"
        );

        expect(
          normalized.sectorsSlug
        ).toBe(
          "pt-adaro-andalan-indonesia-tbk"
        );

        expect(
          normalized.companyId
        ).not.toBe(
          normalized.sectorsSlug
        );
      }
    );
  }
);