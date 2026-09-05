import {
  NextResponse,
} from "next/server";

import type {
  RXCompany,
} from "../../../types/company";

import {
  runLivePeerIntelligence,
} from "../../../investigation/run-live-peer-intelligence";

interface RXInvestigationRequestBody {
  firstCompany?:
    RXCompany;

  secondCompany?:
    RXCompany;

  year?:
    number;
}

function isCompany(
  value:
    unknown,
): value is RXCompany {
  if (
    typeof value !==
      "object" ||
    value ===
      null
  ) {
    return false;
  }

  const company =
    value as Partial<RXCompany>;

  return (
    typeof company.id ===
      "string" &&
    company.id.length >
      0 &&
    typeof company.name ===
      "string" &&
    company.name.length >
      0 &&
    typeof company.listed ===
      "boolean" &&
    typeof company.sectorsSlug ===
      "string" &&
    company.sectorsSlug.length >
      0
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
    RXInvestigationRequestBody;

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
    !isCompany(
      body.firstCompany,
    ) ||
    !isCompany(
      body.secondCompany,
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
          "INVALID_INVESTIGATION_REQUEST",
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
      await runLivePeerIntelligence({
        sectorsApiKey,

        llmApiKey,

        firstCompany:
          body.firstCompany,

        secondCompany:
          body.secondCompany,

        year:
          body.year,
      });

    if (
      result.status !==
        "ACCEPTED"
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

    const synthesis =
      result.intelligence
        .synthesis;

    return NextResponse.json(
      {
        status:
          "ACCEPTED",

        stage:
          "COMPLETE",

        causalConclusion:
          "UNKNOWN",

        companies: {
          first:
            result.discovery
              .firstCompany,

          second:
            result.discovery
              .secondCompany,
        },

        investigationCase:
          result.discovery
            .selection
            .investigationCase,

        estimatedDiscoveryCreditsUsed:
          result.discovery
            .estimatedCreditsUsed,

        evidence: {
          context:
            result.intelligence
              .evidenceContext,

          pack:
            synthesis
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
          "LIVE_INTELLIGENCE_RUNTIME_FAILURE",
        ],
      },
      {
        status:
          502,
      },
    );
  }
}