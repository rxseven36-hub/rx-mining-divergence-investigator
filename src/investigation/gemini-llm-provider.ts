import type {
  LLMProvider,
} from "./llm-provider";

type RXGeminiFetch =
  (
    input:
      string | URL | Request,
    init?:
      RequestInit
  ) => Promise<Response>;

export interface RXGeminiLLMProviderOptions {
  apiKey:
    string;

  model?:
    string;

  endpoint?:
    string;

  fetchImpl?:
    RXGeminiFetch;
}

interface RXGeminiInteractionResponse {
  steps?:
    unknown;
}

const DEFAULT_MODEL =
  "gemini-3.6-flash";

const DEFAULT_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/interactions";

const evidenceReferenceSchema = {
  type:
    "object",

  additionalProperties:
    false,

  properties: {
    evidenceId: {
      type:
        "string",
    },

    requestId: {
      type:
        "string",
    },
  },

  required: [
    "evidenceId",
    "requestId",
  ],
} as const;

const hypothesisResponseSchema = {
  type:
    "object",

  additionalProperties:
    false,

  properties: {
    statement: {
      type:
        "string",
    },

    supportingEvidence: {
      type:
        "array",

      items:
        evidenceReferenceSchema,
    },

    counterEvidence: {
      type:
        "array",

      items:
        evidenceReferenceSchema,
    },

    alternativeExplanations: {
      type:
        "array",

      items: {
        type:
          "string",
      },
    },

    uncertainties: {
      type:
        "array",

      items: {
        type:
          "string",
      },
    },
  },

  required: [
    "statement",
    "supportingEvidence",
    "counterEvidence",
    "alternativeExplanations",
    "uncertainties",
  ],
} as const;

const challengeResponseSchema = {
  type:
    "object",

  additionalProperties:
    false,

  properties: {
    critique: {
      type:
        "string",
    },

    challengingEvidence: {
      type:
        "array",

      items:
        evidenceReferenceSchema,
    },

    unresolvedConcerns: {
      type:
        "array",

      items: {
        type:
          "string",
      },
    },
  },

  required: [
    "critique",
    "challengingEvidence",
    "unresolvedConcerns",
  ],
} as const;

const briefResponseSchema = {
  type:
    "object",

  additionalProperties:
    false,

  properties: {
    executiveSummary: {
      type:
        "string",
    },

    evidenceReferences: {
      type:
        "array",

      items:
        evidenceReferenceSchema,
    },

    alternativeExplanations: {
      type:
        "array",

      items: {
        type:
          "string",
      },
    },

    uncertainties: {
      type:
        "array",

      items: {
        type:
          "string",
      },
    },

    unresolvedConcerns: {
      type:
        "array",

      items: {
        type:
          "string",
      },
    },
  },

  required: [
    "executiveSummary",
    "evidenceReferences",
    "alternativeExplanations",
    "uncertainties",
    "unresolvedConcerns",
  ],
} as const;

