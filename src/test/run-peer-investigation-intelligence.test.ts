import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  RXCompany,
} from "../types/company";

import type {
  RXPeerInvestigationCase,
} from "../investigation/peer-investigation-case";

import type {
  SectorsAdapter,
} from "../data/sectors/sectors-adapter";

import type {
  LLMProvider,
} from "../investigation/llm-provider";

vi.mock(
  "../investigation/create-peer-investigation-plan",
  () => ({
    createPeerInvestigationPlan:
      vi.fn(),
  })
);

vi.mock(
  "../investigation/resolve-peer-investigation-target-contexts",
  () => ({
    resolvePeerInvestigationTargetContexts:
      vi.fn(),
  })
);

vi.mock(
  "../investigation/prepare-peer-investigation-requests",
  () => ({
    preparePeerInvestigationRequests:
      vi.fn(),
  })
);

vi.mock(
  "../investigation/resolve-peer-execution-contexts",
  () => ({
    resolvePeerExecutionContexts:
      vi.fn(),
  })
);

vi.mock(
  "../investigation/execute-resolved-peer-investigation-requests",
  () => ({
    executeResolvedPeerInvestigationRequests:
      vi.fn(),
  })
);

vi.mock(
  "../investigation/extract-admitted-peer-investigation-evidence",
  () => ({
    extractAdmittedPeerInvestigationEvidence:
      vi.fn(),
  })
);

vi.mock(
  "../investigation/bind-admitted-peer-investigation-evidence-contexts",
  () => ({
    bindAdmittedPeerInvestigationEvidenceContexts:
      vi.fn(),
  })
);

vi.mock(
  "../investigation/create-peer-investigation-evidence-context",
  () => ({
    createPeerInvestigationEvidenceContext:
      vi.fn(),
  })
);

vi.mock(
  "../intelligence/synthesis/run-evidence-bounded-intelligence-synthesis",
  () => ({
    runEvidenceBoundedIntelligenceSynthesis:
      vi.fn(),
  })
);

import {
  createPeerInvestigationPlan,
} from "../investigation/create-peer-investigation-plan";

import {
  resolvePeerInvestigationTargetContexts,
} from "../investigation/resolve-peer-investigation-target-contexts";

import {
  preparePeerInvestigationRequests,
} from "../investigation/prepare-peer-investigation-requests";

import {
  resolvePeerExecutionContexts,
} from "../investigation/resolve-peer-execution-contexts";

import {
  executeResolvedPeerInvestigationRequests,
} from "../investigation/execute-resolved-peer-investigation-requests";

import {
  extractAdmittedPeerInvestigationEvidence,
} from "../investigation/extract-admitted-peer-investigation-evidence";

import {
  bindAdmittedPeerInvestigationEvidenceContexts,
} from "../investigation/bind-admitted-peer-investigation-evidence-contexts";

import {
  createPeerInvestigationEvidenceContext,
} from "../investigation/create-peer-investigation-evidence-context";

import {
  runEvidenceBoundedIntelligenceSynthesis,
} from "../intelligence/synthesis/run-evidence-bounded-intelligence-synthesis";

import {
  runPeerInvestigationIntelligence,
} from "../investigation/run-peer-investigation-intelligence";

const mockedPlan =
  vi.mocked(
    createPeerInvestigationPlan
  );

const mockedTargetResolution =
  vi.mocked(
    resolvePeerInvestigationTargetContexts
  );

const mockedPrepare =
  vi.mocked(
    preparePeerInvestigationRequests
  );

const mockedResolveExecution =
  vi.mocked(
    resolvePeerExecutionContexts
  );

const mockedExecute =
  vi.mocked(
    executeResolvedPeerInvestigationRequests
  );

const mockedExtract =
  vi.mocked(
    extractAdmittedPeerInvestigationEvidence
  );

const mockedBind =
  vi.mocked(
    bindAdmittedPeerInvestigationEvidenceContexts
  );

const mockedCreateContext =
  vi.mocked(
    createPeerInvestigationEvidenceContext
  );

const mockedSynthesis =
  vi.mocked(
    runEvidenceBoundedIntelligenceSynthesis
  );

const investigationCase =
  {
    caseId:
      "CASE-001",
  } as RXPeerInvestigationCase;

const firstCompany:
  RXCompany = {
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
  };

const secondCompany:
  RXCompany = {
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
  };

const adapter =
  {
    requestJson:
      vi.fn(),
  } as SectorsAdapter;

