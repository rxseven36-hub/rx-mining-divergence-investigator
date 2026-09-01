import {
  describe,
  expect,
  it,
} from "vitest";

import {
  evaluatePeerEligibility,
} from "../intelligence/comparability/evaluate-peer-eligibility";

import type {
  RXOperationalIntelligenceEvidence,
  RXTypedIntelligenceEvidence,
} from "../intelligence/context/typed-intelligence-evidence";

function operationalEvidence(
  input: {
    companyId:
      string;

    fact:
      RXOperationalIntelligenceEvidence["fact"];

    sourceField:
      string;

    value:
      unknown;
  }
): RXOperationalIntelligenceEvidence {
  return {
    kind:
      "OPERATIONAL_FACT",

    scope:
      "OPERATIONAL",

    companyId:
      input.companyId,

    fact:
      input.fact,

    sourceField:
      input.sourceField,

    value:
      input.value,

    evidence: [
      {
        id:
          `evidence:${input.companyId}:${input.fact}`,

        provider:
          "SECTORS",

        source:
          `source:${input.companyId}`,

        retrievedAt:
          "2026-09-01T00:00:00.000Z",

        truthClass:
          "SOURCE_FACT",
      },
    ],

    truthClass:
      "SOURCE_FACT",
  };
}

function companyEvidence(
  input: {
    companyId:
      string;

    commodities:
      string[];

    companyType:
      string;

    keyOperation:
      string;

    activities:
      string[];
  }
): RXTypedIntelligenceEvidence[] {
  return [
    operationalEvidence({
      companyId:
        input.companyId,

      fact:
        "commodityTypes",

      sourceField:
        "commodity_type",

      value:
        input.commodities,
    }),

    operationalEvidence({
      companyId:
        input.companyId,

      fact:
        "companyType",

      sourceField:
        "company_type",

      value:
        input.companyType,
    }),

    operationalEvidence({
      companyId:
        input.companyId,

      fact:
        "keyOperation",

      sourceField:
        "key_operation",

      value:
        input.keyOperation,
    }),

    operationalEvidence({
      companyId:
        input.companyId,

      fact:
        "activities",

      sourceField:
        "activities",

      value:
        input.activities,
    }),
  ];
}

