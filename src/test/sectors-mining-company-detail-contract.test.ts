import {
  describe,
  expect,
  it,
} from "vitest";

import {
  sectorsMiningCompanyDetailSchema,
} from "../data/schemas/sectors-mining-company-detail";

describe(
  "Sectors mining company detail official transport contract",
  () => {
    const officialAadiExample = {
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

      representative_address:
        "Cyber 2 Tower Lantai 26, Jl. H.R. Rasuna Said Blok X-5, No.13, Jakarta 12950",

      website:
        "www.adaroindonesia.com",

      phone_number:
        "021-25533065",

      email:
        "corsec@adaroindonesia.com",

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

          wiup_code:
            "1300003032014132",

          province:
            "Kalimantan Selatan",

          city:
            "Kabupaten Tabalong",

          license_effective_date:
            "2022-09-13",

          license_expiry_date:
            "2032-10-01",

          activity:
            "Operasi Produksi",

          licensed_area_ha:
            23942,

          cnc:
            "CNC",

          generation:
            "GEN I",

          location:
            "Kabupaten Tabalong, Kabupaten Balangan",

          commodity_type:
            "Coal",
        },
      ],

      mining_contract: [],

      mining_site_count:
        0,
    };

    it(
      "accepts the official Sectors MiningCompanyDetail example",
      () => {
        const parsed =
          sectorsMiningCompanyDetailSchema.parse(
            officialAadiExample
          );

        expect(
          parsed.name
        ).toBe(
          "PT Adaro Andalan Indonesia Tbk"
        );

        expect(
          parsed.slug
        ).toBe(
          "pt-adaro-andalan-indonesia-tbk"
        );

        expect(
          parsed.symbol
        ).toBe("AADI.JK");

        expect(
          parsed.company_type
        ).toBe("Holding");

        expect(
          parsed.key_operation
        ).toBe("Coal Trading");

        expect(
          parsed.activities
        ).toEqual([
          "Trading",
        ]);

        expect(
          parsed.commodity_type
        ).toEqual([
          "Coal",
        ]);

        expect(
          parsed.mining_license
        ).toHaveLength(1);

        expect(
          parsed.mining_contract
        ).toEqual([]);

        expect(
          parsed.mining_site_count
        ).toBe(0);
      }
    );

    it(
      "accepts required nullable fields when their values are null",
      () => {
        const parsed =
          sectorsMiningCompanyDetailSchema.parse({
            ...officialAadiExample,

            symbol: null,

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

        expect(
          parsed.symbol
        ).toBeNull();

        expect(
          parsed.operation_province
        ).toBeNull();

        expect(
          parsed.operation_district
        ).toBeNull();

        expect(
          parsed.representative_address
        ).toBeNull();

        expect(
          parsed.website
        ).toBeNull();

        expect(
          parsed.phone_number
        ).toBeNull();

        expect(
          parsed.email
        ).toBeNull();
      }
    );

    it(
      "rejects a missing required field even when that field is nullable",
      () => {
        const {
          symbol: _symbol,
          ...withoutSymbol
        } = officialAadiExample;

        const result =
          sectorsMiningCompanyDetailSchema.safeParse(
            withoutSymbol
          );

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "rejects a non-integer mining site count",
      () => {
        const result =
          sectorsMiningCompanyDetailSchema.safeParse({
            ...officialAadiExample,

            mining_site_count:
              1.5,
          });

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "preserves unknown top-level fields for forward compatibility",
      () => {
        const parsed =
          sectorsMiningCompanyDetailSchema.parse({
            ...officialAadiExample,

            future_sectors_field:
              "preserved",
          });

        expect(
          parsed.future_sectors_field
        ).toBe(
          "preserved"
        );
      }
    );

    it(
      "preserves unknown mining license fields without inventing nested requirements",
      () => {
        const parsed =
          sectorsMiningCompanyDetailSchema.parse({
            ...officialAadiExample,

            mining_license: [
              {
                future_license_field:
                  "preserved",
              },
            ],
          });

        expect(
          parsed.mining_license
        ).toHaveLength(1);

        expect(
          parsed.mining_license[0]
        ).toMatchObject({
          future_license_field:
            "preserved",
        });
      }
    );

    it(
      "accepts generic mining contract objects because OpenAPI does not define nested contract requirements",
      () => {
        const parsed =
          sectorsMiningCompanyDetailSchema.parse({
            ...officialAadiExample,

            mining_contract: [
              {
                contract_reference:
                  "example-only",
              },
            ],
          });

        expect(
          parsed.mining_contract
        ).toHaveLength(1);

        expect(
          parsed.mining_contract[0]
        ).toMatchObject({
          contract_reference:
            "example-only",
        });
      }
    );

    it(
      "rejects missing required arrays instead of treating missing as empty",
      () => {
        const {
          activities:
            _activities,
          ...withoutActivities
        } = officialAadiExample;

        const result =
          sectorsMiningCompanyDetailSchema.safeParse(
            withoutActivities
          );

        expect(
          result.success
        ).toBe(false);
      }
    );

    it(
      "distinguishes an empty required array from a missing required array",
      () => {
        const parsed =
          sectorsMiningCompanyDetailSchema.parse({
            ...officialAadiExample,

            activities: [],

            commodity_type: [],

            mining_license: [],

            mining_contract: [],
          });

        expect(
          parsed.activities
        ).toEqual([]);

        expect(
          parsed.commodity_type
        ).toEqual([]);

        expect(
          parsed.mining_license
        ).toEqual([]);

        expect(
          parsed.mining_contract
        ).toEqual([]);
      }
    );
  }
);