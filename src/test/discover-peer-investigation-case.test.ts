import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  SectorsAdapter,
} from "../data/sectors/sectors-adapter";

import {
  admitMiningOperationalContextEvidence,
} from "../investigation/admit-mining-operational-context-evidence";

import {
  admitMiningHistoricalPerformanceEvidence,
} from "../investigation/admit-mining-historical-performance-evidence";

import {
  discoverPeerInvestigationCase,
} from "../investigation/discover-peer-investigation-case";

import {
  selectAdmittedPeerInvestigationCase,
} from "../investigation/select-admitted-peer-investigation-case";

vi.mock(
  "../investigation/admit-mining-operational-context-evidence",
  () => ({
    admitMiningOperationalContextEvidence:
      vi.fn(),
  })
);

vi.mock(
  "../investigation/admit-mining-historical-performance-evidence",
  () => ({
    admitMiningHistoricalPerformanceEvidence:
      vi.fn(),
  })
);

vi.mock(
  "../investigation/select-admitted-peer-investigation-case",
  () => ({
    selectAdmittedPeerInvestigationCase:
      vi.fn(),
  })
);

const mockedOperationalAdmission =
  vi.mocked(
    admitMiningOperationalContextEvidence
  );

const mockedHistoricalAdmission =
  vi.mocked(
    admitMiningHistoricalPerformanceEvidence
  );

const mockedSelection =
  vi.mocked(
    selectAdmittedPeerInvestigationCase
  );

const firstCompany = {
  id:
    "COMPANY-A",

  name:
    "Company A",

  symbol:
    "AAA",

  sectorsSlug:
    "company-a",

  listed:
    true,

  exchange:
    "IDX",
} as const;

const secondCompany = {
  id:
    "COMPANY-B",

  name:
    "Company B",

  symbol:
    "BBB",

  sectorsSlug:
    "company-b",

  listed:
    true,

  exchange:
    "IDX",
} as const;

const admittedOperational = {
  status:
    "ADMITTED",

  collection: {
    issues: [],
  },

  context: {},
} as never;

const admittedHistorical = {
  status:
    "ADMITTED",

  collection: {
    issues: [],
  },

  observations: [],

  admittedObservations: [],
} as never;

const selectedCase = {
  status:
    "SELECTED",

  investigationCase: {
    caseId:
      "CASE-001",
  },

  peerEligibility: {
    status:
      "ELIGIBLE",

    issues: [],
  },

  queue: {
    cases: [
      {
        caseId:
          "CASE-001",
      },
    ],
  },

  causalConclusion:
    "UNKNOWN",

  issues: [],
} as never;

function createAdapter(): {
  adapter:
    SectorsAdapter;

  requestJson:
    ReturnType<
      typeof vi.fn<
        (
          request:
            Parameters<
              SectorsAdapter["requestJson"]
            >[0]
        ) => Promise<unknown>
      >
    >;
} {
  const requestJson =
    vi.fn<
      (
        request:
          Parameters<
            SectorsAdapter["requestJson"]
          >[0]
      ) => Promise<unknown>
    >(
      async (
        _request
      ) => ({
        ok:
          true,
      })
    );

  const adapter:
    SectorsAdapter = {
    async requestJson<T>(
      request:
        Parameters<
          SectorsAdapter["requestJson"]
        >[0]
    ): Promise<T> {
      return (
        await requestJson(
          request
        )
      ) as T;
    },
  };

  return {
    adapter,
    requestJson,
  };
}

