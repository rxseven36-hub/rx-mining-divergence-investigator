import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createPeerPairIdentity,
} from "../intelligence/comparability/peer-pair-identity";

describe(
  "createPeerPairIdentity",
  () => {
    it(
      "creates deterministic canonical company ordering",
      () => {
        const result =
          createPeerPairIdentity(
            "COMPANY-A",
            "COMPANY-B"
          );

        expect(
          result.firstCompanyId
        ).toBe(
          "COMPANY-A"
        );

        expect(
          result.secondCompanyId
        ).toBe(
          "COMPANY-B"
        );
      }
    );

    it(
      "creates the same identity for reverse company order",
      () => {
        const direct =
          createPeerPairIdentity(
            "COMPANY-A",
            "COMPANY-B"
          );

        const reverse =
          createPeerPairIdentity(
            "COMPANY-B",
            "COMPANY-A"
          );

        expect(
          reverse
        ).toEqual(
          direct
        );
      }
    );

    it(
      "creates a deterministic pair key",
      () => {
        const result =
          createPeerPairIdentity(
            "COMPANY-B",
            "COMPANY-A"
          );

        expect(
          result.key
        ).toBe(
          JSON.stringify([
            "COMPANY-A",
            "COMPANY-B",
          ])
        );
      }
    );

    it(
      "does not collapse distinct identifier boundaries",
      () => {
        const first =
          createPeerPairIdentity(
            "A|B",
            "C"
          );

        const second =
          createPeerPairIdentity(
            "A",
            "B|C"
          );

        expect(
          first.key
        ).not.toBe(
          second.key
        );
      }
    );
  }
);
