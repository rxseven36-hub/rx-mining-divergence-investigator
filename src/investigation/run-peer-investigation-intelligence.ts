import type {
  SectorsAdapter,
} from "../data/sectors/sectors-adapter";

import type {
  RXCompany,
} from "../types/company";

import type {
  LLMProvider,
} from "./llm-provider";

import type {
  RXPeerInvestigationCase,
} from "./peer-investigation-case";

import type {
  RXPeerInvestigationPlan,
} from "./peer-investigation-plan";

import {
  createPeerInvestigationPlan,
} from "./create-peer-investigation-plan";

import type {
  RXPeerInvestigationTargetContexts,
  RXPeerTargetContextResolutionIssue,
} from "./resolve-peer-investigation-target-contexts";

import {
  resolvePeerInvestigationTargetContexts,
} from "./resolve-peer-investigation-target-contexts";

import type {
  RXPreparedPeerInvestigationRequests,
} from "./prepare-peer-investigation-requests";

import {
  preparePeerInvestigationRequests,
} from "./prepare-peer-investigation-requests";

import type {
  RXResolvedPeerExecutionContexts,
} from "./resolve-peer-execution-contexts";

import {
  resolvePeerExecutionContexts,
} from "./resolve-peer-execution-contexts";

import type {
  RXExecutedPeerInvestigationRequests,
} from "./execute-resolved-peer-investigation-requests";

import {
  executeResolvedPeerInvestigationRequests,
} from "./execute-resolved-peer-investigation-requests";

import type {
  RXAdmittedPeerInvestigationEvidence,
} from "./extract-admitted-peer-investigation-evidence";

import {
  extractAdmittedPeerInvestigationEvidence,
} from "./extract-admitted-peer-investigation-evidence";

import type {
  RXContextBoundPeerInvestigationEvidence,
} from "./bind-admitted-peer-investigation-evidence-contexts";

import {
  bindAdmittedPeerInvestigationEvidenceContexts,
} from "./bind-admitted-peer-investigation-evidence-contexts";

import type {
  RXPeerInvestigationEvidenceContext,
} from "./create-peer-investigation-evidence-context";

import {
  createPeerInvestigationEvidenceContext,
} from "./create-peer-investigation-evidence-context";

import type {
  RXEvidenceBoundedIntelligenceSynthesisRunResult,
} from "../intelligence/synthesis/run-evidence-bounded-intelligence-synthesis";

import {
  runEvidenceBoundedIntelligenceSynthesis,
} from "../intelligence/synthesis/run-evidence-bounded-intelligence-synthesis";

export interface RXPeerInvestigationIntelligenceRunInput {
  adapter:
    SectorsAdapter;

  provider:
    LLMProvider;

  investigationCase:
    RXPeerInvestigationCase;

  firstCompany:
    RXCompany;

  secondCompany:
    RXCompany;

  retrievedAt?:
    string;
}

interface RXPeerInvestigationIntelligenceArtifacts {
  plan:
    RXPeerInvestigationPlan;

  targetContexts:
    RXPeerInvestigationTargetContexts | null;

  prepared:
    RXPreparedPeerInvestigationRequests | null;

  resolved:
    RXResolvedPeerExecutionContexts | null;

  execution:
    RXExecutedPeerInvestigationRequests | null;

  admittedEvidence:
    RXAdmittedPeerInvestigationEvidence | null;

  boundEvidence:
    RXContextBoundPeerInvestigationEvidence | null;

  evidenceContext:
    RXPeerInvestigationEvidenceContext | null;

  synthesis:
    RXEvidenceBoundedIntelligenceSynthesisRunResult | null;

  causalConclusion:
    "UNKNOWN";
}

