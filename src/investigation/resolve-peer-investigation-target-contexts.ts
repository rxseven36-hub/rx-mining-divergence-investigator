import type {
  RXCompany,
} from "../types/company";

import type {
  RXInvestigationOperationContext,
} from "./bind-operation-request";

import type {
  RXPeerInvestigationCase,
} from "./peer-investigation-case";

export type RXPeerTargetContextResolutionIssue =
  | "FIRST_COMPANY_ID_MISMATCH"
  | "SECOND_COMPANY_ID_MISMATCH"
  | "COMMODITY_MISSING";

export interface RXPeerInvestigationTargetContexts {
  firstCompany:
    RXInvestigationOperationContext;

  secondCompany:
    RXInvestigationOperationContext;

  shared:
    Pick<
      RXInvestigationOperationContext,
      "commodity" | "period"
    >;
}

export type RXPeerTargetContextResolutionResult =
  | {
      status: "RESOLVED";

      contexts:
        RXPeerInvestigationTargetContexts;

      issues: [];
    }
  | {
      status: "REJECTED";

      contexts: null;

      issues:
        RXPeerTargetContextResolutionIssue[];
    };

/**
 * Resolves trusted RX company identities into the
 * operation contexts required by a canonical peer case.
 *
 * IMPORTANT:
 * - companyId is never converted into sectorsSlug.
 * - companyId is never converted into ticker.
 * - missing runtime identities remain missing.
 * - missing canonical commodity rejects resolution.
 * - no request is bound or executed here.
 * - no API or LLM call occurs here.
 */
export function resolvePeerInvestigationTargetContexts(
  investigationCase:
    RXPeerInvestigationCase,
  firstCompany:
    RXCompany,
  secondCompany:
    RXCompany
): RXPeerTargetContextResolutionResult {
  const issues:
    RXPeerTargetContextResolutionIssue[] =
      [];

  if (
    firstCompany.id !==
    investigationCase.subject.firstCompanyId
  ) {
    issues.push(
      "FIRST_COMPANY_ID_MISMATCH"
    );
  }

  if (
    secondCompany.id !==
    investigationCase.subject.secondCompanyId
  ) {
    issues.push(
      "SECOND_COMPANY_ID_MISMATCH"
    );
  }

  if (
    investigationCase.commodity ===
    null
  ) {
    issues.push(
      "COMMODITY_MISSING"
    );
  }

  if (issues.length > 0) {
    return {
      status: "REJECTED",
      contexts: null,
      issues,
    };
  }

  /*
   * Commodity has been explicitly validated above.
   * The additional local guard keeps TypeScript narrowing
   * aligned with the deterministic rejection boundary.
   */
  const commodity =
    investigationCase.commodity;

  if (commodity === null) {
    return {
      status: "REJECTED",
      contexts: null,
      issues: [
        "COMMODITY_MISSING",
      ],
    };
  }

  /*
   * Comparable peer observations are required upstream to
   * have fully aligned canonical periods. Therefore the
   * canonical left period is safe to reuse as the shared
   * investigation period.
   */
  const period =
    investigationCase.leftPeriod;

  return {
    status: "RESOLVED",

    contexts: {
      firstCompany: {
        companyId:
          firstCompany.id,

        sectorsSlug:
          firstCompany.sectorsSlug,

        ticker:
          firstCompany.symbol,

        commodity,

        period,
      },

      secondCompany: {
        companyId:
          secondCompany.id,

        sectorsSlug:
          secondCompany.sectorsSlug,

        ticker:
          secondCompany.symbol,

        commodity,

        period,
      },

      shared: {
        commodity,
        period,
      },
    },

    issues: [],
  };
}