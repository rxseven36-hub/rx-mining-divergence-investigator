import {
  NextResponse,
} from "next/server";

import type {
  RXCommodity,
} from "../../../../types/commodity";

import {
  runLiveProductionSalesIntelligence,
} from "../../../../investigation/run-live-production-sales-intelligence";

interface RXProductionSalesInvestigationRequestBody {
  companyId?:
    string;

  sectorsSlug?:
    string;

  ticker?:
    string;

  commodity?:
    RXCommodity;

  year?:
    number;
}

function isNonEmptyString(
  value:
    unknown,
): value is string {
  return (
    typeof value ===
      "string" &&
    value.trim().length >
      0
  );
}

function isCommodity(
  value:
    unknown,
): value is RXCommodity {
  return (
    value ===
      "COAL" ||
    value ===
      "GOLD" ||
    value ===
      "NICKEL" ||
    value ===
      "TIN" ||
    value ===
      "COPPER" ||
    value ===
      "BAUXITE" ||
    value ===
      "IRON"
  );
}

export async function POST(
  request:
    Request,
) {
  const sectorsApiKey =
    process.env.SECTORS_API_KEY;

  const llmApiKey =
    process.env.LLM_API_KEY;

  if (
    !sectorsApiKey ||
    !llmApiKey
  ) {
    return NextResponse.json(
      {
        status:
          "REJECTED",

        stage:
          "CONFIGURATION",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "SERVER_INTELLIGENCE_CONFIGURATION_MISSING",
        ],
      },
      {
        status:
          503,
      },
    );
  }

  let body:
    RXProductionSalesInvestigationRequestBody;

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

        causalConclusion:
          "UNKNOWN",

        issues: [
          "INVALID_JSON_BODY",
        ],
      },
      {
        status:
          400,
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
    !isNonEmptyString(
      body.ticker,
    ) ||
    !isCommodity(
      body.commodity,
    ) ||
    typeof body.year !==
      "number" ||
    !Number.isInteger(
      body.year,
    ) ||
    body.year <
      1900 ||
    body.year >
      2100
  ) {
    return NextResponse.json(
      {
        status:
          "REJECTED",

        stage:
          "REQUEST",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "INVALID_PRODUCTION_SALES_INVESTIGATION_REQUEST",
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
      await runLiveProductionSalesIntelligence({
        sectorsApiKey,

        llmApiKey,

        companyId:
          body.companyId.trim(),

        sectorsSlug:
          body.sectorsSlug.trim(),

        ticker:
          body.ticker.trim(),

        commodity:
          body.commodity,

        year:
          body.year,
      });

    if (
      result.status ===
        "REJECTED"
    ) {
      return NextResponse.json(
        {
          status:
            "REJECTED",

          stage:
            result.stage,

          causalConclusion:
            "UNKNOWN",

          issues:
            result.issues,
        },
        {
          status:
            422,
        },
      );
    }

    const intelligence =
      result.intelligence;

    if (
      intelligence.status !==
        "COMPLETED"
    ) {
      return NextResponse.json(
        {
          status:
            "REJECTED",

          stage:
            intelligence.status,

          causalConclusion:
            "UNKNOWN",

          issues: [],
        },
        {
          status:
            422,
        },
      );
    }

    const synthesis =
      intelligence.synthesis;

    if (
      synthesis.status !==
        "ACCEPTED"
    ) {
      return NextResponse.json(
        {
          status:
            "REJECTED",

          stage:
            synthesis.stage,

          causalConclusion:
            "UNKNOWN",

          issues:
            synthesis.issues,
        },
        {
          status:
            422,
        },
      );
    }

    const admittedObservations =
      result.discovery
        .admittedObservations;

    const production =
      admittedObservations.find(
        (observation) =>
          observation.metric ===
          "PRODUCTION",
      ) ?? null;

    const sales =
      admittedObservations.find(
        (observation) =>
          observation.metric ===
          "SALES",
      ) ?? null;

    const investigationCase =
      intelligence.queue
        .queue
        .cases[0] ??
      null;

    return NextResponse.json(
      {
        status:
          "ACCEPTED",

        stage:
          "COMPLETE",

        causalConclusion:
          "UNKNOWN",

        company: {
          id:
            body.companyId.trim(),

          sectorsSlug:
            body.sectorsSlug.trim(),

          ticker:
            body.ticker.trim(),

          commodity:
            body.commodity,
        },

        year:
          body.year,

        divergence: {
          production,

          sales,
        },

        investigationCase,

        evidence: {
          pack:
            intelligence
              .evidencePack,
        },

        hypothesis:
          synthesis
            .hypothesis,

        challenge:
          synthesis
            .challenge,

        brief:
          synthesis
            .brief,
      },
      {
        status:
          200,
      },
    );
  } catch {
    return NextResponse.json(
      {
        status:
          "REJECTED",

        stage:
          "RUNTIME",

        causalConclusion:
          "UNKNOWN",

        issues: [
          "LIVE_PRODUCTION_SALES_INTELLIGENCE_RUNTIME_FAILURE",
        ],
      },
      {
        status:
          502,
      },
    );
  }
}