export type RXPeerInvestigationIntelligenceRunResult =
  | (
      RXPeerInvestigationIntelligenceArtifacts & {
        status:
          "ACCEPTED";

        stage:
          "COMPLETE";

        targetContexts:
          RXPeerInvestigationTargetContexts;

        prepared:
          RXPreparedPeerInvestigationRequests;

        resolved:
          RXResolvedPeerExecutionContexts;

        execution:
          RXExecutedPeerInvestigationRequests;

        admittedEvidence:
          RXAdmittedPeerInvestigationEvidence;

        boundEvidence:
          Extract<
            RXContextBoundPeerInvestigationEvidence,
            {
              status:
                "BOUND";
            }
          >;

        evidenceContext:
          RXPeerInvestigationEvidenceContext;

        synthesis:
          Extract<
            RXEvidenceBoundedIntelligenceSynthesisRunResult,
            {
              status:
                "ACCEPTED";
            }
          >;

        issues:
          [];
      }
    )
  | (
      RXPeerInvestigationIntelligenceArtifacts & {
        status:
          "REJECTED";

        stage:
          "TARGET_CONTEXTS";

        targetContexts:
          null;

        prepared:
          null;

        resolved:
          null;

        execution:
          null;

        admittedEvidence:
          null;

        boundEvidence:
          null;

        evidenceContext:
          null;

        synthesis:
          null;

        issues:
          RXPeerTargetContextResolutionIssue[];
      }
    )
  | (
      RXPeerInvestigationIntelligenceArtifacts & {
        status:
          "REJECTED";

        stage:
          "EVIDENCE_BINDING";

        targetContexts:
          RXPeerInvestigationTargetContexts;

        prepared:
          RXPreparedPeerInvestigationRequests;

        resolved:
          RXResolvedPeerExecutionContexts;

        execution:
          RXExecutedPeerInvestigationRequests;

        admittedEvidence:
          RXAdmittedPeerInvestigationEvidence;

        boundEvidence:
          Extract<
            RXContextBoundPeerInvestigationEvidence,
            {
              status:
                "REJECTED";
            }
          >;

        evidenceContext:
          null;

        synthesis:
          null;

        issues:
          Extract<
            RXContextBoundPeerInvestigationEvidence,
            {
              status:
                "REJECTED";
            }
          >["rejections"];
      }
    )
  | (
      RXPeerInvestigationIntelligenceArtifacts & {
        status:
          "REJECTED";

        stage:
          "EVIDENCE_CONTEXT";

        targetContexts:
          RXPeerInvestigationTargetContexts;

        prepared:
          RXPreparedPeerInvestigationRequests;

        resolved:
          RXResolvedPeerExecutionContexts;

        execution:
          RXExecutedPeerInvestigationRequests;

        admittedEvidence:
          RXAdmittedPeerInvestigationEvidence;

        boundEvidence:
          Extract<
            RXContextBoundPeerInvestigationEvidence,
            {
              status:
                "BOUND";
            }
          >;

        evidenceContext:
          null;

        synthesis:
          null;

        issues: [
          "PEER_EVIDENCE_CONTEXT_NOT_BOUND",
        ];
      }
    )
  | (
      RXPeerInvestigationIntelligenceArtifacts & {
        status:
          "REJECTED";

        stage:
          "SYNTHESIS";

        targetContexts:
          RXPeerInvestigationTargetContexts;

        prepared:
          RXPreparedPeerInvestigationRequests;

        resolved:
          RXResolvedPeerExecutionContexts;

        execution:
          RXExecutedPeerInvestigationRequests;

        admittedEvidence:
          RXAdmittedPeerInvestigationEvidence;

        boundEvidence:
          Extract<
            RXContextBoundPeerInvestigationEvidence,
            {
              status:
                "BOUND";
            }
          >;

        evidenceContext:
          RXPeerInvestigationEvidenceContext;

        synthesis:
          Extract<
            RXEvidenceBoundedIntelligenceSynthesisRunResult,
            {
              status:
                "REJECTED";
            }
          >;

        issues:
          Extract<
            RXEvidenceBoundedIntelligenceSynthesisRunResult,
            {
              status:
                "REJECTED";
            }
          >["issues"];
      }
    );

