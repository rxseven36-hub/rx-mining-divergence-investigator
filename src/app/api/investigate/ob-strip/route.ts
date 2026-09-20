import {
  NextResponse,
} from "next/server";

import {
  runLiveObStripInvestigation,
} from "../../../../investigation/run-live-ob-strip-investigation";

interface RXObStripInvestigationRequestBody {
  companyId?: string;

  sectorsSlug?: string;

  year?: number;
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
          "ob-strip",

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
    RXObStripInvestigationRequestBody;

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
          "ob-strip",

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
    ) ||
    typeof body.year !== "number" ||
    !Number.isInteger(
      body.year,
    ) ||
    body.year < 1900 ||
    body.year > 2100
  ) {
    return NextResponse.json(
      {
        status:
          "REJECTED",

        stage:
          "REQUEST",

        path:
          "ob-strip",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "INVALID_OB_STRIP_INVESTIGATION_REQUEST",
        ],
      },
      {
        status: 400,
      },
    );
  }

  try {
    const result =
      await runLiveObStripInvestigation({
        sectorsApiKey,

        companyId:
          body.companyId.trim(),

        sectorsSlug:
          body.sectorsSlug.trim(),

        year:
          body.year,
      });

    if (
      result.status !==
        "ACCEPTED"
    ) {
      return NextResponse.json(
        {
          ...result,

          path:
            "ob-strip",
        },
        {
          status: 422,
        },
      );
    }

    return NextResponse.json(
      {
        status:
          "ACCEPTED",

        stage:
          "COMPLETE",

        path:
          "ob-strip",

        causalConclusion:
          "UNKNOWN",

        year:
          body.year,

        obStrip: {
          status:
            result.analysis.status,

          availability:
            result.analysis.availability,

          periodYear:
            result.analysis.periodYear,

          overburden:
            result.analysis.overburden,

          stripRatio:
            result.analysis.stripRatio,

          observedRelationship:
            result.analysis.observedRelationship,
        },

        evidence: {
          pack: {
            evidence:
              result.evidence
                .collection
                .evidence,
          },

          admittedObservations:
            result.evidence
              .admittedObservations,
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
          "ob-strip",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "LIVE_OB_STRIP_INVESTIGATION_RUNTIME_FAILURE",
        ],
      },
      {
        status: 502,
      },
    );
  }
}