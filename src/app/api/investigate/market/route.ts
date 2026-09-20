import {
  NextResponse,
} from "next/server";

import {
  runLiveMarketInvestigation,
} from "../../../../investigation/run-live-market-investigation";

interface MarketInvestigationBody {
  companyId?: unknown;
  ticker?: unknown;
  start?: unknown;
  end?: unknown;
}

function stringValue(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

export async function POST(
  request: Request,
) {
  const sectorsApiKey =
    process.env.SECTORS_API_KEY?.trim() ?? "";

  if (sectorsApiKey.length === 0) {
    return NextResponse.json(
      {
        status: "REJECTED",
        stage: "CONFIGURATION",
        path: "market",
        causalConclusion: "UNKNOWN",
        issues: [
          "SECTORS_API_KEY is not configured.",
        ],
      },
      {
        status: 503,
      },
    );
  }

  let body: MarketInvestigationBody;

  try {
    body =
      (await request.json()) as
        MarketInvestigationBody;
  } catch {
    return NextResponse.json(
      {
        status: "REJECTED",
        stage: "REQUEST",
        path: "market",
        causalConclusion: "UNKNOWN",
        issues: [
          "Request body must be valid JSON.",
        ],
      },
      {
        status: 400,
      },
    );
  }

  const companyId =
    stringValue(body.companyId);

  const ticker =
    stringValue(body.ticker)
      .toUpperCase();

  const start =
    stringValue(body.start);

  const end =
    stringValue(body.end);

  if (
    companyId.length === 0 ||
    ticker.length === 0 ||
    start.length === 0 ||
    end.length === 0
  ) {
    return NextResponse.json(
      {
        status: "REJECTED",
        stage: "REQUEST",
        path: "market",
        causalConclusion: "UNKNOWN",
        issues: [
          "companyId, ticker, start, and end are required.",
        ],
      },
      {
        status: 400,
      },
    );
  }

  try {
    const result =
      await runLiveMarketInvestigation({
        sectorsApiKey,
        companyId,
        ticker,
        start,
        end,
      });

    if (
      result.status !==
        "ACCEPTED"
    ) {
      return NextResponse.json(
        {
          ...result,
          path: "market",
          companyId,
          ticker,
          requestedPeriod: {
            start,
            end,
          },
        },
        {
          status: 422,
        },
      );
    }

    return NextResponse.json({
      status: "ACCEPTED",
      stage: "COMPLETE",
      path: "market",

      companyId,
      ticker,

      requestedPeriod: {
        start,
        end,
      },

      market:
        result.analysis,

      evidence:
        result.evidence,

      causalConclusion:
        "UNKNOWN",

      issues: [],
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Market investigation failed.";

    return NextResponse.json(
      {
        status: "REJECTED",
        stage: "REQUEST",
        path: "market",
        causalConclusion: "UNKNOWN",
        issues: [message],
      },
      {
        status: 400,
      },
    );
  }
}