import {
  describe,
  expect,
  it,
} from "vitest";

import {
  admitMiningOperationalContextEvidence,
} from "../investigation/admit-mining-operational-context-evidence";

import type {
  RXInvestigationDataRequest,
} from "../investigation/investigation-plan";

const operationalRequest:
  RXInvestigationDataRequest = {
    requestId:
      "REQUEST-OPERATIONAL-1",

    requirementId:
      "REQUIREMENT-OPERATIONAL-1",

    source:
      "SECTORS",

    capability:
      "MINING_OPERATIONAL_CONTEXT",

    purpose:
      "Collect company operational context.",

    status:
      "PLANNED",
  };

const performanceRequest:
  RXInvestigationDataRequest = {
    ...operationalRequest,

    requestId:
      "REQUEST-PERFORMANCE-1",

    capability:
      "MINING_HISTORICAL_PERFORMANCE",
  };

const validPayload = {
  name:
    "PT Adaro Andalan Indonesia Tbk",

  slug:
    "pt-adaro-andalan-indonesia-tbk",

  symbol:
    "AADI.JK",

  company_type:
    "Holding",

  operation_province:
    "Jakarta",

  operation_district:
    "Jakarta Selatan",

  key_operation:
    "Coal Trading",

  activities: [
    "Trading",
  ],

  commodity_type: [
    "Coal",
  ],

  mining_license: [
    {
      license_type:
        "IUPK",
    },
  ],

  mining_contract: [],

  mining_site_count:
    0,

  representative_address:
    "Example address",

  website:
    "www.adaroindonesia.com",

  phone_number:
    "021-25533065",

  email:
    "example@example.com",
};

