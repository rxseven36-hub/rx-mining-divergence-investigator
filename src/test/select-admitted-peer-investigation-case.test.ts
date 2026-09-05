import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  createTypedIntelligenceEvidence,
} from "../intelligence/context/create-typed-intelligence-evidence";

import {
  evaluatePeerEligibility,
} from "../intelligence/comparability/evaluate-peer-eligibility";

import {
  buildAdmittedPeerInvestigationQueue,
} from "../investigation/build-admitted-peer-investigation-queue";

import {
  selectAdmittedPeerInvestigationCase,
} from "../investigation/select-admitted-peer-investigation-case";

vi.mock(
  "../intelligence/context/create-typed-intelligence-evidence",
  () => ({
    createTypedIntelligenceEvidence:
      vi.fn(),
  })
);

vi.mock(
  "../intelligence/comparability/evaluate-peer-eligibility",
  () => ({
    evaluatePeerEligibility:
      vi.fn(),
  })
);

vi.mock(
  "../investigation/build-admitted-peer-investigation-queue",
  () => ({
    buildAdmittedPeerInvestigationQueue:
      vi.fn(),
  })
);

const mockedCreateTypedEvidence =
  vi.mocked(
    createTypedIntelligenceEvidence
  );

const mockedEvaluatePeerEligibility =
  vi.mocked(
    evaluatePeerEligibility
  );

const mockedBuildQueue =
  vi.mocked(
    buildAdmittedPeerInvestigationQueue
  );

const leftOperationalAdmission = {
  status:
    "ADMITTED",
} as never;

const rightOperationalAdmission = {
  status:
    "ADMITTED",
} as never;

const leftHistoricalAdmission = {
  status:
    "ADMITTED",
} as never;

const rightHistoricalAdmission = {
  status:
    "ADMITTED",
} as never;

const eligiblePeer = {
  status:
    "ELIGIBLE",

  leftCompanyId:
    "COMPANY-A",

  rightCompanyId:
    "COMPANY-B",

  sharedCommodities: [
    "COAL",
  ],

  leftCommodityEvidence:
    {} as never,

  rightCommodityEvidence:
    {} as never,

  descriptiveEvidence: {
    left: {
      companyType: [],
      keyOperation: [],
      activities: [],
    },

    right: {
      companyType: [],
      keyOperation: [],
      activities: [],
    },
  },

  issues: [],

  causalConclusion:
    "UNKNOWN",
} as const;

const investigationCase = {
  caseId:
    "CASE-001",
} as never;

function createInput() {
  return {
    leftCompanyId:
      "COMPANY-A",

    rightCompanyId:
      "COMPANY-B",

    leftOperationalAdmission,

    rightOperationalAdmission,

    leftHistoricalAdmission,

    rightHistoricalAdmission,
  };
}

describe(
  "selectAdmittedPeerInvestigationCase",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mockedCreateTypedEvidence
        .mockReturnValueOnce([
          {
            kind:
              "OPERATIONAL_FACT",

            scope:
              "OPERATIONAL",

            companyId:
              "COMPANY-A",

            fact:
              "commodityTypes",

            sourceField:
              "commodity_types",

            value: [
              "COAL",
            ],

            evidence: [],

            truthClass:
              "SOURCE_FACT",
          },
        ] as never)
        .mockReturnValueOnce([
          {
            kind:
              "OPERATIONAL_FACT",

            scope:
              "OPERATIONAL",

            companyId:
              "COMPANY-B",

            fact:
              "commodityTypes",

            sourceField:
              "commodity_types",

            value: [
              "COAL",
            ],

            evidence: [],

            truthClass:
              "SOURCE_FACT",
          },
        ] as never);

      mockedEvaluatePeerEligibility
        .mockReturnValue(
          eligiblePeer as never
        );

      mockedBuildQueue
        .mockReturnValue({
          cases: [
            investigationCase,
          ],
        } as never);
    });

    it(
      "selects the first canonical ranked investigation case",
      () => {
        const result =
          selectAdmittedPeerInvestigationCase(
            createInput()
          );

        expect(
          result
        ).toMatchObject({
          status:
            "SELECTED",

          investigationCase,

          peerEligibility:
            eligiblePeer,

          causalConclusion:
            "UNKNOWN",

          issues: [],
        });

        expect(
          mockedCreateTypedEvidence
        ).toHaveBeenNthCalledWith(
          1,
          {
            kind:
              "OPERATIONAL",

            admission:
              leftOperationalAdmission,
          }
        );

        expect(
          mockedCreateTypedEvidence
        ).toHaveBeenNthCalledWith(
          2,
          {
            kind:
              "OPERATIONAL",

            admission:
              rightOperationalAdmission,
          }
        );

        expect(
          mockedEvaluatePeerEligibility
        ).toHaveBeenCalledWith({
          leftCompanyId:
            "COMPANY-A",

          rightCompanyId:
            "COMPANY-B",

          evidence:
            expect.any(
              Array
            ),
        });

        expect(
          mockedBuildQueue
        ).toHaveBeenCalledWith({
          leftAdmission:
            leftHistoricalAdmission,

          rightAdmission:
            rightHistoricalAdmission,

          peerEligibility:
            eligiblePeer,
        });
      }
    );

    it(
      "rejects before queue construction when peer eligibility fails",
      () => {
        mockedEvaluatePeerEligibility
          .mockReturnValue({
            ...eligiblePeer,

            status:
              "REJECTED",

            sharedCommodities:
              [],

            issues: [
              "NO_SHARED_COMMODITY",
            ],
          } as never);

        const result =
          selectAdmittedPeerInvestigationCase(
            createInput()
          );

        expect(
          result
        ).toMatchObject({
          status:
            "REJECTED",

          investigationCase:
            null,

          queue:
            null,

          issues: [
            "NO_SHARED_COMMODITY",
          ],

          causalConclusion:
            "UNKNOWN",
        });

        expect(
          mockedBuildQueue
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "rejects when historical evidence has not passed admission",
      () => {
        const result =
          selectAdmittedPeerInvestigationCase({
            ...createInput(),

            leftHistoricalAdmission: {
              status:
                "REJECTED",
            } as never,
          });

        expect(
          result
        ).toMatchObject({
          status:
            "REJECTED",

          investigationCase:
            null,

          queue:
            null,

          issues: [
            "LEFT_HISTORICAL_EVIDENCE_NOT_ADMITTED",
          ],

          causalConclusion:
            "UNKNOWN",
        });

        expect(
          mockedBuildQueue
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "rejects when deterministic ranking produces no investigation case",
      () => {
        mockedBuildQueue
          .mockReturnValue({
            cases: [],
          } as never);

        const result =
          selectAdmittedPeerInvestigationCase(
            createInput()
          );

        expect(
          result
        ).toMatchObject({
          status:
            "REJECTED",

          investigationCase:
            null,

          issues: [
            "NO_CANONICAL_PEER_INVESTIGATION_CASE",
          ],

          causalConclusion:
            "UNKNOWN",
        });
      }
    );
  }
);