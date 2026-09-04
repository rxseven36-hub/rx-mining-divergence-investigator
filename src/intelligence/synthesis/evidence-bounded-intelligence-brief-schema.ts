import {
  z,
} from "zod";

/**
 * Runtime shape for an evidence reference emitted by an
 * intelligence brief.
 *
 * This schema validates structure only.
 * Evidence existence, request lineage, and permission within the
 * validated hypothesis/challenge reasoning chain belong to a later
 * deterministic validation boundary.
 */
export const RXIntelligenceBriefEvidenceReferenceSchema =
  z.object({
    evidenceId:
      z.string()
        .min(1),

    requestId:
      z.string()
        .min(1),
  }).strict();

/**
 * Runtime boundary for untrusted intelligence-brief output.
 *
 * This schema establishes structural validity only.
 * It does NOT establish that:
 * - caseId or planId match the originating evidence pack,
 * - hypothesisId matches the validated hypothesis,
 * - challengeId matches the validated challenge,
 * - referenced evidence exists,
 * - request lineage is valid,
 * - evidence references belong to the trusted reasoning chain,
 * - evidence references are unique,
 * - narrative fields are factually correct,
 * - causality is proven.
 */
export const RXEvidenceBoundedIntelligenceBriefSchema =
  z.object({
    caseId:
      z.string()
        .min(1),

    planId:
      z.string()
        .min(1),

    briefId:
      z.string()
        .min(1),

    hypothesisId:
      z.string()
        .min(1),

    challengeId:
      z.string()
        .min(1),

    executiveSummary:
      z.string()
        .trim()
        .min(1),

    evidenceReferences:
      z.array(
        RXIntelligenceBriefEvidenceReferenceSchema
      ),

    alternativeExplanations:
      z.array(
        z.string()
          .trim()
          .min(1)
      ),

    uncertainties:
      z.array(
        z.string()
          .trim()
          .min(1)
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