/**
 * Canonical application-facing orchestration boundary for
 * one already-selected peer divergence investigation case.
 *
 * Existing locked RX boundaries remain authoritative:
 *
 * peer case
 * -> deterministic investigation plan
 * -> canonical target contexts
 * -> prepared Sectors requests
 * -> canonical execution routing
 * -> Sectors execution
 * -> admitted evidence extraction
 * -> canonical evidence identity binding
 * -> peer evidence context
 * -> evidence-bounded intelligence synthesis
 *
 * This function deliberately does NOT:
 * - detect or score divergence,
 * - select or rank peer cases,
 * - reimplement Sectors request execution,
 * - re-admit evidence,
 * - repair canonical identity,
 * - call LLM provider methods directly,
 * - establish causality.
 *
 * Runtime/API/provider failures intentionally propagate.
 */
export async function runPeerInvestigationIntelligence(
  input:
    RXPeerInvestigationIntelligenceRunInput
): Promise<
  RXPeerInvestigationIntelligenceRunResult
> {
  const plan =
    createPeerInvestigationPlan(
      input.investigationCase
    );

  const targetResolution =
    resolvePeerInvestigationTargetContexts(
      input.investigationCase,
      input.firstCompany,
      input.secondCompany
    );

  if (
    targetResolution.status ===
    "REJECTED"
  ) {
    return {
      status:
        "REJECTED",

      stage:
        "TARGET_CONTEXTS",

      plan,

      targetContexts:
        null,

      prepared:
        null,

      resolved:
        null,

      execution:
        null,

      admittedEvidence:
        null,

      boundEvidence:
        null,

      evidenceContext:
        null,

      synthesis:
        null,

      issues:
        targetResolution.issues,

      causalConclusion:
        "UNKNOWN",
    };
  }

  const targetContexts =
    targetResolution.contexts;

  const prepared =
    preparePeerInvestigationRequests(
      plan,
      targetContexts
    );

  const resolved =
    resolvePeerExecutionContexts(
      prepared,
      targetContexts
    );

  const execution =
    await executeResolvedPeerInvestigationRequests(
      input.adapter,
      resolved,
      input.retrievedAt
    );

  const admittedEvidence =
    extractAdmittedPeerInvestigationEvidence(
      execution
    );

  const boundEvidence =
    bindAdmittedPeerInvestigationEvidenceContexts(
      admittedEvidence,
      targetContexts
    );

  if (
    boundEvidence.status ===
    "REJECTED"
  ) {
    return {
      status:
        "REJECTED",

      stage:
        "EVIDENCE_BINDING",

      plan,

      targetContexts,

      prepared,

      resolved,

      execution,

      admittedEvidence,

      boundEvidence,

      evidenceContext:
        null,

      synthesis:
        null,

      issues:
        boundEvidence.rejections,

      causalConclusion:
        "UNKNOWN",
    };
  }

  const contextResult =
    createPeerInvestigationEvidenceContext(
      boundEvidence
    );

  /*
   * A BOUND canonical evidence set should produce a context.
   * Keep this explicit boundary nevertheless rather than
   * asserting across an established domain contract.
   */
  if (
    contextResult.status ===
    "REJECTED"
  ) {
    return {
      status:
        "REJECTED",

      stage:
        "EVIDENCE_CONTEXT",

      plan,

      targetContexts,

      prepared,

      resolved,

      execution,

      admittedEvidence,

      boundEvidence,

      evidenceContext:
        null,

      synthesis:
        null,

      issues: [
        contextResult.issue,
      ],

      causalConclusion:
        "UNKNOWN",
    };
  }

  const evidenceContext =
    contextResult.context;

  const synthesis =
    await runEvidenceBoundedIntelligenceSynthesis(
      input.provider,
      evidenceContext
    );

  if (
    synthesis.status ===
    "REJECTED"
  ) {
    return {
      status:
        "REJECTED",

      stage:
        "SYNTHESIS",

      plan,

      targetContexts,

      prepared,

      resolved,

      execution,

      admittedEvidence,

      boundEvidence,

      evidenceContext,

      synthesis,

      issues:
        synthesis.issues,

      causalConclusion:
        "UNKNOWN",
    };
  }

  return {
    status:
      "ACCEPTED",

    stage:
      "COMPLETE",

    plan,

    targetContexts,

    prepared,

    resolved,

    execution,

    admittedEvidence,

    boundEvidence,

    evidenceContext,

    synthesis,

    issues: [],

    causalConclusion:
      "UNKNOWN",
  };
}