describe(
  "peer eligibility",
  () => {
    it(
      "allows distinct companies with an exact shared commodity",
      () => {
        const evidence = [
          ...companyEvidence({
            companyId:
              "COMPANY-A",

            commodities: [
              "Coal",
            ],

            companyType:
              "Holding",

            keyOperation:
              "Coal Trading",

            activities: [
              "Trading",
            ],
          }),

          ...companyEvidence({
            companyId:
              "COMPANY-B",

            commodities: [
              "Coal",
              "Gold",
            ],

            companyType:
              "Mining Company",

            keyOperation:
              "Coal Mining",

            activities: [
              "Mining",
            ],
          }),
        ];

        const result =
          evaluatePeerEligibility({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-B",

            evidence,
          });

        expect(
          result.status
        ).toBe(
          "ELIGIBLE"
        );

        expect(
          result.sharedCommodities
        ).toEqual([
          "COAL",
        ]);

        expect(
          result.issues
        ).toEqual([]);

        expect(
          result.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );

    it(
      "does not require company type or key operation equality",
      () => {
        const evidence = [
          ...companyEvidence({
            companyId:
              "COMPANY-A",

            commodities: [
              "Coal",
            ],

            companyType:
              "Holding",

            keyOperation:
              "Coal Trading",

            activities: [
              "Trading",
            ],
          }),

          ...companyEvidence({
            companyId:
              "COMPANY-B",

            commodities: [
              "Coal",
            ],

            companyType:
              "Operator",

            keyOperation:
              "Open Pit Mining",

            activities: [
              "Mining",
            ],
          }),
        ];

        const result =
          evaluatePeerEligibility({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-B",

            evidence,
          });

        expect(
          result.status
        ).toBe(
          "ELIGIBLE"
        );

        expect(
          result.descriptiveEvidence
            .left.companyType[0]
            ?.value
        ).toBe(
          "Holding"
        );

        expect(
          result.descriptiveEvidence
            .right.companyType[0]
            ?.value
        ).toBe(
          "Operator"
        );
      }
    );

    it(
      "rejects comparison of the same company",
      () => {
        const evidence =
          companyEvidence({
            companyId:
              "COMPANY-A",

            commodities: [
              "Coal",
            ],

            companyType:
              "Holding",

            keyOperation:
              "Coal Trading",

            activities: [
              "Trading",
            ],
          });

        const result =
          evaluatePeerEligibility({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-A",

            evidence,
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.issues
        ).toContain(
          "SAME_COMPANY"
        );
      }
    );

    it(
      "rejects when left commodity evidence is missing",
      () => {
        const evidence =
          companyEvidence({
            companyId:
              "COMPANY-B",

            commodities: [
              "Coal",
            ],

            companyType:
              "Operator",

            keyOperation:
              "Coal Mining",

            activities: [
              "Mining",
            ],
          });

        const result =
          evaluatePeerEligibility({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-B",

            evidence,
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.issues
        ).toContain(
          "LEFT_COMMODITY_EVIDENCE_MISSING"
        );
      }
    );

    it(
      "rejects when companies do not share an exact commodity",
      () => {
        const evidence = [
          ...companyEvidence({
            companyId:
              "COMPANY-A",

            commodities: [
              "Coal",
            ],

            companyType:
              "Holding",

            keyOperation:
              "Coal Trading",

            activities: [
              "Trading",
            ],
          }),

          ...companyEvidence({
            companyId:
              "COMPANY-B",

            commodities: [
              "Gold",
            ],

            companyType:
              "Operator",

            keyOperation:
              "Gold Mining",

            activities: [
              "Mining",
            ],
          }),
        ];

        const result =
          evaluatePeerEligibility({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-B",

            evidence,
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.sharedCommodities
        ).toEqual([]);

        expect(
          result.issues
        ).toContain(
          "NO_SHARED_COMMODITY"
        );
      }
    );

    it(
      "uses canonical RX commodity identity for supported source labels",
      () => {
        const evidence = [
          ...companyEvidence({
            companyId:
              "COMPANY-A",

            commodities: [
              "Coal",
            ],

            companyType:
              "Holding",

            keyOperation:
              "Coal Trading",

            activities: [
              "Trading",
            ],
          }),

          ...companyEvidence({
            companyId:
              "COMPANY-B",

            commodities: [
              "coal",
            ],

            companyType:
              "Operator",

            keyOperation:
              "Coal Mining",

            activities: [
              "Mining",
            ],
          }),
        ];

        const result =
          evaluatePeerEligibility({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-B",

            evidence,
          });

        expect(
          result.status
        ).toBe(
          "ELIGIBLE"
        );

        expect(
          result.sharedCommodities
        ).toEqual([
          "COAL",
        ]);
      }
    );

    it(
      "rejects unsupported commodity labels instead of manufacturing identity",
      () => {
        const evidence = [
          ...companyEvidence({
            companyId:
              "COMPANY-A",

            commodities: [
              "Uranium",
            ],

            companyType:
              "Holding",

            keyOperation:
              "Mining",

            activities: [
              "Mining",
            ],
          }),

          ...companyEvidence({
            companyId:
              "COMPANY-B",

            commodities: [
              "Uranium",
            ],

            companyType:
              "Operator",

            keyOperation:
              "Mining",

            activities: [
              "Mining",
            ],
          }),
        ];

        const result =
          evaluatePeerEligibility({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-B",

            evidence,
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.issues
        ).toContain(
          "LEFT_COMMODITY_VALUE_INVALID"
        );

        expect(
          result.issues
        ).toContain(
          "RIGHT_COMMODITY_VALUE_INVALID"
        );
      }
    );
    it(
      "rejects invalid commodity evidence values",
      () => {
        const evidence = [
          operationalEvidence({
            companyId:
              "COMPANY-A",

            fact:
              "commodityTypes",

            sourceField:
              "commodity_type",

            value:
              "Coal",
          }),

          ...companyEvidence({
            companyId:
              "COMPANY-B",

            commodities: [
              "Coal",
            ],

            companyType:
              "Operator",

            keyOperation:
              "Coal Mining",

            activities: [
              "Mining",
            ],
          }),
        ];

        const result =
          evaluatePeerEligibility({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-B",

            evidence,
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.issues
        ).toContain(
          "LEFT_COMMODITY_VALUE_INVALID"
        );
      }
    );

    it(
      "rejects ambiguous duplicate commodity evidence",
      () => {
        const evidence = [
          ...companyEvidence({
            companyId:
              "COMPANY-A",

            commodities: [
              "Coal",
            ],

            companyType:
              "Holding",

            keyOperation:
              "Coal Trading",

            activities: [
              "Trading",
            ],
          }),

          operationalEvidence({
            companyId:
              "COMPANY-A",

            fact:
              "commodityTypes",

            sourceField:
              "commodity_type",

            value: [
              "Coal",
            ],
          }),

          ...companyEvidence({
            companyId:
              "COMPANY-B",

            commodities: [
              "Coal",
            ],

            companyType:
              "Operator",

            keyOperation:
              "Coal Mining",

            activities: [
              "Mining",
            ],
          }),
        ];

        const result =
          evaluatePeerEligibility({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-B",

            evidence,
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.issues
        ).toContain(
          "LEFT_COMMODITY_EVIDENCE_AMBIGUOUS"
        );
      }
    );

    it(
      "does not mutate input evidence",
      () => {
        const evidence = [
          ...companyEvidence({
            companyId:
              "COMPANY-A",

            commodities: [
              "Coal",
            ],

            companyType:
              "Holding",

            keyOperation:
              "Coal Trading",

            activities: [
              "Trading",
            ],
          }),

          ...companyEvidence({
            companyId:
              "COMPANY-B",

            commodities: [
              "Coal",
            ],

            companyType:
              "Operator",

            keyOperation:
              "Coal Mining",

            activities: [
              "Mining",
            ],
          }),
        ];

        const before =
          structuredClone(
            evidence
          );

        const result =
          evaluatePeerEligibility({
            leftCompanyId:
              "COMPANY-A",

            rightCompanyId:
              "COMPANY-B",

            evidence,
          });

        expect(
          evidence
        ).toEqual(
          before
        );

        expect(
          result.leftCommodityEvidence
        ).not.toBe(
          evidence[0]
        );
      }
    );
  }
);