function isRecord(
  value:
    unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function readModelOutputText(
  value:
    RXGeminiInteractionResponse
): string {
  if (!Array.isArray(value.steps)) {
    throw new Error(
      "Gemini interaction returned no steps"
    );
  }

  for (const step of value.steps) {
    if (
      !isRecord(step) ||
      step.type !== "model_output" ||
      !Array.isArray(step.content)
    ) {
      continue;
    }

    for (const content of step.content) {
      if (
        isRecord(content) &&
        content.type === "text" &&
        typeof content.text === "string" &&
        content.text.trim().length > 0
      ) {
        return content.text;
      }
    }
  }

  throw new Error(
    "Gemini interaction returned no model output text"
  );
}

function parseStructuredOutput(
  text:
    string
): Record<string, unknown> {
  let parsed:
    unknown;

  try {
    parsed =
      JSON.parse(text);
  } catch {
    throw new Error(
      "Gemini structured output is not valid JSON"
    );
  }

  if (!isRecord(parsed)) {
    throw new Error(
      "Gemini structured output is not an object"
    );
  }

  return parsed;
}

function createHypothesisPrompt(
  input:
    Parameters<
      LLMProvider["proposeHypothesis"]
    >[0]
): string {
  return `
You are the evidence-bounded hypothesis stage of RX Mining Divergence Investigator.

ABSOLUTE RULES:

1. The supplied EVIDENCE PACK is the only source of factual truth.
2. Do not invent evidence, facts, metrics, dates, entities, events, or causes.
3. Do not claim or imply that causality has been established.
4. Do not provide BUY, SELL, HOLD, valuation, price-target, or investment recommendations.
5. Every evidence reference MUST exactly match an evidenceId/requestId pair present in the evidence pack.
6. Never create a new evidenceId or requestId.
7. Never place the same evidence reference in both supportingEvidence and counterEvidence.
8. Empty evidence arrays are valid when evidence is insufficient.
9. Describe what the admitted evidence MAY INDICATE, not what it proves.
10. Preserve material uncertainty and plausible alternative explanations.
11. Do not return identity fields or causalConclusion. RX owns those fields.

EVIDENCE PACK:

${JSON.stringify(input.evidencePack, null, 2)}
`;
}

function createChallengePrompt(
  input:
    Parameters<
      LLMProvider["challengeHypothesis"]
    >[0]
): string {
  return `
You are the adversarial challenge stage of RX Mining Divergence Investigator.

Your task is NOT to defend the hypothesis.
Your task is to challenge unsupported interpretation.

ABSOLUTE RULES:

1. The supplied EVIDENCE PACK is the only source of factual truth.
2. Do not invent evidence, facts, metrics, dates, entities, events, or causes.
3. Do not establish causality.
4. Do not provide BUY, SELL, HOLD, valuation, price-target, or investment recommendations.
5. Every challengingEvidence reference MUST exactly match an evidenceId/requestId pair present in the evidence pack.
6. Empty challengingEvidence is valid when no admitted evidence directly contradicts the hypothesis.
7. Do not treat absence of evidence as counter-evidence.
8. Distinguish observed association from causal contribution.
9. Explicitly challenge language that goes beyond what admitted evidence supports.
10. Preserve unresolved uncertainty instead of resolving it speculatively.
11. Do not return identity fields or causalConclusion. RX owns those fields.

EVIDENCE PACK:

${JSON.stringify(input.evidencePack, null, 2)}

VALIDATED HYPOTHESIS:

${JSON.stringify(input.hypothesis, null, 2)}
`;
}

function createBriefPrompt(
  input:
    Parameters<
      LLMProvider["synthesizeBrief"]
    >[0]
): string {
  return `
You are the final intelligence brief stage of RX Mining Divergence Investigator.

You receive:
- the canonical evidence pack,
- a validated hypothesis,
- a validated adversarial challenge.

Produce a concise evidence-bounded intelligence brief.

ABSOLUTE RULES:

1. The supplied EVIDENCE PACK remains the only source of factual truth.
2. Do not invent facts, evidence, events, metrics, dates, entities, or causes.
3. Do not establish causality.
4. Do not provide BUY, SELL, HOLD, valuation, price-target, or investment recommendations.
5. Every evidenceReferences entry MUST exactly match an evidenceId/requestId pair present in the evidence pack.
6. Preserve material alternative explanations.
7. Preserve material uncertainties.
8. Preserve unresolved concerns raised by the challenge.
9. Distinguish observed divergence or association from unproven causal explanation.
10. Do not silently convert the hypothesis into a fact.
11. Do not resolve missing evidence by speculation.
12. Do not return identity fields or causalConclusion. RX owns those fields.

EVIDENCE PACK:

${JSON.stringify(input.evidencePack, null, 2)}

VALIDATED HYPOTHESIS:

${JSON.stringify(input.hypothesis, null, 2)}

VALIDATED CHALLENGE:

${JSON.stringify(input.challenge, null, 2)}
`;
}

export class GeminiLLMProvider
implements LLMProvider {
  private readonly apiKey:
    string;

  private readonly model:
    string;

  private readonly endpoint:
    string;

  private readonly fetchImpl:
    RXGeminiFetch;

  constructor(
    options:
      RXGeminiLLMProviderOptions
  ) {
    const apiKey =
      options.apiKey.trim();

    if (apiKey.length === 0) {
      throw new Error(
        "Gemini API key is required"
      );
    }

    this.apiKey =
      apiKey;

    this.model =
      options.model ??
      DEFAULT_MODEL;

    this.endpoint =
      options.endpoint ??
      DEFAULT_ENDPOINT;

    this.fetchImpl =
      options.fetchImpl ??
      fetch;
  }

  async investigate(
    _input:
      Parameters<
        LLMProvider["investigate"]
      >[0]
  ): Promise<unknown> {
    throw new Error(
      "GeminiLLMProvider does not support the legacy investigate boundary"
    );
  }

  async proposeHypothesis(
    input:
      Parameters<
        LLMProvider["proposeHypothesis"]
      >[0]
  ): Promise<unknown> {
    const candidate =
      await this.runStructuredInteraction(
        createHypothesisPrompt(
          input
        ),
        hypothesisResponseSchema
      );

    return {
      caseId:
        input.evidencePack.caseId,

      planId:
        input.evidencePack.planId,

      hypothesisId:
        `HYPOTHESIS-${input.evidencePack.caseId}`,

      ...candidate,

      causalConclusion:
        "UNKNOWN",
    };
  }

  async challengeHypothesis(
    input:
      Parameters<
        LLMProvider["challengeHypothesis"]
      >[0]
  ): Promise<unknown> {
    const candidate =
      await this.runStructuredInteraction(
        createChallengePrompt(
          input
        ),
        challengeResponseSchema
      );

    return {
      caseId:
        input.evidencePack.caseId,

      planId:
        input.evidencePack.planId,

      hypothesisId:
        input.hypothesis.hypothesisId,

      challengeId:
        `CHALLENGE-${input.hypothesis.hypothesisId}`,

      ...candidate,

      causalConclusion:
        "UNKNOWN",
    };
  }

  async synthesizeBrief(
    input:
      Parameters<
        LLMProvider["synthesizeBrief"]
      >[0]
  ): Promise<unknown> {
    const candidate =
      await this.runStructuredInteraction(
        createBriefPrompt(
          input
        ),
        briefResponseSchema
      );

    return {
      caseId:
        input.evidencePack.caseId,

      planId:
        input.evidencePack.planId,

      briefId:
        `BRIEF-${input.hypothesis.hypothesisId}`,

      hypothesisId:
        input.hypothesis.hypothesisId,

      challengeId:
        input.challenge.challengeId,

      ...candidate,

      causalConclusion:
        "UNKNOWN",
    };
  }

  private async runStructuredInteraction(
    prompt:
      string,

    schema:
      unknown
  ): Promise<Record<string, unknown>> {
    const response =
      await this.fetchImpl(
        this.endpoint,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",

            "x-goog-api-key":
              this.apiKey,
          },

          body:
            JSON.stringify({
              model:
                this.model,

              input:
                prompt,

              store:
                false,

              response_format: {
                type:
                  "text",

                mime_type:
                  "application/json",

                schema,
              },
            }),
        }
      );

    const body:
      unknown =
      await response.json();

    if (!response.ok) {
      const details =
        isRecord(body) &&
        isRecord(body.error) &&
        typeof body.error.message === "string"
          ? body.error.message
          : `${response.status} ${response.statusText}`;

      throw new Error(
        `Gemini interaction failed: ${details}`
      );
    }

    if (!isRecord(body)) {
      throw new Error(
        "Gemini interaction returned an invalid response body"
      );
    }

    const text =
      readModelOutputText(
        body
      );

    return parseStructuredOutput(
      text
    );
  }
}
