import type {
  RXPeerDivergencePriorityResult,
} from "../priority/peer-divergence-priority";

import {
  createPeerPairIdentity,
} from "./peer-pair-identity";

export interface RXPeerComparisonIdentityPeriod {
  kind:
    RXPeerDivergencePriorityResult["leftPeriod"]["kind"];

  start?:
    string;

  end?:
    string;

  year?:
    number;

  quarter?:
    number;

  month?:
    number;

  measurementYear?:
    number;
}

export interface RXPeerComparisonIdentity {
  pairKey:
    string;

  firstCompanyId:
    string;

  secondCompanyId:
    string;

  metric:
    RXPeerDivergencePriorityResult["metric"];

  commodity:
    RXPeerDivergencePriorityResult["commodity"];

  commoditySubtype:
    RXPeerDivergencePriorityResult["leftCommoditySubtype"];

  period:
    RXPeerComparisonIdentityPeriod;

  key:
    string;
}

function canonicalPeriod(
  priority:
    RXPeerDivergencePriorityResult
): RXPeerComparisonIdentityPeriod {
  return {
    kind:
      priority.leftPeriod.kind,

    start:
      priority.leftPeriod.start,

    end:
      priority.leftPeriod.end,

    year:
      priority.leftPeriod.year,

    quarter:
      priority.leftPeriod.quarter,

    month:
      priority.leftPeriod.month,

    measurementYear:
      priority.leftPeriod.measurementYear,
  };
}

export function createPeerComparisonIdentity(
  priority:
    RXPeerDivergencePriorityResult
): RXPeerComparisonIdentity {
  const pair =
    createPeerPairIdentity(
      priority.leftCompanyId,
      priority.rightCompanyId
    );

  const period =
    canonicalPeriod(
      priority
    );

  const commoditySubtype =
    priority.leftCommoditySubtype;

  return {
    pairKey:
      pair.key,

    firstCompanyId:
      pair.firstCompanyId,

    secondCompanyId:
      pair.secondCompanyId,

    metric:
      priority.metric,

    commodity:
      priority.commodity,

    commoditySubtype,

    period,

    key:
      JSON.stringify([
        pair.key,
        priority.metric,
        priority.commodity,
        commoditySubtype ?? null,
        period.kind,
        period.start ?? null,
        period.end ?? null,
        period.year ?? null,
        period.quarter ?? null,
        period.month ?? null,
        period.measurementYear ?? null,
      ]),
  };
}
