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
    runLivePeerIntelligence:
      vi.fn(),
  }));

vi.mock(
  "../investigation/run-live-peer-intelligence",
  () => ({
    runLivePeerIntelligence:
      mocks.runLivePeerIntelligence,
  }),
);

import {
  POST,
} from "../app/api/investigate/route";

const originalSectorsApiKey =
  process.env.SECTORS_API_KEY;

const originalLlmApiKey =
  process.env.LLM_API_KEY;

const firstCompany = {
  id:
    "company-a",

  name:
    "Company A",

  symbol:
    "AAA",

  sectorsSlug:
    "company-a",

  listed:
    true,
};

const secondCompany = {
  id:
    "company-b",

  name:
    "Company B",

  symbol:
    "BBB",

  sectorsSlug:
    "company-b",

  listed:
    true,
};

describe(
  "POST /api/investigate",
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
      "rejects invalid investigation requests before runtime execution",
      async () => {
        const request =
          new Request(
            "http://localhost/api/investigate",
            {
              method:
                "POST",

              headers: {
                "content-type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  firstCompany,

                  year:
                    2024,
                }),
            },
          );

        const response =
          await POST(
            request,
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
            "INVALID_INVESTIGATION_REQUEST",
          ],
        });

        expect(
          mocks
            .runLivePeerIntelligence,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "rejects execution when server intelligence configuration is missing",
      async () => {
        delete process.env
          .SECTORS_API_KEY;

        const request =
          new Request(
            "http://localhost/api/investigate",
            {
              method:
                "POST",

              headers: {
                "content-type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  firstCompany,

                  secondCompany,

                  year:
                    2024,
                }),
            },
          );

        const response =
          await POST(
            request,
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
            .runLivePeerIntelligence,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "returns only the presentation result for a completed live investigation",
      async () => {
        const investigationCase = {
          id:
            "peer-case-1",
        };

        const evidenceContext = {
          caseId:
            "peer-case-1",
        };

        const evidencePack = {
          caseId:
            "peer-case-1",
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
          .runLivePeerIntelligence
          .mockResolvedValue({
            status:
              "ACCEPTED",

            stage:
              "COMPLETE",

            discovery: {
              firstCompany,

              secondCompany,

              selection: {
                investigationCase,
              },

              estimatedCreditsUsed:
                4,
            },

            intelligence: {
              evidenceContext,

              synthesis: {
                evidencePack,

                hypothesis,

                challenge,

                brief,
              },
            },

            causalConclusion:
              "UNKNOWN",

            issues: [],
          });

        const request =
          new Request(
            "http://localhost/api/investigate",
            {
              method:
                "POST",

              headers: {
                "content-type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  firstCompany,

                  secondCompany,

                  year:
                    2024,
                }),
            },
          );

        const response =
          await POST(
            request,
          );

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

          companies: {
            first:
              firstCompany,

            second:
              secondCompany,
          },

          investigationCase,

          estimatedDiscoveryCreditsUsed:
            4,

          evidence: {
            context:
              evidenceContext,

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
  },
);