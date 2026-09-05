"use client";

import {
  useState,
} from "react";

const pipeline = [
  [
    "01",
    "Detect",
    "Production-sales divergence identified",
  ],
  [
    "02",
    "Prioritize",
    "Material case admitted for investigation",
  ],
  [
    "03",
    "Investigate",
    "Sectors evidence collected",
  ],
  [
    "04",
    "Evidence",
    "Canonical evidence bound",
  ],
  [
    "05",
    "Synthesize",
    "Intelligence brief produced",
  ],
] as const;

interface RXObservation {
  metric?:
    string;

  value?:
    number;

  unit?:
    string;
}

interface RXEvidenceItem {
  evidenceId?:
    string;

  source?:
    string;

  truthClass?:
    string;

  description?:
    string;
}

interface RXAcceptedWorkspaceResult {
  status:
    "ACCEPTED";

  stage:
    "COMPLETE";

  causalConclusion:
    "UNKNOWN";

  company: {
    id:
      string;

    sectorsSlug:
      string;

    ticker:
      string;

    commodity:
      string;
  };

  year:
    number;

  divergence: {
    production:
      RXObservation | null;

    sales:
      RXObservation | null;
  };

  investigationCase:
    unknown;

  evidence: {
    pack: {
      evidence?:
        RXEvidenceItem[];
    };
  };

  hypothesis:
    Record<string, unknown>;

  challenge:
    Record<string, unknown>;

  brief:
    Record<string, unknown>;
}

interface RXRejectedWorkspaceResult {
  status:
    "REJECTED";

  stage?:
    string;

  causalConclusion?:
    "UNKNOWN";

  issues?:
    string[];
}

type RXWorkspaceResult =
  | RXAcceptedWorkspaceResult
  | RXRejectedWorkspaceResult;

function readText(
  value:
    unknown,
  keys:
    string[],
) {
  if (
    typeof value ===
      "string" &&
    value.trim().length >
      0
  ) {
    return value;
  }

  if (
    typeof value !==
      "object" ||
    value ===
      null
  ) {
    return null;
  }

  const record =
    value as
      Record<string, unknown>;

  for (
    const key
    of keys
  ) {
    const candidate =
      record[key];

    if (
      typeof candidate ===
        "string" &&
      candidate.trim().length >
        0
    ) {
      return candidate;
    }
  }

  return null;
}

function readTextList(
  value:
    unknown,
  keys:
    string[],
) {
  if (
    typeof value !==
      "object" ||
    value ===
      null
  ) {
    return [];
  }

  const record =
    value as
      Record<string, unknown>;

  for (
    const key
    of keys
  ) {
    const candidate =
      record[key];

    if (
      Array.isArray(
        candidate,
      )
    ) {
      const values =
        candidate.filter(
          (
            item,
          ): item is string =>
            typeof item ===
              "string" &&
            item.trim().length >
              0,
        );

      if (
        values.length >
        0
      ) {
        return values;
      }
    }
  }

  return [];
}

