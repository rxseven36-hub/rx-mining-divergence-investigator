import {
  NextResponse,
} from "next/server";

import type {
  RXIntegratedEntryPointHttpBody,
} from "../../../../investigation/handle-integrated-entry-point-http";

import {
  handleIntegratedEntryPointHttp,
} from "../../../../investigation/handle-integrated-entry-point-http";

export async function POST(
  request: Request,
) {
  let body:
    RXIntegratedEntryPointHttpBody;

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

        issues: [
          "INVALID_JSON_BODY",
        ],

        causalConclusion:
          "UNKNOWN",
      },
      {
        status: 400,
      },
    );
  }

  const result =
    await handleIntegratedEntryPointHttp(
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