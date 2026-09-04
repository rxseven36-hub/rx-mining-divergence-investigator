import {
  z,
} from "zod";

/**
 * Runtime shape for a reference from an AI-proposed hypothesis
 * back to evidence exposed through the intelligence pack.
 *
 * This schema validates structure only.
 * Evidence existence and request lineage belong to a later
 * deterministic validation boundary.
 */
export const RXHypothesisEvidenceReferenceSchema =
  z.object({
    evidenceId:
      z.string()
        .min(1),

    requestId:
      z.string()
        .min(1),
  }).strict();

/**
 * Runtime boundary for untrusted hypothesis output.
 *
 * This schema establishes structural validity only.
 * It does NOT establish that:
 * - caseId or planId match the originating evidence pack,
 * - referenced evidence exists,
 * - request lineage is valid,
 * - supporting/counter references are unique or disjoint,
 * - the hypothesis is factually correct,
 * - causality has been established.
 */
export const RXEvidenceBoundedHypothesisSchema =
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

    statement:
      z.string()
        .trim()
        .min(1),

    supportingEvidence:
      z.array(
        RXHypothesisEvidenceReferenceSchema
      ),

    counterEvidence:
      z.array(
        RXHypothesisEvidenceReferenceSchema
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

    causalConclusion:
      z.literal("UNKNOWN"),
  }).strict();