function formatObservation(
  observation:
    RXObservation | null,
) {
  if (
    !observation ||
    typeof observation.value !==
      "number"
  ) {
    return "—";
  }

  return [
    observation.value,
    observation.unit,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function Home() {
  const [
    result,
    setResult,
  ] =
    useState<RXWorkspaceResult | null>(
      null,
    );

  const [
    isRunning,
    setIsRunning,
  ] =
    useState(
      false,
    );

  const [
    runtimeError,
    setRuntimeError,
  ] =
    useState<string | null>(
      null,
    );

  const accepted =
    result?.status ===
      "ACCEPTED"
      ? result
      : null;

  const evidenceItems =
    accepted?.evidence
      .pack
      .evidence ??
    [];

  const production =
    accepted?.divergence
      .production ??
    null;

  const sales =
    accepted?.divergence
      .sales ??
    null;

  const productionValue =
    production &&
    typeof production.value ===
      "number"
      ? production.value
      : null;

  const salesValue =
    sales &&
    typeof sales.value ===
      "number"
      ? sales.value
      : null;

  const divergenceValue =
    productionValue !==
      null &&
    salesValue !==
      null
      ? salesValue -
        productionValue
      : null;

  const hypothesisText =
    accepted
      ? readText(
          accepted.hypothesis,
          [
            "statement",
            "hypothesis",
            "summary",
          ],
        )
      : null;

  const challengeText =
    accepted
      ? readText(
          accepted.challenge,
          [
            "critique",
            "challenge",
            "summary",
          ],
        )
      : null;

  const briefText =
    accepted
      ? readText(
          accepted.brief,
          [
            "executiveSummary",
            "summary",
            "brief",
          ],
        )
      : null;

  const alternatives =
    accepted
      ? readTextList(
          accepted.brief,
          [
            "alternativeExplanations",
            "alternatives",
          ],
        )
      : [];

  const uncertainties =
    accepted
      ? readTextList(
          accepted.brief,
          [
            "uncertainties",
          ],
        )
      : [];

  async function runInvestigation() {
    setIsRunning(
      true,
    );

    setRuntimeError(
      null,
    );

    setResult(
      null,
    );

    try {
      const response =
        await fetch(
          "/api/investigate/production-sales",
          {
            method:
              "POST",

            headers: {
              "content-type":
                "application/json",
            },

            body:
              JSON.stringify({
                companyId:
                  "rx-company-aadi",

                sectorsSlug:
                  "pt-adaro-andalan-indonesia-tbk",

                ticker:
                  "AADI.JK",

                commodity:
                  "COAL",

                year:
                  2024,
              }),
          },
        );

      const payload =
        await response.json() as
          RXWorkspaceResult;

      setResult(
        payload,
      );

      if (
        payload.status ===
          "REJECTED"
      ) {
        setRuntimeError(
          payload.issues?.join(
            ", ",
          ) ??
            "Investigation rejected.",
        );
      }
    } catch {
      setRuntimeError(
        "Unable to complete the live investigation.",
      );
    } finally {
      setIsRunning(
        false,
      );
    }
  }

  return (
    <main className="rx-shell">
      <header className="rx-topbar">
        <div className="rx-brand">
          <span className="rx-brand-mark">
            RX
          </span>

          <div>
            <p className="rx-eyebrow">
              RXseven Intelligence
            </p>

            <p className="rx-brand-name">
              Mining Divergence Investigator
            </p>
          </div>
        </div>

        <div className="rx-topbar-status">
          <span className="rx-live-dot" />
          {isRunning
            ? "INVESTIGATING"
            : accepted
              ? "INTELLIGENCE READY"
              : "ENGINE READY"}
        </div>
      </header>

      <div className="rx-workspace">
        <section className="rx-hero">
          <div>
            <div className="rx-kicker-row">
              <span className="rx-kicker">
                SECTORS / MARKET INTELLIGENCE
              </span>

              <span className="rx-demo-badge">
                AADI / FY 2024
              </span>
            </div>

            <h1>
              Investigate the divergence.
              <span>
                {" "}
                Prove the intelligence.
              </span>
            </h1>

            <p className="rx-hero-copy">
              Evidence-first investigation for material mining
              divergences. Deterministic analysis establishes the
              facts. AI proposes explanations. RX challenges them
              against the evidence.
            </p>

            <button
              type="button"
              className="rx-complete-badge"
              disabled={
                isRunning
              }
              onClick={
                runInvestigation
              }
            >
              {isRunning
                ? "RUNNING INVESTIGATION..."
                : accepted
                  ? "RUN INVESTIGATION AGAIN"
                  : "RUN AADI INVESTIGATION"}
            </button>

            {runtimeError ? (
              <p className="rx-hero-copy">
                Investigation status:{" "}
                {runtimeError}
              </p>
            ) : null}
          </div>

          <div className="rx-doctrine">
            <p>RX DOCTRINE</p>
            <strong>
              AI PROPOSES.
            </strong>
            <strong>
              {" "}
              RX PROVES.
            </strong>
            <span>
              CAUSAL CONCLUSION REMAINS UNKNOWN
            </span>
          </div>
        </section>

        <section className="rx-case-grid">
          <article className="rx-company-card">
            <div className="rx-card-heading">
              <span>
                INVESTIGATION SUBJECT
              </span>

              <span className="rx-status-neutral">
                CANONICAL
              </span>
            </div>

            <h2>
              PT Adaro Andalan Indonesia Tbk
            </h2>

            <div className="rx-company-meta">
              <div>
                <span>
                  SYMBOL
                </span>

                <strong>
                  AADI.JK
                </strong>
              </div>

              <div>
                <span>
                  COMMODITY
                </span>

                <strong>
                  COAL
                </strong>
              </div>

              <div>
                <span>
                  PERIOD
                </span>

                <strong>
                  FY 2024
                </strong>
              </div>
            </div>
          </article>

          <article className="rx-divergence-card">
            <p>
              PRODUCTION / SALES
            </p>

            <strong>
              {accepted
                ? "DETECTED"
                : "READY"}
            </strong>

            <div className="rx-divergence-line">
              <span />
              <i />
              <span />
            </div>

            <small>
              {accepted &&
              divergenceValue !==
                null
                ? `Sales exceed production by ${divergenceValue.toFixed(
                    2,
                  )} ${
                    sales?.unit ??
                    production?.unit ??
                    ""
                  }`
                : "Run the investigation to establish the live divergence"}
            </small>
          </article>

          <article className="rx-company-card">
            <div className="rx-card-heading">
              <span>
                SOURCE FACTS
              </span>

              <span className="rx-status-neutral">
                SECTORS
              </span>
            </div>

            <h2>
              FY 2024 Operations
            </h2>

            <div className="rx-company-meta">
              <div>
                <span>
                  PRODUCTION
                </span>

                <strong>
                  {formatObservation(
                    production,
                  )}
                </strong>
              </div>

              <div>
                <span>
                  SALES
                </span>

                <strong>
                  {formatObservation(
                    sales,
                  )}
                </strong>
              </div>
            </div>
          </article>
        </section>

        <section className="rx-panel">
          <div className="rx-section-heading">
            <div>
              <p>
                INVESTIGATION PIPELINE
              </p>

              <h2>
                From signal to defensible intelligence
              </h2>
            </div>

            <span className="rx-complete-badge">
              {accepted
                ? "COMPLETE"
                : isRunning
                  ? "RUNNING"
                  : "READY"}
            </span>
          </div>

          <div className="rx-pipeline">
            {pipeline.map(
              ([
                number,
                title,
                description,
              ]) => (
                <div
                  className="rx-pipeline-step"
                  key={number}
                >
                  <div className="rx-step-number">
                    {number}
                  </div>

                  <div>
                    <strong>
                      {title}
                    </strong>

                    <span>
                      {description}
                    </span>
                  </div>

                  <div className="rx-step-check">
                    {accepted
                      ? "✓"
                      : "·"}
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="rx-panel">
          <div className="rx-section-heading">
            <div>
              <p>
                EVIDENCE LAYER
              </p>

              <h2>
                Every claim remains traceable
              </h2>
            </div>

            <span className="rx-evidence-count">
              {String(
                evidenceItems.length,
              ).padStart(
                2,
                "0",
              )}{" "}
              ADMITTED ITEMS
            </span>
          </div>

          <div className="rx-evidence-grid">
            {evidenceItems.length >
            0 ? (
              evidenceItems.map(
                (
                  item,
                  index,
                ) => (
                  <article
                    className="rx-evidence-card"
                    key={
                      item.evidenceId ??
                      index
                    }
                  >
                    <div className="rx-evidence-card-top">
                      <span>
                        EVIDENCE
                      </span>

                      <strong>
                        {String(
                          index +
                            1,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </strong>
                    </div>

                    <h3>
                      {item.truthClass ??
                        "ADMITTED"}
                    </h3>

                    <p>
                      {item.description ??
                        "Canonical admitted evidence"}
                    </p>

                    <div className="rx-source-row">
                      <span>
                        SOURCE
                      </span>

                      <strong>
                        {item.source ??
                          "SECTORS"}
                      </strong>
                    </div>
                  </article>
                ),
              )
            ) : (
              <article className="rx-evidence-card">
                <div className="rx-evidence-card-top">
                  <span>
                    EVIDENCE
                  </span>

                  <strong>
                    00
                  </strong>
                </div>

                <h3>
                  Awaiting investigation
                </h3>

                <p>
                  Live admitted evidence will appear here after
                  the investigation completes.
                </p>

                <div className="rx-source-row">
                  <span>
                    SOURCE
                  </span>

                  <strong>
                    SECTORS
                  </strong>
                </div>
              </article>
            )}
          </div>
        </section>

        <section className="rx-intelligence-grid">
          <article className="rx-panel rx-hypothesis">
            <div className="rx-section-heading compact">
              <div>
                <p>
                  EVIDENCE-BOUNDED HYPOTHESIS
                </p>

                <h2>
                  Proposed explanation
                </h2>
              </div>

              <span className="rx-ai-badge">
                AI
              </span>
            </div>

            <blockquote>
              {hypothesisText ??
                "No hypothesis has been produced. Run the investigation to synthesize admitted evidence."}
            </blockquote>
          </article>

          <article className="rx-panel rx-challenge">
            <div className="rx-section-heading compact">
              <div>
                <p>
                  ADVERSARIAL CHALLENGE
                </p>

                <h2>
                  What could make it wrong?
                </h2>
              </div>

              <span className="rx-challenge-badge">
                {accepted
                  ? "CHALLENGED"
                  : "WAITING"}
              </span>
            </div>

            <div className="rx-challenge-item">
              <span>
                01
              </span>

              <p>
                {challengeText ??
                  "The adversarial challenge will appear after evidence-bounded synthesis completes."}
              </p>
            </div>
          </article>
        </section>

        <section className="rx-brief">
          <div className="rx-brief-header">
            <div>
              <p>
                FINAL INTELLIGENCE BRIEF
              </p>

              <h2>
                Evidence before explanation.
              </h2>
            </div>

            <div className="rx-causal">
              <span>
                CAUSAL CONCLUSION
              </span>

              <strong>
                UNKNOWN
              </strong>
            </div>
          </div>

          <div className="rx-brief-body">
            <div className="rx-summary">
              <span className="rx-mini-title">
                EXECUTIVE SUMMARY
              </span>

              <p>
                {briefText ??
                  "Run the AADI investigation to produce an evidence-bounded intelligence brief."}
              </p>
            </div>

            <div className="rx-brief-columns">
              <div>
                <span className="rx-mini-title">
                  ALTERNATIVE EXPLANATIONS
                </span>

                {alternatives.length >
                0 ? (
                  alternatives.map(
                    (
                      item,
                      index,
                    ) => (
                      <p
                        key={
                          `${item}-${index}`
                        }
                      >
                        {item}
                      </p>
                    ),
                  )
                ) : (
                  <p>
                    Awaiting synthesis
                  </p>
                )}
              </div>

              <div>
                <span className="rx-mini-title">
                  UNCERTAINTIES
                </span>

                {uncertainties.length >
                0 ? (
                  uncertainties.map(
                    (
                      item,
                      index,
                    ) => (
                      <p
                        key={
                          `${item}-${index}`
                        }
                      >
                        {item}
                      </p>
                    ),
                  )
                ) : (
                  <p>
                    Awaiting synthesis
                  </p>
                )}
              </div>

              <div>
                <span className="rx-mini-title">
                  UNRESOLVED
                </span>

                <p>
                  Causal mechanism
                </p>

                <p>
                  Relative contribution of each factor
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="rx-footer">
          <span>
            RXseven / RX Mining Divergence Investigator
          </span>

          <span>
            DETECT → PRIORITIZE → INVESTIGATE → EVIDENCE → INTELLIGENCE
          </span>
        </footer>
      </div>
    </main>
  );
}