const provider =
  {
    investigate:
      vi.fn(),

    proposeHypothesis:
      vi.fn(),

    challengeHypothesis:
      vi.fn(),

    synthesizeBrief:
      vi.fn(),
  } as LLMProvider;

function arrangeAcceptedChain() {
  const plan =
    {
      planId:
        "PLAN-001",

      caseId:
        "CASE-001",
    } as never;

  const targetContexts =
    {
      firstCompany: {
        companyId:
          "COMPANY-A",
      },

      secondCompany: {
        companyId:
          "COMPANY-B",
      },

      shared: {},
    } as never;

  const prepared =
    {
      planId:
        "PLAN-001",

      caseId:
        "CASE-001",
    } as never;

  const resolved =
    {
      planId:
        "PLAN-001",

      caseId:
        "CASE-001",
    } as never;

  const execution =
    {
      planId:
        "PLAN-001",

      caseId:
        "CASE-001",
    } as never;

  const admittedEvidence =
    {
      planId:
        "PLAN-001",

      caseId:
        "CASE-001",
    } as never;

  const boundEvidence =
    {
      status:
        "BOUND",

      planId:
        "PLAN-001",

      caseId:
        "CASE-001",

      evidence: [],

      boundCount:
        0,

      rejections: [],

      causalConclusion:
        "UNKNOWN",
    } as never;

  const evidenceContext =
    {
      planId:
        "PLAN-001",

      caseId:
        "CASE-001",

      firstCompany: [],

      secondCompany: [],

      shared: [],

      evidenceCount:
        1,

      causalConclusion:
        "UNKNOWN",
    } as never;

  const synthesis =
    {
      status:
        "ACCEPTED",

      stage:
        "COMPLETE",

      evidencePack: {},

      hypothesis: {},

      challenge: {},

      brief: {},

      issues: [],

      causalConclusion:
        "UNKNOWN",
    } as never;

  mockedPlan.mockReturnValue(
    plan
  );

  mockedTargetResolution.mockReturnValue({
    status:
      "RESOLVED",

    contexts:
      targetContexts,

    issues: [],
  });

  mockedPrepare.mockReturnValue(
    prepared
  );

  mockedResolveExecution.mockReturnValue(
    resolved
  );

  mockedExecute.mockResolvedValue(
    execution
  );

  mockedExtract.mockReturnValue(
    admittedEvidence
  );

  mockedBind.mockReturnValue(
    boundEvidence
  );

  mockedCreateContext.mockReturnValue({
    status:
      "CREATED",

    context:
      evidenceContext,

    issue:
      null,
  });

  mockedSynthesis.mockResolvedValue(
    synthesis
  );

  return {
    plan,
    targetContexts,
    prepared,
    resolved,
    execution,
    admittedEvidence,
    boundEvidence,
    evidenceContext,
    synthesis,
  };
}

