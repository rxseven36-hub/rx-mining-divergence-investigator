import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks =
  vi.hoisted(() => ({
    executeSectorsOperation:
      vi.fn(),

    runProductionSalesInvestigationIntelligence:
      vi.fn(),
  }));

vi.mock(
  "../data/sectors/execute-sectors-operation",
  async () => {
    const actual =
      await vi.importActual<
        typeof import(
          "../data/sectors/execute-sectors-operation"
        )
      >(
        "../data/sectors/execute-sectors-operation",
      );

    return {
      ...actual,

      executeSectorsOperation:
        mocks.executeSectorsOperation,
    };
  },
);

vi.mock(
  "../investigation/run-production-sales-investigation-intelligence",
  async () => {
    const actual =
      await vi.importActual<
        typeof import(
          "../investigation/run-production-sales-investigation-intelligence"
        )
      >(
        "../investigation/run-production-sales-investigation-intelligence",
      );

    return {
      ...actual,

      runProductionSalesInvestigationIntelligence:
        mocks.runProductionSalesInvestigationIntelligence,
    };
  },
);

import {
  runLiveProductionSalesIntelligence,
} from "../investigation/run-live-production-sales-intelligence";

const retrievedAt =
  "2026-09-05T00:00:00.000Z";

const liveAadi2024Payload = {
  year:
    2024,

  available_years: [
    2019,
    2020,
    2021,
    2022,
    2023,
    2024,
  ],

  data: [
    {
      year:
        2024,

      commodity_type:
        "Coal",

      commodity_sub_type:
        "Sub-bituminous & Metallurgical Coal",

      commodity_stats: {
        unit:
          "Mt",

        mining_operation_status:
          "production",

        production_volume:
          48.11,

        sales_volume:
          55.8,

        overburden_removal_volume:
          214.18,

        strip_ratio:
          4.51,

        resources_reserves: {
          measurement_year:
            2024,

          probable_reserves_Mt:
            356,

          proven_reserves_Mt:
            463,

          total_reserves_Mt:
            819,

          inferred_resources_Mt:
            640.6,

          indicated_resources_Mt:
            962,

          measured_resources_Mt:
            3176,

          total_resources_Mt:
            4374,
        },

        products: [],
      },
    },
  ],
};

function createInput() {
  return {
    sectorsApiKey:
      "test-sectors-key",

    llmApiKey:
      "test-llm-key",

    companyId:
      "rx-company-aadi",

    sectorsSlug:
      "pt-adaro-andalan-indonesia-tbk",

    ticker:
      "AADI.JK",

    commodity:
      "COAL" as const,

    year:
      2024,

    retrievedAt,
  };
}

describe(
  "runLiveProductionSalesIntelligence",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it(
      "stops before intelligence when discovery execution is rejected",
      async () => {
        mocks
          .executeSectorsOperation
          .mockResolvedValue({
            status:
              "REJECTED",

            operation:
              null,

            issue:
              "TEST_REJECTION",

            causalConclusion:
              "UNKNOWN",
          });

        const result =
          await runLiveProductionSalesIntelligence(
            createInput(),
          );

        expect(
          result.status,
        ).toBe(
          "REJECTED",
        );

        expect(
          result.stage,
        ).toBe(
          "DISCOVERY_EXECUTION",
        );

        expect(
          result.discovery,
        ).toBeNull();

        expect(
          result.intelligence,
        ).toBeNull();

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );

        expect(
          mocks
            .runProductionSalesInvestigationIntelligence,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "stops before intelligence when historical evidence admission rejects the executed payload",
      async () => {
        mocks
          .executeSectorsOperation
          .mockResolvedValue({
            status:
              "EXECUTED",

            operation: {
              operation:
                "GET_MINING_HISTORICAL_PERFORMANCE",
            },

            data: {
              year:
                2024,

              available_years: [],

              data: [],
            },

            causalConclusion:
              "UNKNOWN",
          });

        const result =
          await runLiveProductionSalesIntelligence(
            createInput(),
          );

        expect(
          result.status,
        ).toBe(
          "REJECTED",
        );

        expect(
          result.stage,
        ).toBe(
          "DISCOVERY_ADMISSION",
        );

        expect(
          result.discovery?.status,
        ).toBe(
          "REJECTED",
        );

        expect(
          result.intelligence,
        ).toBeNull();

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );

        expect(
          mocks
            .runProductionSalesInvestigationIntelligence,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "passes admitted AADI historical evidence into the canonical single-company intelligence bridge",
      async () => {
        mocks
          .executeSectorsOperation
          .mockResolvedValue({
            status:
              "EXECUTED",

            operation: {
              operation:
                "GET_MINING_HISTORICAL_PERFORMANCE",
            },

            data:
              liveAadi2024Payload,

            causalConclusion:
              "UNKNOWN",
          });

        const intelligence = {
          status:
            "NO_ADMITTED_EVIDENCE",

          plan:
            null,

          execution:
            null,

          evidencePack:
            null,

          synthesis:
            null,

          causalConclusion:
            "UNKNOWN",
        };

        mocks
          .runProductionSalesInvestigationIntelligence
          .mockResolvedValue(
            intelligence,
          );

        const result =
          await runLiveProductionSalesIntelligence(
            createInput(),
          );

        expect(
          mocks
            .runProductionSalesInvestigationIntelligence,
        ).toHaveBeenCalledTimes(
          1,
        );

        const call =
          mocks
            .runProductionSalesInvestigationIntelligence
            .mock.calls[0];

        expect(
          call,
        ).toBeDefined();

        const bridgeInput =
          call?.[2];

        expect(
          bridgeInput,
        ).toBeDefined();

        expect(
          bridgeInput?.admissions,
        ).toHaveLength(
          1,
        );

        expect(
          bridgeInput
            ?.admissions[0]
            ?.status,
        ).toBe(
          "ADMITTED",
        );

        const admittedObservations =
          bridgeInput
            ?.admissions[0]
            ?.admittedObservations ??
          [];

        const production =
          admittedObservations.find(
            (
              observation: {
                metric:
                  string;

                value:
                  number | null;
              },
            ) =>
              observation.metric ===
              "PRODUCTION",
          );

        const sales =
          admittedObservations.find(
            (
              observation: {
                metric:
                  string;

                value:
                  number | null;
              },
            ) =>
              observation.metric ===
              "SALES",
          );

        expect(
          production?.value,
        ).toBe(
          48.11,
        );

        expect(
          sales?.value,
        ).toBe(
          55.8,
        );

        expect(
          bridgeInput
            ?.operationContext,
        ).toEqual({
          companyId:
            "rx-company-aadi",

          sectorsSlug:
            "pt-adaro-andalan-indonesia-tbk",

          ticker:
            "AADI.JK",

          commodity:
            "COAL",

          period: {
            kind:
              "YEAR",

            year:
              2024,
          },
        });

        expect(
          bridgeInput
            ?.retrievedAt,
        ).toBe(
          retrievedAt,
        );

        expect(
          result.status,
        ).toBe(
          "COMPLETED",
        );

        expect(
          result.stage,
        ).toBe(
          "INTELLIGENCE",
        );

        if (
          result.discovery === null
        ) {
          throw new Error(
            "Expected admitted discovery evidence."
          );
        }

        expect(
          result.discovery.status,
        ).toBe(
          "ADMITTED",
        );

        expect(
          result.intelligence,
        ).toBe(
          intelligence,
        );

        expect(
          result.causalConclusion,
        ).toBe(
          "UNKNOWN",
        );
      },
    );
  },
);