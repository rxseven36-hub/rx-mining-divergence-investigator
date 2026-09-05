import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks =
  vi.hoisted(() => ({
    discoverPeerInvestigationCase:
      vi.fn(),

    runPeerInvestigationIntelligence:
      vi.fn(),
  }));

vi.mock(
  "../investigation/discover-peer-investigation-case",
  async () => {
    const actual =
      await vi.importActual<
        typeof import(
          "../investigation/discover-peer-investigation-case"
        )
      >(
        "../investigation/discover-peer-investigation-case",
      );

    return {
      ...actual,

      discoverPeerInvestigationCase:
        mocks.discoverPeerInvestigationCase,
    };
  },
);

vi.mock(
  "../investigation/run-peer-investigation-intelligence",
  async () => {
    const actual =
      await vi.importActual<
        typeof import(
          "../investigation/run-peer-investigation-intelligence"
        )
      >(
        "../investigation/run-peer-investigation-intelligence",
      );

    return {
      ...actual,

      runPeerInvestigationIntelligence:
        mocks.runPeerInvestigationIntelligence,
    };
  },
);

import {
  runLivePeerIntelligence,
} from "../investigation/run-live-peer-intelligence";

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

const investigationCase = {
  id:
    "peer-case-1",
};

describe(
  "runLivePeerIntelligence",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it(
      "stops before intelligence when discovery is rejected",
      async () => {
        const discovery = {
          status:
            "REJECTED",

          firstCompany,

          secondCompany,

          selection:
            null,

          estimatedCreditsUsed:
            0,

          causalConclusion:
            "UNKNOWN",

          issues: [
            "PEER_DISCOVERY_REJECTED",
          ],
        };

        mocks
          .discoverPeerInvestigationCase
          .mockResolvedValue(
            discovery,
          );

        const result =
          await runLivePeerIntelligence({
            sectorsApiKey:
              "test-sectors-key",

            llmApiKey:
              "test-llm-key",

            firstCompany,

            secondCompany,

            year:
              2024,
          });

        expect(
          result.status,
        ).toBe(
          "REJECTED",
        );

        expect(
          result.stage,
        ).toBe(
          "DISCOVERY",
        );

        expect(
          result.discovery,
        ).toBe(
          discovery,
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
            .runPeerInvestigationIntelligence,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "passes the discovered canonical case into the intelligence orchestrator",
      async () => {
        const discovery = {
          status:
            "DISCOVERED",

          firstCompany,

          secondCompany,

          selection: {
            status:
              "SELECTED",

            investigationCase,

            causalConclusion:
              "UNKNOWN",

            issues: [],
          },

          estimatedCreditsUsed:
            4,

          causalConclusion:
            "UNKNOWN",

          issues: [],
        };

        const intelligence = {
          status:
            "ACCEPTED",

          stage:
            "COMPLETE",

          causalConclusion:
            "UNKNOWN",

          issues: [],
        };

        mocks
          .discoverPeerInvestigationCase
          .mockResolvedValue(
            discovery,
          );

        mocks
          .runPeerInvestigationIntelligence
          .mockResolvedValue(
            intelligence,
          );

        await runLivePeerIntelligence({
          sectorsApiKey:
            "test-sectors-key",

          llmApiKey:
            "test-llm-key",

          firstCompany,

          secondCompany,

          year:
            2024,

          retrievedAt:
            "2026-09-05T00:00:00.000Z",
        });

        expect(
          mocks
            .runPeerInvestigationIntelligence,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          mocks
            .runPeerInvestigationIntelligence,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            investigationCase,

            firstCompany,

            secondCompany,

            retrievedAt:
              "2026-09-05T00:00:00.000Z",
          }),
        );
      },
    );

    it(
      "returns COMPLETE when discovery and intelligence both succeed",
      async () => {
        const discovery = {
          status:
            "DISCOVERED",

          firstCompany,

          secondCompany,

          selection: {
            status:
              "SELECTED",

            investigationCase,

            causalConclusion:
              "UNKNOWN",

            issues: [],
          },

          estimatedCreditsUsed:
            4,

          causalConclusion:
            "UNKNOWN",

          issues: [],
        };

        const intelligence = {
          status:
            "ACCEPTED",

          stage:
            "COMPLETE",

          causalConclusion:
            "UNKNOWN",

          issues: [],
        };

        mocks
          .discoverPeerInvestigationCase
          .mockResolvedValue(
            discovery,
          );

        mocks
          .runPeerInvestigationIntelligence
          .mockResolvedValue(
            intelligence,
          );

        const result =
          await runLivePeerIntelligence({
            sectorsApiKey:
              "test-sectors-key",

            llmApiKey:
              "test-llm-key",

            firstCompany,

            secondCompany,

            year:
              2024,
          });

        expect(
          result,
        ).toEqual({
          status:
            "ACCEPTED",

          stage:
            "COMPLETE",

          discovery,

          intelligence,

          causalConclusion:
            "UNKNOWN",

          issues: [],
        });
      },
    );
  },
);