import {
  NextResponse,
} from "next/server";

import {
  runLiveSalesDestinationInvestigation,
} from "../../../../investigation/run-live-sales-destination-investigation";

interface RXSalesDestinationInvestigationRequestBody {
  companyId?: unknown;

  sectorsSlug?: unknown;

  year?: unknown;
}

function stringValue(
  value:
    unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export async function POST(
  request:
    Request,
) {
  const sectorsApiKey =
    process.env.SECTORS_API_KEY?.trim() ??
    "";

  if (
    sectorsApiKey.length === 0
  ) {
    return NextResponse.json(
      {
        status:
          "REJECTED",

        stage:
          "CONFIGURATION",

        path:
          "sales-destination",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "SECTORS_API_KEY is not configured.",
        ],
      },
      {
        status:
          503,
      },
    );
  }

  let body:
    RXSalesDestinationInvestigationRequestBody;

  try {
    body =
      (await request.json()) as
        RXSalesDestinationInvestigationRequestBody;
  } catch {
    return NextResponse.json(
      {
        status:
          "REJECTED",

        stage:
          "REQUEST",

        path:
          "sales-destination",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "Request body must be valid JSON.",
        ],
      },
      {
        status:
          400,
      },
    );
  }

  const companyId =
    stringValue(
      body.companyId,
    );

  const sectorsSlug =
    stringValue(
      body.sectorsSlug,
    );

  const year =
    body.year;

  if (
    companyId.length === 0 ||
    sectorsSlug.length === 0 ||
    typeof year !== "number" ||
    !Number.isInteger(year) ||
    year < 1900 ||
    year > 2100
  ) {
    return NextResponse.json(
      {
        status:
          "REJECTED",

        stage:
          "REQUEST",

        path:
          "sales-destination",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "companyId, sectorsSlug, and a valid integer year are required.",
        ],
      },
      {
        status:
          400,
      },
    );
  }

  try {
    const result =
      await runLiveSalesDestinationInvestigation({
        sectorsApiKey,

        companyId,

        sectorsSlug,

        year,
      });

    if (
      result.status !==
        "ACCEPTED"
    ) {
      return NextResponse.json(
        {
          ...result,

          path:
            "sales-destination",

          companyId,

          sectorsSlug,

          requestedYear:
            year,
        },
        {
          status:
            422,
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
          "sales-destination",

        companyId,

        sectorsSlug,

        requestedYear:
          year,

        salesDestination: {
          status:
            result.analysis.status,

          years:
            result.analysis.years,

          destinationCount:
            result.analysis.destinationCount,

          observationCount:
            result.analysis.observationCount,

          observationsWithRevenue:
            result.analysis.observationsWithRevenue,

          observationsWithRevenueShare:
            result.analysis.observationsWithRevenueShare,

          observationsWithVolume:
            result.analysis.observationsWithVolume,

          observationsWithVolumeShare:
            result.analysis.observationsWithVolumeShare,

          destinations:
            result.analysis.destinations,

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

        causalConclusion:
          "UNKNOWN",

        issues:
          [],
      },
      {
        status:
          200,
      },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Sales Destination investigation failed.";

    return NextResponse.json(
      {
        status:
          "REJECTED",

        stage:
          "REQUEST",

        path:
          "sales-destination",

        causalConclusion:
          "UNKNOWN",

        issues: [
          message,
        ],
      },
      {
        status:
          400,
      },
    );
  }
}