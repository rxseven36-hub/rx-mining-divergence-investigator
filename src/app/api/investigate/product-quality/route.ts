import {
  NextResponse,
} from "next/server";

import {
  runLiveProductQualityInvestigation,
} from "../../../../investigation/run-live-product-quality-investigation";

interface RXProductQualityInvestigationRequestBody {
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
          "product-quality",

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
    RXProductQualityInvestigationRequestBody;

  try {
    body =
      (await request.json()) as
        RXProductQualityInvestigationRequestBody;
  } catch {
    return NextResponse.json(
      {
        status:
          "REJECTED",

        stage:
          "REQUEST",

        path:
          "product-quality",

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
          "product-quality",

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
      await runLiveProductQualityInvestigation({
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
            "product-quality",

          companyId,

          sectorsSlug,

          requestedPerformanceYear:
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
          "product-quality",

        companyId,

        sectorsSlug,

        requestedPerformanceYear:
          year,

        productQuality: {
          status:
            result.analysis.status,

          productCount:
            result.analysis.productCount,

          observationCount:
            result.analysis.observationCount,

          sourcePerformanceYears:
            result.analysis.sourcePerformanceYears,

          products:
            result.analysis.products,

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
        : "Product Quality investigation failed.";

    return NextResponse.json(
      {
        status:
          "REJECTED",

        stage:
          "REQUEST",

        path:
          "product-quality",

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