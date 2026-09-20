import {
  NextResponse,
} from "next/server";

import type {
  RXIntegratedInvestigationHttpBody,
} from "../../../../investigation/handle-integrated-investigation-http";

import {
  handleIntegratedInvestigationHttp,
} from "../../../../investigation/handle-integrated-investigation-http";

export async function POST(
  request:
    Request,
) {
  let body:
    RXIntegratedInvestigationHttpBody;

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

  const result =
    await handleIntegratedInvestigationHttp(
      process.env.SECTORS_API_KEY,
      body,
    );

  return NextResponse.json(
    result.body,
    {
      status:
        result.httpStatus,
    },
  );
}