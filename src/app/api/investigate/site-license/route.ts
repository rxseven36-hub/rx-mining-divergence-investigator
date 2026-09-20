import {
  NextResponse,
} from "next/server";

import {
  runLiveSiteLicenseInvestigation,
} from "../../../../investigation/run-live-site-license-investigation";

interface RXSiteLicenseInvestigationRequestBody {
  companyId?: string;

  sectorsSlug?: string;
}

function isNonEmptyString(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

export async function POST(
  request: Request,
) {
  const sectorsApiKey =
    process.env.SECTORS_API_KEY;

  if (!sectorsApiKey) {
    return NextResponse.json(
      {
        status:
          "REJECTED",

        stage:
          "CONFIGURATION",

        path:
          "site-license",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "SERVER_SECTORS_CONFIGURATION_MISSING",
        ],
      },
      {
        status: 503,
      },
    );
  }

  let body:
    RXSiteLicenseInvestigationRequestBody;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        status:
          "REJECTED",

        stage:
          "REQUEST",

        path:
          "site-license",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "INVALID_JSON_BODY",
        ],
      },
      {
        status: 400,
      },
    );
  }

  if (
    !isNonEmptyString(
      body.companyId,
    ) ||
    !isNonEmptyString(
      body.sectorsSlug,
    )
  ) {
    return NextResponse.json(
      {
        status:
          "REJECTED",

        stage:
          "REQUEST",

        path:
          "site-license",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "INVALID_SITE_LICENSE_INVESTIGATION_REQUEST",
        ],
      },
      {
        status: 400,
      },
    );
  }

  try {
    const result =
      await runLiveSiteLicenseInvestigation({
        sectorsApiKey,

        companyId:
          body.companyId.trim(),

        sectorsSlug:
          body.sectorsSlug.trim(),
      });

    if (
      result.status !==
        "ACCEPTED"
    ) {
      return NextResponse.json(
        {
          ...result,

          path:
            "site-license",
        },
        {
          status: 422,
        },
      );
    }

    const context =
      result.evidence.context;

    return NextResponse.json(
      {
        status:
          "ACCEPTED",

        stage:
          "COMPLETE",

        path:
          "site-license",

        causalConclusion:
          "UNKNOWN",

        siteLicense: {
          miningSiteCount:
            context.miningSiteCount,

          miningLicenses:
            context.miningLicenses,

          miningContracts:
            context.miningContracts,
        },

        evidence: {
          pack: {
            evidence:
              result.evidence
                .collection
                .evidence,
          },
        },

        issues: [],
      },
      {
        status: 200,
      },
    );
  } catch {
    return NextResponse.json(
      {
        status:
          "REJECTED",

        stage:
          "RUNTIME",

        path:
          "site-license",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "LIVE_SITE_LICENSE_INVESTIGATION_RUNTIME_FAILURE",
        ],
      },
      {
        status: 502,
      },
    );
  }
}