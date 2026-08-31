import {
  z,
} from "zod";

export const RXAIInvestigationActionSchema =
  z.object({
    requestId:
      z.string().min(1),

    priority:
      z.number()
        .int()
        .positive(),

    rationale:
      z.string()
        .trim()
        .min(1),
  }).strict();

export const RXAIInvestigatorDecisionSchema =
  z.object({
    caseId:
      z.string().min(1),

    planId:
      z.string().min(1),

    actions:
      z.array(
        RXAIInvestigationActionSchema
      ),

    unresolvedUnknowns:
      z.array(
        z.string()
          .trim()
          .min(1)
      ),

    causalConclusion:
      z.literal("UNKNOWN"),
  }).strict();