describe(
  "runPeerInvestigationIntelligence",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it(
      "composes the canonical peer investigation and synthesis boundaries in order",
      async () => {
        const chain =
          arrangeAcceptedChain();

        const result =
          await runPeerInvestigationIntelligence({
            adapter,
            provider,
            investigationCase,
            firstCompany,
            secondCompany,
            retrievedAt:
              "2026-09-05T02:30:00.000Z",
          });

        expect(
          mockedPlan
        ).toHaveBeenCalledWith(
          investigationCase
        );

        expect(
          mockedTargetResolution
        ).toHaveBeenCalledWith(
          investigationCase,
          firstCompany,
          secondCompany
        );

        expect(
          mockedPrepare
        ).toHaveBeenCalledWith(
          chain.plan,
          chain.targetContexts
        );

        expect(
          mockedResolveExecution
        ).toHaveBeenCalledWith(
          chain.prepared,
          chain.targetContexts
        );

        expect(
          mockedExecute
        ).toHaveBeenCalledWith(
          adapter,
          chain.resolved,
          "2026-09-05T02:30:00.000Z"
        );

        expect(
          mockedExtract
        ).toHaveBeenCalledWith(
          chain.execution
        );

        expect(
          mockedBind
        ).toHaveBeenCalledWith(
          chain.admittedEvidence,
          chain.targetContexts
        );

        expect(
          mockedCreateContext
        ).toHaveBeenCalledWith(
          chain.boundEvidence
        );

        expect(
          mockedSynthesis
        ).toHaveBeenCalledWith(
          provider,
          chain.evidenceContext
        );

        expect(result).toMatchObject({
          status:
            "ACCEPTED",

          stage:
            "COMPLETE",

          synthesis:
            chain.synthesis,

          causalConclusion:
            "UNKNOWN",

          issues: [],
        });
      }
    );

    it(
      "fails before request preparation when canonical target contexts reject",
      async () => {
        mockedPlan.mockReturnValue({
          planId:
            "PLAN-001",
        } as never);

        mockedTargetResolution.mockReturnValue({
          status:
            "REJECTED",

          contexts:
            null,

          issues: [
            "FIRST_COMPANY_ID_MISMATCH",
          ],
        });

        const result =
          await runPeerInvestigationIntelligence({
            adapter,
            provider,
            investigationCase,
            firstCompany,
            secondCompany,
          });

        expect(result).toMatchObject({
          status:
            "REJECTED",

          stage:
            "TARGET_CONTEXTS",

          issues: [
            "FIRST_COMPANY_ID_MISMATCH",
          ],
        });

        expect(
          mockedPrepare
        ).not.toHaveBeenCalled();

        expect(
          mockedExecute
        ).not.toHaveBeenCalled();

        expect(
          mockedSynthesis
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "stops before evidence context and AI synthesis when canonical evidence binding rejects",
      async () => {
        arrangeAcceptedChain();

        mockedBind.mockReturnValue({
          status:
            "REJECTED",

          planId:
            "PLAN-001",

          caseId:
            "CASE-001",

          evidence: [],

          boundCount:
            0,

          rejections: [
            {
              requestId:
                "REQ-001",

              target:
                "FIRST_COMPANY",

              issue:
                "FIRST_COMPANY_ID_MISMATCH",
            },
          ],

          causalConclusion:
            "UNKNOWN",
        });

        const result =
          await runPeerInvestigationIntelligence({
            adapter,
            provider,
            investigationCase,
            firstCompany,
            secondCompany,
          });

        expect(result).toMatchObject({
          status:
            "REJECTED",

          stage:
            "EVIDENCE_BINDING",
        });

        expect(
          mockedCreateContext
        ).not.toHaveBeenCalled();

        expect(
          mockedSynthesis
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "preserves the complete deterministic investigation chain when synthesis rejects",
      async () => {
        const chain =
          arrangeAcceptedChain();

        mockedSynthesis.mockResolvedValue({
          status:
            "REJECTED",

          stage:
            "EVIDENCE_PACK",

          evidencePack:
            null,

          hypothesis:
            null,

          challenge:
            null,

          brief:
            null,

          issues: [
            "PEER_EVIDENCE_CONTEXT_EMPTY",
          ],

          causalConclusion:
            "UNKNOWN",
        });

        const result =
          await runPeerInvestigationIntelligence({
            adapter,
            provider,
            investigationCase,
            firstCompany,
            secondCompany,
          });

        expect(result).toMatchObject({
          status:
            "REJECTED",

          stage:
            "SYNTHESIS",

          plan:
            chain.plan,

          targetContexts:
            chain.targetContexts,

          prepared:
            chain.prepared,

          resolved:
            chain.resolved,

          execution:
            chain.execution,

          admittedEvidence:
            chain.admittedEvidence,

          boundEvidence:
            chain.boundEvidence,

          evidenceContext:
            chain.evidenceContext,

          issues: [
            "PEER_EVIDENCE_CONTEXT_EMPTY",
          ],

          causalConclusion:
            "UNKNOWN",
        });
      }
    );

    it(
      "propagates Sectors execution runtime failures",
      async () => {
        arrangeAcceptedChain();

        mockedExecute.mockRejectedValue(
          new Error(
            "SECTORS_RUNTIME_FAILURE"
          )
        );

        await expect(
          runPeerInvestigationIntelligence({
            adapter,
            provider,
            investigationCase,
            firstCompany,
            secondCompany,
          })
        ).rejects.toThrow(
          "SECTORS_RUNTIME_FAILURE"
        );

        expect(
          mockedExtract
        ).not.toHaveBeenCalled();

        expect(
          mockedSynthesis
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "propagates provider runtime failures",
      async () => {
        arrangeAcceptedChain();

        mockedSynthesis.mockRejectedValue(
          new Error(
            "PROVIDER_RUNTIME_FAILURE"
          )
        );

        await expect(
          runPeerInvestigationIntelligence({
            adapter,
            provider,
            investigationCase,
            firstCompany,
            secondCompany,
          })
        ).rejects.toThrow(
          "PROVIDER_RUNTIME_FAILURE"
        );
      }
    );
  }
);
