export interface RXPeerPairIdentity {
  firstCompanyId:
    string;

  secondCompanyId:
    string;

  key:
    string;
}

function compareCompanyIds(
  left:
    string,
  right:
    string
): number {
  return left.localeCompare(
    right
  );
}

export function createPeerPairIdentity(
  leftCompanyId:
    string,
  rightCompanyId:
    string
): RXPeerPairIdentity {
  const ordered =
    compareCompanyIds(
      leftCompanyId,
      rightCompanyId
    ) <= 0
      ? [
          leftCompanyId,
          rightCompanyId,
        ]
      : [
          rightCompanyId,
          leftCompanyId,
        ];

  const firstCompanyId =
    ordered[0];

  const secondCompanyId =
    ordered[1];

  return {
    firstCompanyId,

    secondCompanyId,

    key:
      JSON.stringify([
        firstCompanyId,
        secondCompanyId,
      ]),
  };
}
