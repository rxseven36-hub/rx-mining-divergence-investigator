import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks =
  vi.hoisted(() => ({
    runLiveProductionSalesIntelligence:
      vi.fn(),
  }));

vi.mock(
  "../investigation/run-live-production-sales-intelligence",
  () => ({
    runLiveProductionSalesIntelligence:
      mocks.runLiveProductionSalesIntelligence,
  }),
);

import {
  POST,
} from "../app/api/investigate/production-sales/route";

const originalSectorsApiKey =
  process.env.SECTORS_API_KEY;

const originalLlmApiKey =
  process.env.LLM_API_KEY;

function createRequest(
  body:
    unknown,
) {
  return new Request(
    "http://localhost/api/investigate/production-sales",
    {
      method:
        "POST",

      headers: {
        "content-type":
          "application/json",
      },

      body:
        JSON.stringify(
          body,
        ),
    },
  );
}

function createValidBody() {
  return {
    companyId:
      "rx-company-aadi",

    sectorsSlug:
      "pt-adaro-andalan-indonesia-tbk",

    ticker:
      "AADI.JK",

    commodity:
      "COAL",

    year:
      2024,
  };
}

describe(
  "POST /api/investigate/production-sales",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      process.env.SECTORS_API_KEY =
        "test-sectors-key";

      process.env.LLM_API_KEY =
        "test-llm-key";
    });

    afterEach(() => {
      if (
        originalSectorsApiKey ===
        undefined
      ) {
        delete process.env
          .SECTORS_API_KEY;
      } else {
        process.env.SECTORS_API_KEY =
          originalSectorsApiKey;
      }

      if (
        originalLlmApiKey ===
        undefined
      ) {
        delete process.env
          .LLM_API_KEY;
      } else {
        process.env.LLM_API_KEY =
          originalLlmApiKey;
      }
    });

    it(
      "rejects execution when server intelligence configuration is missing",
      async () => {
        delete process.env
          .SECTORS_API_KEY;

        const response =
          await POST(
            createRequest(
              createValidBody(),
            ),
          );

        expect(
          response.status,
        ).toBe(
          503,
        );

        expect(
          await response.json(),
        ).toEqual({
          status:
            "REJECTED",

          stage:
            "CONFIGURATION",

          causalConclusion:
            "UNKNOWN",

          issues: [
            "SERVER_INTELLIGENCE_CONFIGURATION_MISSING",
          ],
        });

        expect(
          mocks
            .runLiveProductionSalesIntelligence,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "rejects invalid production-sales investigation requests before runtime execution",
      async () => {
        const response =
          await POST(
            createRequest({
              companyId:
                "rx-company-aadi",

              sectorsSlug:
                "pt-adaro-andalan-indonesia-tbk",

              ticker:
                "AADI.JK",

              commodity:
                "COAL",

              year:
                2024.5,
            }),
          );

        expect(
          response.status,
        ).toBe(
          400,
        );

        expect(
          await response.json(),
        ).toEqual({
          status:
            "REJECTED",

          stage:
            "REQUEST",

          causalConclusion:
            "UNKNOWN",

          issues: [
            "INVALID_PRODUCTION_SALES_INVESTIGATION_REQUEST",
          ],
        });

        expect(
          mocks
            .runLiveProductionSalesIntelligence,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "maps a typed discovery rejection without exposing server credentials",
      async () => {
        mocks
          .runLiveProductionSalesIntelligence
          .mockResolvedValue({
            status:
              "REJECTED",

            stage:
              "DISCOVERY_ADMISSION",

            discovery: {
              status:
                "REJECTED",
            },

            intelligence:
              null,

            issues: [
              "NO_ADMISSIBLE_HISTORICAL_OBSERVATIONS",
            ],

            causalConclusion:
              "UNKNOWN",
          });

        const response =
          await POST(
            createRequest(
              createValidBody(),
            ),
          );

        expect(
          response.status,
        ).toBe(
          422,
        );

        const payload =
          await response.json();

        expect(
          payload,
        ).toEqual({
          status:
            "REJECTED",

          stage:
            "DISCOVERY_ADMISSION",

          causalConclusion:
            "UNKNOWN",

          issues: [
            "NO_ADMISSIBLE_HISTORICAL_OBSERVATIONS",
          ],
        });

        expect(
          JSON.stringify(
            payload,
          ),
        ).not.toContain(
          "test-sectors-key",
        );

        expect(
          JSON.stringify(
            payload,
          ),
        ).not.toContain(
          "test-llm-key",
        );
      },
    );

    it(
      "returns only the presentation result for a completed AADI production-sales investigation",
      async () => {
        const production = {
          observationId:
            "aadi-production-2024",

          metric:
            "PRODUCTION",

          value:
            48.11,

          unit:
            "Mt",
        };

        const sales = {
          observationId:
            "aadi-sales-2024",

          metric:
            "SALES",

          value:
            55.8,

          unit:
            "Mt",
        };

        const investigationCase = {
          caseId:
            "aadi-production-sales-case",
        };

        const evidencePack = {
          planId:
            "aadi-plan",

          caseId:
            "aadi-production-sales-case",

          evidence: [],

          causalConclusion:
            "UNKNOWN",
        };

        const hypothesis = {
          hypothesisId:
            "hypothesis-1",

          statement:
            "Evidence-bounded hypothesis",
        };

        const challenge = {
          challengeId:
            "challenge-1",

          critique:
            "Evidence-bounded challenge",
        };

        const brief = {
          briefId:
            "brief-1",

          executiveSummary:
            "Evidence-bounded intelligence brief",
        };

        mocks
          .runLiveProductionSalesIntelligence
          .mockResolvedValue({
            status:
              "COMPLETED",

            stage:
              "INTELLIGENCE",

            discovery: {
              status:
                "ADMITTED",

              admittedObservations: [
                production,
                sales,
              ],
            },

            intelligence: {
              status:
                "COMPLETED",

              queue: {
                queue: {
                  cases: [
                    investigationCase,
                  ],
                },
              },

              plan: {
                planId:
                  "aadi-plan",
              },

              execution: {
                planId:
                  "aadi-plan",
              },

              evidencePack,

              synthesis: {
                status:
                  "ACCEPTED",

                stage:
                  "COMPLETE",

                evidencePack,

                hypothesis,

                challenge,

                brief,

                issues: [],

                causalConclusion:
                  "UNKNOWN",
              },

              causalConclusion:
                "UNKNOWN",
            },

            issues: [],

            causalConclusion:
              "UNKNOWN",
          });

        const response =
          await POST(
            createRequest(
              createValidBody(),
            ),
          );

        expect(
          mocks
            .runLiveProductionSalesIntelligence,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          mocks
            .runLiveProductionSalesIntelligence,
        ).toHaveBeenCalledWith({
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
            "COAL",

          year:
            2024,
        });

        expect(
          response.status,
        ).toBe(
          200,
        );

        const payload =
          await response.json();

        expect(
          payload,
        ).toEqual({
          status:
            "ACCEPTED",

          stage:
            "COMPLETE",

          causalConclusion:
            "UNKNOWN",

          company: {
            id:
              "rx-company-aadi",

            sectorsSlug:
              "pt-adaro-andalan-indonesia-tbk",

            ticker:
              "AADI.JK",

            commodity:
              "COAL",
          },

          year:
            2024,

          divergence: {
            production,

            sales,
          },

          investigationCase,

          evidence: {
            pack:
              evidencePack,
          },

          hypothesis,

          challenge,

          brief,
        });

        expect(
          JSON.stringify(
            payload,
          ),
        ).not.toContain(
          "test-sectors-key",
        );

        expect(
          JSON.stringify(
            payload,
          ),
        ).not.toContain(
          "test-llm-key",
        );
      },
    );

    it(
      "maps unexpected live runtime failures to a safe server response",
      async () => {
        mocks
          .runLiveProductionSalesIntelligence
          .mockRejectedValue(
            new Error(
              "provider failure containing test-llm-key",
            ),
          );

        const response =
          await POST(
            createRequest(
              createValidBody(),
            ),
          );

        expect(
          response.status,
        ).toBe(
          502,
        );

        const payload =
          await response.json();

        expect(
          payload,
        ).toEqual({
          status:
            "REJECTED",

          stage:
            "RUNTIME",

          causalConclusion:
            "UNKNOWN",

          issues: [
            "LIVE_PRODUCTION_SALES_INTELLIGENCE_RUNTIME_FAILURE",
          ],
        });

        expect(
          JSON.stringify(
            payload,
          ),
        ).not.toContain(
          "test-sectors-key",
        );

        expect(
          JSON.stringify(
            payload,
          ),
        ).not.toContain(
          "test-llm-key",
        );
      },
    );
  },
);