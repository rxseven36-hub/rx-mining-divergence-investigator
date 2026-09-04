import { z } from "zod";

export const RXHypothesisChallengeEvidenceReferenceSchema =
  z.object({
    evidenceId:
      z.string()
        .min(1),

    requestId:
      z.string()
        .min(1),
  }).strict();

export const RXEvidenceBoundedHypothesisChallengeSchema =
  z.object({
    caseId:
      z.string()
        .min(1),

    planId:
      z.string()
        .min(1),

    hypothesisId:
      z.string()
        .min(1),

    challengeId:
      z.string()
        .min(1),

    critique:
      z.string()
        .trim()
        .min(1),

    challengingEvidence:
      z.array(
        RXHypothesisChallengeEvidenceReferenceSchema
      ),

    unresolvedConcerns:
      z.array(
        z.string()
          .trim()
          .min(1)
      ),

    causalConclusion:
      z.literal("UNKNOWN"),
  }).strict();
