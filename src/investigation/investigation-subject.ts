import {
  createPeerPairIdentity,
} from "../intelligence/comparability/peer-pair-identity";

export interface RXCompanyDivergenceInvestigationSubject {
  kind:
    "COMPANY_DIVERGENCE";

  companyId:
    string;
}

export interface RXPeerDivergenceInvestigationSubject {
  kind:
    "PEER_DIVERGENCE";

  firstCompanyId:
    string;

  secondCompanyId:
    string;

  pairKey:
    string;
}

export type RXInvestigationSubject =
  | RXCompanyDivergenceInvestigationSubject
  | RXPeerDivergenceInvestigationSubject;

export function createCompanyDivergenceInvestigationSubject(
  companyId:
    string
): RXCompanyDivergenceInvestigationSubject {
  return {
    kind:
      "COMPANY_DIVERGENCE",

    companyId,
  };
}

export function createPeerDivergenceInvestigationSubject(
  leftCompanyId:
    string,
  rightCompanyId:
    string
): RXPeerDivergenceInvestigationSubject {
  const identity =
    createPeerPairIdentity(
      leftCompanyId,
      rightCompanyId
    );

  return {
    kind:
      "PEER_DIVERGENCE",

    firstCompanyId:
      identity.firstCompanyId,

    secondCompanyId:
      identity.secondCompanyId,

    pairKey:
      identity.key,
  };
}