describe(
  "discoverPeerInvestigationCase",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mockedOperationalAdmission
        .mockReturnValue(
          admittedOperational
        );

      mockedHistoricalAdmission
        .mockReturnValue(
          admittedHistorical
        );

      mockedSelection
        .mockReturnValue(
          selectedCase
        );
    });

    it(
      "executes exactly four bounded Sectors discovery requests and selects the canonical case",
      async () => {
        const {
          adapter,
          requestJson,
        } =
          createAdapter();

        const result =
          await discoverPeerInvestigationCase({
            adapter,

            firstCompany,

            secondCompany,

            year:
              2024,

            retrievedAt:
              "2026-09-05T06:30:00.000Z",
          });

        expect(
          result
        ).toMatchObject({
          status:
            "DISCOVERED",

          firstCompany,

          secondCompany,

          selection:
            selectedCase,

          estimatedCreditsUsed:
            4,

          causalConclusion:
            "UNKNOWN",

          issues: [],
        });

        expect(
          requestJson
        ).toHaveBeenCalledTimes(
          4
        );

        expect(
          requestJson.mock.calls.map(
            ([request]) =>
              request.path
          )
        ).toEqual([
          "/v2/mining/companies/company-a/",
          "/v2/mining/companies/company-b/",
          "/v2/mining/companies/performance/company-a/?year=2024",
          "/v2/mining/companies/performance/company-b/?year=2024",
        ]);

        expect(
          mockedOperationalAdmission
        ).toHaveBeenCalledTimes(
          2
        );

        expect(
          mockedHistoricalAdmission
        ).toHaveBeenCalledTimes(
          2
        );

        expect(
          mockedSelection
        ).toHaveBeenCalledTimes(
          1
        );
      }
    );

    it(
      "rejects before any Sectors request when a company slug is missing",
      async () => {
        const {
          adapter,
          requestJson,
        } =
          createAdapter();

        const result =
          await discoverPeerInvestigationCase({
            adapter,

            firstCompany: {
              ...firstCompany,

              sectorsSlug:
                undefined,
            },

            secondCompany,

            year:
              2024,
          });

        expect(
          result
        ).toMatchObject({
          status:
            "REJECTED",

          estimatedCreditsUsed:
            0,

          issues: [
            "SECTORS_SLUG_MISSING",
          ],

          causalConclusion:
            "UNKNOWN",
        });

        expect(
          requestJson
        ).not.toHaveBeenCalled();

        expect(
          mockedSelection
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "fails fast after the first request when first operational evidence is rejected",
      async () => {
        const {
          adapter,
          requestJson,
        } =
          createAdapter();

        mockedOperationalAdmission
          .mockReturnValueOnce({
            status:
              "REJECTED",

            collection: {
              issues: [
                "INVALID_RESPONSE",
              ],
            },

            context:
              null,
          } as never);

        const result =
          await discoverPeerInvestigationCase({
            adapter,

            firstCompany,

            secondCompany,

            year:
              2024,
          });

        expect(
          result
        ).toMatchObject({
          status:
            "REJECTED",

          estimatedCreditsUsed:
            1,

          issues: [
            "FIRST_OPERATIONAL_EVIDENCE_NOT_ADMITTED",
            "INVALID_RESPONSE",
          ],

          causalConclusion:
            "UNKNOWN",
        });

        expect(
          requestJson
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          mockedHistoricalAdmission
        ).not.toHaveBeenCalled();

        expect(
          mockedSelection
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "fails fast after three requests when first historical evidence is rejected",
      async () => {
        const {
          adapter,
          requestJson,
        } =
          createAdapter();

        mockedHistoricalAdmission
          .mockReturnValueOnce({
            status:
              "REJECTED",

            collection: {
              issues: [
                "INVALID_RESPONSE",
              ],
            },

            observations: [],

            admittedObservations: [],
          } as never);

        const result =
          await discoverPeerInvestigationCase({
            adapter,

            firstCompany,

            secondCompany,

            year:
              2024,
          });

        expect(
          result
        ).toMatchObject({
          status:
            "REJECTED",

          estimatedCreditsUsed:
            3,

          issues: [
            "FIRST_HISTORICAL_EVIDENCE_NOT_ADMITTED",
            "INVALID_RESPONSE",
          ],

          causalConclusion:
            "UNKNOWN",
        });

        expect(
          requestJson
        ).toHaveBeenCalledTimes(
          3
        );

        expect(
          mockedSelection
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "preserves deterministic selection rejection without manufacturing a case",
      async () => {
        const {
          adapter,
          requestJson,
        } =
          createAdapter();

        mockedSelection
          .mockReturnValue({
            status:
              "REJECTED",

            investigationCase:
              null,

            peerEligibility: {
              status:
                "ELIGIBLE",

              issues: [],
            },

            queue: {
              cases: [],
            },

            causalConclusion:
              "UNKNOWN",

            issues: [
              "NO_CANONICAL_PEER_INVESTIGATION_CASE",
            ],
          } as never);

        const result =
          await discoverPeerInvestigationCase({
            adapter,

            firstCompany,

            secondCompany,

            year:
              2024,
          });

        expect(
          result
        ).toMatchObject({
          status:
            "REJECTED",

          estimatedCreditsUsed:
            4,

          issues: [
            "NO_CANONICAL_PEER_INVESTIGATION_CASE",
          ],

          causalConclusion:
            "UNKNOWN",
        });

        expect(
          requestJson
        ).toHaveBeenCalledTimes(
          4
        );
      }
    );

    it(
      "rejects invalid discovery input without spending credits",
      async () => {
        const {
          adapter,
          requestJson,
        } =
          createAdapter();

        const result =
          await discoverPeerInvestigationCase({
            adapter,

            firstCompany,

            secondCompany,

            year:
              0,
          });

        expect(
          result
        ).toMatchObject({
          status:
            "REJECTED",

          estimatedCreditsUsed:
            0,

          issues: [
            "YEAR_INVALID",
          ],
        });

        expect(
          requestJson
        ).not.toHaveBeenCalled();
      }
    );
  }
);