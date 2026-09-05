import {
  describe,
  expect,
  it,
} from "vitest";

import {
  projectPeerIntelligenceEvidencePack,
} from "../intelligence/context/project-peer-intelligence-evidence-pack";

describe(
  "projectPeerIntelligenceEvidencePack",
  () => {
    it(
      "projects canonical peer evidence into one neutral deterministic evidence sequence",
      () => {
        const result =
          projectPeerIntelligenceEvidencePack({
            planId:
              "PLAN-1",

            caseId:
              "CASE-1",

            firstCompany: [
              {
                evidenceId:
                  "E-FIRST-1",

                requestId:
                  "R-FIRST-1",

                target:
                  "FIRST_COMPANY",

                companyId:
                  "COMPANY-A",

                source:
                  "SECTORS",

                sourceReference:
                  "sectors:first",

                truthClass:
                  "SOURCE_FACT",

                description:
                  "First-company admitted fact.",
              },
            ],

            secondCompany: [
              {
                evidenceId:
                  "E-SECOND-1",

                requestId:
                  "R-SECOND-1",

                target:
                  "SECOND_COMPANY",

                companyId:
                  "COMPANY-B",

                source:
                  "SECTORS",

                sourceReference:
                  "sectors:second",

                truthClass:
                  "SOURCE_FACT",

                description:
                  "Second-company admitted fact.",
              },
            ],

            shared: [
              {
                evidenceId:
                  "E-SHARED-1",

                requestId:
                  "R-SHARED-1",

                target:
                  "SHARED",

                companyId:
                  null,

                source:
                  "SECTORS",

                sourceReference:
                  "sectors:shared",

                truthClass:
                  "SOURCE_FACT",

                description:
                  "Shared admitted fact.",
              },
            ],
          });

        expect(result).toEqual({
          planId:
            "PLAN-1",

          caseId:
            "CASE-1",

          evidence: [
            {
              evidenceId:
                "E-FIRST-1",

              requestId:
                "R-FIRST-1",

              companyId:
                "COMPANY-A",

              source:
                "SECTORS",

              sourceReference:
                "sectors:first",

              truthClass:
                "SOURCE_FACT",

              description:
                "First-company admitted fact.",
            },

            {
              evidenceId:
                "E-SECOND-1",

              requestId:
                "R-SECOND-1",

              companyId:
                "COMPANY-B",

              source:
                "SECTORS",

              sourceReference:
                "sectors:second",

              truthClass:
                "SOURCE_FACT",

              description:
                "Second-company admitted fact.",
            },

            {
              evidenceId:
                "E-SHARED-1",

              requestId:
                "R-SHARED-1",

              companyId:
                null,

              source:
                "SECTORS",

              sourceReference:
                "sectors:shared",

              truthClass:
                "SOURCE_FACT",

              description:
                "Shared admitted fact.",
            },
          ],

          causalConclusion:
            "UNKNOWN",
        });
      }
    );

    it(
      "preserves an empty peer evidence sequence without inventing evidence",
      () => {
        const result =
          projectPeerIntelligenceEvidencePack({
            planId:
              "PLAN-EMPTY",

            caseId:
              "CASE-EMPTY",

            firstCompany:
              [],

            secondCompany:
              [],

            shared:
              [],
          });

        expect(result).toEqual({
          planId:
            "PLAN-EMPTY",

          caseId:
            "CASE-EMPTY",

          evidence:
            [],

          causalConclusion:
            "UNKNOWN",
        });
      }
    );
  }
);