describe(
  "mining operational context evidence admission",
  () => {
    it(
      "admits valid operational context as Sectors source evidence",
      () => {
        const result =
          admitMiningOperationalContextEvidence({
            request:
              operationalRequest,

            companyId:
              "rx-company-aadi",

            sourceReference:
              "/v2/mining/companies/pt-adaro-andalan-indonesia-tbk/",

            payload:
              validPayload,

            retrievedAt:
              "2026-08-30T00:00:00.000Z",
          });

        expect(
          result.status
        ).toBe(
          "ADMITTED"
        );

        expect(
          result.collection.status
        ).toBe(
          "AVAILABLE"
        );

        expect(
          result.collection.issues
        ).toEqual([]);

        expect(
          result.collection.causalConclusion
        ).toBe(
          "UNKNOWN"
        );

        expect(
          result.context
        ).not.toBeNull();
      }
    );

    it(
      "emits only source facts",
      () => {
        const result =
          admitMiningOperationalContextEvidence({
            request:
              operationalRequest,

            companyId:
              "rx-company-aadi",

            sourceReference:
              "sectors-company-detail",

            payload:
              validPayload,
          });

        expect(
          result.status
        ).toBe(
          "ADMITTED"
        );

        expect(
          result.collection.evidence.length
        ).toBeGreaterThan(0);

        expect(
          result.collection.evidence.every(
            (item) =>
              item.truthClass ===
              "SOURCE_FACT"
          )
        ).toBe(true);

        expect(
          result.collection.evidence.every(
            (item) =>
              item.source ===
              "SECTORS"
          )
        ).toBe(true);
      }
    );

    it(
      "preserves explicit zero mining site count as admissible evidence",
      () => {
        const result =
          admitMiningOperationalContextEvidence({
            request:
              operationalRequest,

            companyId:
              "rx-company-aadi",

            sourceReference:
              "zero-site-count-test",

            payload:
              validPayload,
          });

        expect(
          result.status
        ).toBe(
          "ADMITTED"
        );

        const siteCountEvidence =
          result.collection.evidence.find(
            (item) =>
              item.description.startsWith(
                "mining_site_count:"
              )
          );

        expect(
          siteCountEvidence
        ).toBeDefined();

        expect(
          siteCountEvidence?.description
        ).toBe(
          "mining_site_count: 0"
        );
      }
    );

    it(
      "treats valid empty license and contract arrays as facts rather than NO_DATA",
      () => {
        const result =
          admitMiningOperationalContextEvidence({
            request:
              operationalRequest,

            companyId:
              "rx-company-aadi",

            sourceReference:
              "empty-array-test",

            payload: {
              ...validPayload,

              mining_license:
                [],

              mining_contract:
                [],
            },
          });

        expect(
          result.status
        ).toBe(
          "ADMITTED"
        );

        expect(
          result.collection.status
        ).toBe(
          "AVAILABLE"
        );

        expect(
          result.collection.issues
        ).not.toContain(
          "NO_DATA"
        );

        expect(
          result.collection.evidence.some(
            (item) =>
              item.description ===
              "mining_license: []"
          )
        ).toBe(true);

        expect(
          result.collection.evidence.some(
            (item) =>
              item.description ===
              "mining_contract: []"
          )
        ).toBe(true);
      }
    );

    it(
      "preserves explicit nullable operational fields as source facts",
      () => {
        const result =
          admitMiningOperationalContextEvidence({
            request:
              operationalRequest,

            companyId:
              "rx-company-aadi",

            sourceReference:
              "nullable-field-test",

            payload: {
              ...validPayload,

              symbol:
                null,

              operation_province:
                null,

              operation_district:
                null,

              representative_address:
                null,

              website:
                null,

              phone_number:
                null,

              email:
                null,
            },
          });

        expect(
          result.status
        ).toBe(
          "ADMITTED"
        );

        expect(
          result.context?.symbol.value
        ).toBeNull();

        expect(
          result.context
            ?.operationProvince.value
        ).toBeNull();

        expect(
          result.context
            ?.operationDistrict.value
        ).toBeNull();
      }
    );

    it(
      "does not admit contact fields into investigation evidence",
      () => {
        const result =
          admitMiningOperationalContextEvidence({
            request:
              operationalRequest,

            companyId:
              "rx-company-aadi",

            sourceReference:
              "contact-boundary-test",

            payload:
              validPayload,
          });

        const descriptions =
          result.collection.evidence.map(
            (item) =>
              item.description
          );

        expect(
          descriptions.some(
            (description) =>
              description.startsWith(
                "website:"
              )
          )
        ).toBe(false);

        expect(
          descriptions.some(
            (description) =>
              description.startsWith(
                "phone_number:"
              )
          )
        ).toBe(false);

        expect(
          descriptions.some(
            (description) =>
              description.startsWith(
                "email:"
              )
          )
        ).toBe(false);

        expect(
          descriptions.some(
            (description) =>
              description.startsWith(
                "representative_address:"
              )
          )
        ).toBe(false);
      }
    );

    it(
      "rejects invalid transport payload without manufacturing NO_DATA",
      () => {
        const result =
          admitMiningOperationalContextEvidence({
            request:
              operationalRequest,

            companyId:
              "rx-company-aadi",

            sourceReference:
              "invalid-response-test",

            payload: {
              name:
                "Incomplete payload",
            },
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.collection.status
        ).toBe(
          "INVALID"
        );

        expect(
          result.collection.issues
        ).toEqual([
          "INVALID_RESPONSE",
        ]);

        expect(
          result.collection.issues
        ).not.toContain(
          "NO_DATA"
        );

        expect(
          result.context
        ).toBeNull();
      }
    );

    it(
      "rejects a request for the wrong capability before interpreting payload",
      () => {
        const result =
          admitMiningOperationalContextEvidence({
            request:
              performanceRequest,

            companyId:
              "rx-company-aadi",

            sourceReference:
              "wrong-capability-test",

            payload:
              validPayload,
          });

        expect(
          result.status
        ).toBe(
          "REJECTED"
        );

        expect(
          result.collection.status
        ).toBe(
          "NOT_COMPARABLE"
        );

        expect(
          result.collection.issues
        ).toEqual([
          "RELATIONSHIP_INVALID",
        ]);

        expect(
          result.context
        ).toBeNull();
      }
    );

    it(
      "keeps causal conclusion unknown even when operational evidence is available",
      () => {
        const result =
          admitMiningOperationalContextEvidence({
            request:
              operationalRequest,

            companyId:
              "rx-company-aadi",

            sourceReference:
              "causal-boundary-test",

            payload:
              validPayload,
          });

        expect(
          result.status
        ).toBe(
          "ADMITTED"
        );

        expect(
          result.collection.causalConclusion
        ).toBe(
          "UNKNOWN"
        );
      }
    );
  }
);