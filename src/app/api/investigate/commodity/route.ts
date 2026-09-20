import {
  NextResponse,
} from "next/server";

import {
  runLiveCommodityInvestigation,
} from "../../../../investigation/run-live-commodity-investigation";

import type {
  RXCommodity,
} from "../../../../types/commodity";

const SUPPORTED_COMMODITIES =
  new Set<RXCommodity>([
    "COAL",
    "GOLD",
    "NICKEL",
    "COPPER",
  ]);

interface CommodityRequestBody {
  commodity?: unknown;
  startYear?: unknown;
  endYear?: unknown;
}

function isCommodity(
  value: unknown,
): value is RXCommodity {
  return (
    typeof value ===
      "string" &&
    SUPPORTED_COMMODITIES.has(
      value.toUpperCase() as
        RXCommodity,
    )
  );
}

export async function POST(
  request: Request,
) {
  const sectorsApiKey =
    process.env
      .SECTORS_API_KEY
      ?.trim();

  if (!sectorsApiKey) {
    return NextResponse.json(
      {
        status:
          "REJECTED",

        stage:
          "CONFIGURATION",

        path:
          "commodity-context",

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
    CommodityRequestBody;

  try {
    body =
      (await request.json()) as
        CommodityRequestBody;
  } catch {
    return NextResponse.json(
      {
        status:
          "REJECTED",

        stage:
          "REQUEST",

        path:
          "commodity-context",

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

  if (
    !isCommodity(
      body.commodity,
    ) ||
    typeof body.startYear !==
      "number" ||
    typeof body.endYear !==
      "number"
  ) {
    return NextResponse.json(
      {
        status:
          "REJECTED",

        stage:
          "REQUEST",

        path:
          "commodity-context",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "commodity, startYear, and endYear are required.",
        ],
      },

      {
        status:
          400,
      },
    );
  }

  const commodity =
    body.commodity
      .toUpperCase() as
      RXCommodity;

  try {
    const result =
      await runLiveCommodityInvestigation({
        sectorsApiKey,
        commodity,
        startYear:
          body.startYear,
        endYear:
          body.endYear,
      });

    if (
      result.status !==
      "ACCEPTED"
    ) {
      return NextResponse.json(
        {
          ...result,

          path:
            "commodity-context",

          commodity,

          requestedPeriod: {
            startYear:
              body.startYear,

            endYear:
              body.endYear,
          },
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
          "commodity-context",

        commodity,

        requestedPeriod: {
          startYear:
            body.startYear,

          endYear:
            body.endYear,
        },

        commodityPrice:
          result.analysis,

        evidence:
          result.evidence,

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
  } catch (
    error: unknown
  ) {
    return NextResponse.json(
      {
        status:
          "REJECTED",

        stage:
          "REQUEST",

        path:
          "commodity-context",

        causalConclusion:
          "UNKNOWN",

        issues: [
          error instanceof Error
            ? error.message
            : "Commodity investigation failed.",
        ],
      },

      {
        status:
          400,
      },
    );
  }
}