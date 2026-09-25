import {
  describe,
  expect,
  it,
} from "vitest";

import {
  admitMiningSalesDestinationEvidence,
} from "../investigation/admit-mining-sales-destination-evidence";

import {
  analyzeMiningSalesDestination,
} from "../investigation/analyze-mining-sales-destination";

import type {
  RXInvestigationDataRequest,
} from "../investigation/investigation-plan";

function createRequest(
  capability:
    RXInvestigationDataRequest["capability"] =
      "MINING_SALES_DESTINATION",
): RXInvestigationDataRequest {
  return {
    requestId:
      "REQ-SALES-DESTINATION-1",

    requirementId:
      "REQ-SALES-DESTINATION",

    source:
      "SECTORS",

    capability,

    purpose:
      "Collect admitted mining sales-destination evidence.",

    status:
      "PLANNED",
  };
}

function createAdmission() {
  return admitMiningSalesDestinationEvidence({
    request:
      createRequest(),

    companyId:
      "rx-company-test",

    requestedYear:
      2024,

    sourceReference:
      "SECTORS_TEST",

    payload: {
      year:
        2024,

      data: {
        Indonesia: {
          revenue_usd:
            null,

          percentage_of_total_revenue:
            null,

          volume:
            23.07,

          percentage_of_sales_volume:
            null,

          commodity_type:
            "Coal",

          unit:
            "Mt",
        },

        "East Asia (China, Japan, Korea and Taiwan)": {
          revenue_usd:
            862200000,

          percentage_of_total_revenue:
            null,

          volume:
            null,

          percentage_of_sales_volume:
            20.21,

          commodity_type:
            "Coal",

          unit:
            null,
        },

        China: {
          revenue_usd:
            1250070000,

          percentage_of_total_revenue:
            null,

          volume:
            null,

          percentage_of_sales_volume:
            null,

          commodity_type:
            "Coal",

          unit:
            null,
        },
      },
    },
  });
}

