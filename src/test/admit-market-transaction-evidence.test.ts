import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RXInvestigationDataRequest,
} from "../investigation/investigation-plan";

import type {
  RXTimePeriod,
} from "../types/time";

import {
  admitMarketTransactionEvidence,
} from "../investigation/admit-market-transaction-evidence";

function createRequest(
  capability:
    RXInvestigationDataRequest["capability"] =
      "COMPANY_MARKET_TRANSACTION_HISTORY"
): RXInvestigationDataRequest {
  return {
    requestId:
      "RX-MARKET-R1",

    requirementId:
      "RX-MARKET-E1",

    source:
      "SECTORS",

    capability,

    purpose:
      "Collect daily market transaction evidence without asserting causality.",

    status:
      "PLANNED",
  };
}

function createPeriod():
  RXTimePeriod {
  return {
    kind:
      "RANGE",

    start:
      "2024-12-01",

    end:
      "2024-12-31",
  };
}

function createPayload() {
  return [
    {
      symbol:
        "AADI.JK",

      date:
        "2024-12-20",

      close:
        9050,

      volume:
        12500000,

      market_cap:
        70500000000000,
    },
  ];
}

describe(
  "admitMarketTransactionEvidence",
  () => {
    it(
      "admits aligned market observations as SOURCE_FACT evidence",
      () => {
        const result =
          admitMarketTransactionEvidence({
            request:
              createRequest(),

            requestedTicker:
              "AADI",

            requestedPeriod:
              createPeriod(),

            sourceReference:
              "sectors:daily:AADI",

            retrievedAt:
              "2026-08-30T00:00:00.000Z",

            payload:
              createPayload(),
          });

        expect(
          result.status
        ).toBe(
          "ADMITTED"
        );

        expect(
          result.collection.status
        ).toBe(
          "AVAILABLE"
        );

        expect(
          result.collection.issues
        ).toEqual([]);

        expect(
          result.observations
        ).toHaveLength(3);

        expect(
          result.collection.evidence
        ).toHaveLength(3);

        expect(
          result.collection.evidence.every(
            (item) =>
              item.source ===
                "SECTORS" &&
              item.truthClass ===
                "SOURCE_FACT"
          )
        ).toBe(true);

        expect(
          result.collection
            .causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "treats symbols with and without .JK as equivalent",
      () => {
        const result =
          admitMarketTransactionEvidence({
            request:
              createRequest(),

            requestedTicker:
              "AADI.JK",

            requestedPeriod:
              createPeriod(),

            sourceReference:
              "sectors:daily:AADI",

            payload: [
              {
                ...createPayload()[0],

                symbol:
                  "AADI",
              },
            ],
          });

        expect(
          result.status
        ).toBe(
          "ADMITTED"
        );
      }
    );

    it(
      "compares IDX symbols case-insensitively",
      () => {
        const result =
          admitMarketTransactionEvidence({
            request:
              createRequest(),

            requestedTicker:
              "aadi",

            requestedPeriod:
              createPeriod(),

            sourceReference:
              "sectors:daily:AADI",

            payload: [
              {
                ...createPayload()[0],

                symbol:
                  "aadi.jk",
              },
            ],
          });

        expect(
          result.status
        ).toBe(
          "ADMITTED"
        );
      }
    );

    it(
      "rejects the wrong capability as RELATIONSHIP_INVALID",
      () => {
        const result =
          admitMarketTransactionEvidence({
            request:
              createRequest(
                "COMMODITY_PRICE_HISTORY"
              ),

            requestedTicker:
              "AADI",

            requestedPeriod:
              createPeriod(),

            sourceReference:
              "sectors:daily:AADI",

            payload:
              createPayload(),
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.collection.status
        ).toBe(
          "NOT_COMPARABLE"
        );

        expect(
          result.collection.issues
        ).toEqual([
          "RELATIONSHIP_INVALID",
        ]);
      }
    );

    it(
      "rejects malformed transport data as INVALID_RESPONSE",
      () => {
        const result =
          admitMarketTransactionEvidence({
            request:
              createRequest(),

            requestedTicker:
              "AADI",

            requestedPeriod:
              createPeriod(),

            sourceReference:
              "sectors:daily:AADI",

            payload: {
              data:
                createPayload(),
            },
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.collection.status
        ).toBe(
          "INVALID"
        );

        expect(
          result.collection.issues
        ).toEqual([
          "INVALID_RESPONSE",
        ]);

        expect(
          result.observations
        ).toHaveLength(0);
      }
    );

    it(
      "treats an empty valid response as NO_DATA",
      () => {
        const result =
          admitMarketTransactionEvidence({
            request:
              createRequest(),

            requestedTicker:
              "AADI",

            requestedPeriod:
              createPeriod(),

            sourceReference:
              "sectors:daily:AADI",

            payload:
              [],
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.collection.status
        ).toBe(
          "UNAVAILABLE"
        );

        expect(
          result.collection.issues
        ).toEqual([
          "NO_DATA",
        ]);

        expect(
          result.collection.evidence
        ).toHaveLength(0);
      }
    );

    it(
      "rejects observations from a different source symbol",
      () => {
        const result =
          admitMarketTransactionEvidence({
            request:
              createRequest(),

            requestedTicker:
              "AADI",

            requestedPeriod:
              createPeriod(),

            sourceReference:
              "sectors:daily:AADI",

            payload: [
              {
                ...createPayload()[0],

                symbol:
                  "BBCA.JK",
              },
            ],
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.collection.status
        ).toBe(
          "NOT_COMPARABLE"
        );

        expect(
          result.collection.issues
        ).toEqual([
          "RELATIONSHIP_INVALID",
        ]);

        expect(
          result.observations
        ).toHaveLength(3);
      }
    );

    it(
      "rejects observations outside the exact requested date range",
      () => {
        const result =
          admitMarketTransactionEvidence({
            request:
              createRequest(),

            requestedTicker:
              "AADI",

            requestedPeriod:
              createPeriod(),

            sourceReference:
              "sectors:daily:AADI",

            payload: [
              {
                ...createPayload()[0],

                date:
                  "2025-01-01",
              },
            ],
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.collection.status
        ).toBe(
          "NOT_COMPARABLE"
        );

        expect(
          result.collection.issues
        ).toEqual([
          "RELATIONSHIP_INVALID",
        ]);
      }
    );

    it(
      "accepts observations on both requested range boundaries",
      () => {
        const result =
          admitMarketTransactionEvidence({
            request:
              createRequest(),

            requestedTicker:
              "AADI",

            requestedPeriod:
              createPeriod(),

            sourceReference:
              "sectors:daily:AADI",

            payload: [
              {
                ...createPayload()[0],

                date:
                  "2024-12-01",
              },

              {
                ...createPayload()[0],

                date:
                  "2024-12-31",
              },
            ],
          });

        expect(
          result.status
        ).toBe(
          "ADMITTED"
        );

        expect(
          result.observations
        ).toHaveLength(6);

        expect(
          result.collection.evidence
        ).toHaveLength(6);
      }
    );

    it(
      "rejects the whole response when one row is misaligned",
      () => {
        const result =
          admitMarketTransactionEvidence({
            request:
              createRequest(),

            requestedTicker:
              "AADI",

            requestedPeriod:
              createPeriod(),

            sourceReference:
              "sectors:daily:AADI",

            payload: [
              createPayload()[0],

              {
                ...createPayload()[0],

                symbol:
                  "BBCA.JK",

                date:
                  "2024-12-21",
              },
            ],
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.collection.status
        ).toBe(
          "NOT_COMPARABLE"
        );

        expect(
          result.collection.issues
        ).toEqual([
          "RELATIONSHIP_INVALID",
        ]);

        expect(
          result.observations
        ).toHaveLength(6);

        expect(
          result.collection.evidence
        ).toHaveLength(0);
      }
    );

    it(
      "preserves zero market values as admissible evidence",
      () => {
        const result =
          admitMarketTransactionEvidence({
            request:
              createRequest(),

            requestedTicker:
              "AADI",

            requestedPeriod:
              createPeriod(),

            sourceReference:
              "sectors:daily:AADI",

            payload: [
              {
                symbol:
                  "AADI.JK",

                date:
                  "2024-12-20",

                close:
                  0,

                volume:
                  0,

                market_cap:
                  0,
              },
            ],
          });

        expect(
          result.status
        ).toBe(
          "ADMITTED"
        );

        expect(
          result.observations.map(
            (observation) =>
              observation.value
          )
        ).toEqual([
          0,
          0,
          0,
        ]);
      }
    );

    it(
      "keeps market evidence non-causal",
      () => {
        const result =
          admitMarketTransactionEvidence({
            request:
              createRequest(),

            requestedTicker:
              "AADI",

            requestedPeriod:
              createPeriod(),

            sourceReference:
              "sectors:daily:AADI",

            payload:
              createPayload(),
          });

        expect(
          result.status
        ).toBe(
          "ADMITTED"
        );

        expect(
          result.collection
            .causalConclusion
        ).toBe(
          "UNKNOWN"
        );

        expect(
          result.collection.evidence.every(
            (item) =>
              item.truthClass ===
              "SOURCE_FACT"
          )
        ).toBe(true);
      }
    );
  }
);