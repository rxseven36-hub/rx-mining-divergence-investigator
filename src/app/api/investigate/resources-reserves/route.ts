import {
  NextResponse,
} from "next/server";

import {
  runLiveResourcesReservesInvestigation,
} from "../../../../investigation/run-live-resources-reserves-investigation";

interface RXResourcesReservesInvestigationRequestBody {
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
          "resources-reserves",

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
    RXResourcesReservesInvestigationRequestBody;

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
          "resources-reserves",

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
          "resources-reserves",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "INVALID_RESOURCES_RESERVES_INVESTIGATION_REQUEST",
        ],
      },
      {
        status: 400,
      },
    );
  }

  try {
    const result =
      await runLiveResourcesReservesInvestigation({
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
            "resources-reserves",
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
          "resources-reserves",

        causalConclusion:
          "UNKNOWN",

        requestedPerformanceYear:
          body.year,

        resourcesReserves: {
          status:
            result.analysis.status,

          availability:
            result.analysis.availability,

          measurementYear:
            result.analysis.measurementYear,

          sourcePerformanceYear:
            result.analysis.sourcePerformanceYear,

          totalResource:
            result.analysis.totalResource,

          totalReserve:
            result.analysis.totalReserve,

          resourceComponents:
            result.analysis.resourceComponents,

          reserveComponents:
            result.analysis.reserveComponents,

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
          "resources-reserves",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "LIVE_RESOURCES_RESERVES_INVESTIGATION_RUNTIME_FAILURE",
        ],
      },
      {
        status: 502,
      },
    );
  }
}