describe(
  "sales-destination deterministic analysis",
  () => {
    it(
      "admits valid provider sales-destination evidence",
      () => {
        const admission =
          createAdmission();

        expect(
          admission.status,
        ).toBe("ADMITTED");

        expect(
          admission.admittedObservations,
        ).toHaveLength(3);
      },
    );

    it(
      "analyzes admitted evidence deterministically",
      () => {
        const analysis =
          analyzeMiningSalesDestination(
            createAdmission(),
          );

        expect(
          analysis.status,
        ).toBe("ANALYZED");

        expect(
          analysis.companyId,
        ).toBe(
          "rx-company-test",
        );

        expect(
          analysis.years,
        ).toEqual([
          2024,
        ]);

        expect(
          analysis.destinationCount,
        ).toBe(3);

        expect(
          analysis.observationCount,
        ).toBe(3);

        expect(
          analysis.observationsWithRevenue,
        ).toBe(2);

        expect(
          analysis.observationsWithRevenueShare,
        ).toBe(0);

        expect(
          analysis.observationsWithVolume,
        ).toBe(1);

        expect(
          analysis.observationsWithVolumeShare,
        ).toBe(1);

        expect(
          analysis.causalConclusion,
        ).toBe("UNKNOWN");
      },
    );

    it(
      "preserves provider aggregate geography labels verbatim",
      () => {
        const analysis =
          analyzeMiningSalesDestination(
            createAdmission(),
          );

        const regional =
          analysis.destinations.find(
            (destination) =>
              destination.destinationLabel ===
              "East Asia (China, Japan, Korea and Taiwan)",
          );

        expect(
          regional,
        ).toBeDefined();

        expect(
          regional?.destinationLabel,
        ).toBe(
          "East Asia (China, Japan, Korea and Taiwan)",
        );

        expect(
          regional?.revenueUsd,
        ).toBe(862200000);

        expect(
          regional?.percentageOfSalesVolume,
        ).toBe(20.21);

        expect(
          regional?.volume,
        ).toBeNull();
      },
    );

    it(
      "preserves null provider values without deriving replacements",
      () => {
        const analysis =
          analyzeMiningSalesDestination(
            createAdmission(),
          );

        const indonesia =
          analysis.destinations.find(
            (destination) =>
              destination.destinationLabel ===
              "Indonesia",
          );

        expect(
          indonesia?.revenueUsd,
        ).toBeNull();

        expect(
          indonesia?.percentageOfTotalRevenue,
        ).toBeNull();

        expect(
          indonesia?.volume,
        ).toBe(23.07);

        expect(
          indonesia?.percentageOfSalesVolume,
        ).toBeNull();

        expect(
          Object.prototype.hasOwnProperty.call(
            indonesia ?? {},
            "derivedRevenue",
          ),
        ).toBe(false);

        expect(
          Object.prototype.hasOwnProperty.call(
            indonesia ?? {},
            "derivedPercentage",
          ),
        ).toBe(false);
      },
    );

    it(
      "orders destination labels deterministically",
      () => {
        const analysis =
          analyzeMiningSalesDestination(
            createAdmission(),
          );

        expect(
          analysis.destinations.map(
            (destination) =>
              destination.destinationLabel,
          ),
        ).toEqual([
          "China",
          "East Asia (China, Japan, Korea and Taiwan)",
          "Indonesia",
        ]);
      },
    );

    it(
      "rejects payload for a different requested year",
      () => {
        const admission =
          admitMiningSalesDestinationEvidence({
            request:
              createRequest(),

            companyId:
              "rx-company-test",

            requestedYear:
              2023,

            sourceReference:
              "SECTORS_TEST",

            payload: {
              year:
                2024,

              data: {
                Indonesia: {
                  volume:
                    23.07,

                  unit:
                    "Mt",
                },
              },
            },
          });

        expect(
          admission.status,
        ).toBe("REJECTED");

        expect(
          admission.admittedObservations,
        ).toEqual([]);

        const analysis =
          analyzeMiningSalesDestination(
            admission,
          );

        expect(
          analysis.status,
        ).toBe(
          "INSUFFICIENT_EVIDENCE",
        );

        expect(
          analysis.causalConclusion,
        ).toBe("UNKNOWN");
      },
    );

    it(
      "rejects invalid provider response shape",
      () => {
        const admission =
          admitMiningSalesDestinationEvidence({
            request:
              createRequest(),

            companyId:
              "rx-company-test",

            requestedYear:
              2024,

            sourceReference:
              "SECTORS_TEST",

            payload: {
              year:
                "2024",

              data:
                [],
            },
          });

        expect(
          admission.status,
        ).toBe("REJECTED");

        expect(
          admission.observations,
        ).toEqual([]);

        expect(
          admission.admittedObservations,
        ).toEqual([]);
      },
    );

    it(
      "rejects an empty provider data object",
      () => {
        const admission =
          admitMiningSalesDestinationEvidence({
            request:
              createRequest(),

            companyId:
              "rx-company-test",

            requestedYear:
              2024,

            sourceReference:
              "SECTORS_TEST",

            payload: {
              year:
                2024,

              data: {},
            },
          });

        expect(
          admission.status,
        ).toBe("REJECTED");

        expect(
          admission.admittedObservations,
        ).toEqual([]);

        const analysis =
          analyzeMiningSalesDestination(
            admission,
          );

        expect(
          analysis.status,
        ).toBe(
          "INSUFFICIENT_EVIDENCE",
        );
      },
    );

    it(
      "does not manufacture geography classification score or causality",
      () => {
        const analysis =
          analyzeMiningSalesDestination(
            createAdmission(),
          );

        expect(
          Object.prototype.hasOwnProperty.call(
            analysis,
            "domesticExport",
          ),
        ).toBe(false);

        expect(
          Object.prototype.hasOwnProperty.call(
            analysis,
            "concentrationScore",
          ),
        ).toBe(false);

        expect(
          Object.prototype.hasOwnProperty.call(
            analysis,
            "ranking",
          ),
        ).toBe(false);

        expect(
          analysis.causalConclusion,
        ).toBe("UNKNOWN");

        expect(
          analysis.observedRelationship,
        ).toContain(
          "provider-defined sales-destination observations",
        );
      },
    );
  },
);