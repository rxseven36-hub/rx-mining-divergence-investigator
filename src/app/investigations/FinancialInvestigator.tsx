"use client";

import {
  useState,
} from "react";

import Link from "next/link";

interface FinancialInvestigatorProps {
  initialSymbol: string;
}

interface CompanyOption {
  symbol: string;
  companyId: string;
  sectorsSlug: string;
  ticker: string;
  commodity:
    "COAL" |
    "GOLD" |
    "NICKEL" |
    "COPPER";
}

const COMPANIES:
  CompanyOption[] = [
    {
      symbol: "BUMI",
      companyId: "BUMI",
      sectorsSlug:
        "pt-bumi-resources-tbk",
      ticker: "BUMI",
      commodity: "COAL",
    },
    {
      symbol: "ADMR",
      companyId: "rx-company-admr",
      sectorsSlug:
        "pt-adaro-minerals-indonesia-tbk",
      ticker: "ADMR.JK",
      commodity: "COAL",
    },
    {
      symbol: "BYAN",
      companyId: "rx-company-byan",
      sectorsSlug:
        "pt-bayan-resources-tbk",
      ticker: "BYAN.JK",
      commodity: "COAL",
    },
    {
      symbol: "ITMG",
      companyId: "rx-company-itmg",
      sectorsSlug:
        "pt-indo-tambangraya-megah-tbk",
      ticker: "ITMG.JK",
      commodity: "COAL",
    },
    {
      symbol: "GEMS",
      companyId: "rx-company-gems",
      sectorsSlug:
        "pt-golden-energy-mines-tbk",
      ticker: "GEMS.JK",
      commodity: "COAL",
    },
  ];

interface FinancialMetric {
  family: string;
  metric: string;
  firstYear: number;
  firstValue: number | null;
  latestYear: number;
  latestValue: number | null;
  absoluteChange: number | null;
  percentageChange: number | null;
  observationCount: number;
}

interface FinancialAnalysis {
  status:
    "ANALYZED" |
    "NO_FINANCIAL_EVIDENCE";

  companyId:
    string | null;

  period: {
    startYear:
      number | null;

    endYear:
      number | null;
  };

  metrics:
    FinancialMetric[];

  observedRelationship:
    string;

  causalConclusion:
    "UNKNOWN";
}

interface FinancialExecution {
  status:
    string;

  execution?: {
    status:
      string;

    analysis?:
      FinancialAnalysis | null;

    issue?:
      string | null;
  } | null;

  issues?:
    string[];
}

interface AcceptedResponse {
  status:
    "ACCEPTED";

  stage:
    "DETERMINISTIC_INVESTIGATION";

  caseId:
    string;

  planId:
    string;

  evidenceExecution: {
    financial:
      FinancialExecution[];

    summary: {
      financialRequestCount:
        number;

      financialAnalyzedCount:
        number;

      financialEvidenceRejectedCount:
        number;

      financialExecutionFailedCount:
        number;

      financialPreparationRejectedCount:
        number;

      financialBindingRejectedCount:
        number;
    };
  };

  causalConclusion:
    "UNKNOWN";
}

interface RejectedResponse {
  status:
    "REJECTED";

  stage?:
    string;

  issues?:
    string[];

  causalConclusion?:
    "UNKNOWN";
}

type ApiResponse =
  | AcceptedResponse
  | RejectedResponse;

function formatNumber(
  value:
    number | null,
): string {
  if (value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 4,
    },
  ).format(value);
}

function formatPercent(
  value:
    number | null,
): string {
  if (value === null) {
    return "N/A";
  }

  return `${formatNumber(value)}%`;
}

function humanMetric(
  value: string,
): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

export default function FinancialInvestigator({
  initialSymbol,
}: FinancialInvestigatorProps) {
  const normalizedInitial =
    initialSymbol
      .trim()
      .toUpperCase();

  const initialCompany =
    COMPANIES.find(
      (company) =>
        company.symbol ===
        normalizedInitial,
    ) ??
    COMPANIES[0];

  const [
    selectedSymbol,
    setSelectedSymbol,
  ] = useState(
    initialCompany.symbol,
  );

  const [
    year,
    setYear,
  ] = useState(2024);

  const [
    running,
    setRunning,
  ] = useState(false);

  const [
    response,
    setResponse,
  ] =
    useState<ApiResponse | null>(
      null,
    );

  const selectedCompany =
    COMPANIES.find(
      (company) =>
        company.symbol ===
        selectedSymbol,
    ) ??
    COMPANIES[0];

  const analysis =
    response?.status ===
      "ACCEPTED"
      ? response
          .evidenceExecution
          .financial
          .find(
            (outcome) =>
              outcome.status ===
                "EXECUTED" &&
              outcome.execution
                ?.status ===
                "ANALYZED",
          )
          ?.execution
          ?.analysis ??
        null
      : null;

  async function runFinancial() {
    setRunning(true);
    setResponse(null);

    try {
      const request =
        await fetch(
          "/api/investigate/financial",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                companyId:
                  selectedCompany.companyId,

                sectorsSlug:
                  selectedCompany.sectorsSlug,

                ticker:
                  selectedCompany.ticker,

                commodity:
                  selectedCompany.commodity,

                year,
              }),
          },
        );

      const body =
        await request.json() as
          ApiResponse;

      setResponse(body);
    } catch {
      setResponse({
        status:
          "REJECTED",

        stage:
          "CLIENT",

        issues: [
          "FINANCIAL_INVESTIGATION_REQUEST_FAILED",
        ],

        causalConclusion:
          "UNKNOWN",
      });
    } finally {
      setRunning(false);
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
          FINANCIAL EVIDENCE READY
        </div>
      </header>

      <div className="rx-workspace">
        <section
          style={{
            padding:
              "28px 0 18px",
          }}
        >
          <span className="rx-kicker">
            FINANCIAL INVESTIGATION
          </span>

          <h1
            style={{
              margin:
                "10px 0 12px",
              fontSize:
                "clamp(36px, 5vw, 60px)",
              lineHeight:
                0.98,
              letterSpacing:
                "-0.045em",
            }}
          >
            Financial Evidence
          </h1>

          <p
            style={{
              maxWidth: 800,
              color: "#8ba9b8",
              fontSize: 16,
              lineHeight: 1.7,
            }}
          >
            Provider-supplied financial observations are admitted
            before deterministic analysis. RX does not infer currency,
            recompute provider ratios, score company quality, or infer
            causality.
          </p>
        </section>

        <section
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "end",
            marginBottom: 24,
          }}
        >
          <div>
            <span
              style={{
                display: "block",
                marginBottom: 8,
                color: "#7d9aa8",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: ".08em",
              }}
            >
              COMPANY
            </span>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {COMPANIES.map(
                (company) => {
                  const active =
                    company.symbol ===
                    selectedSymbol;

                  return (
                    <button
                      key={
                        company.symbol
                      }
                      type="button"
                      disabled={running}
                      onClick={() =>
                        setSelectedSymbol(
                          company.symbol,
                        )
                      }
                      aria-pressed={
                        active
                      }
                      style={{
                        minWidth: 76,
                        padding:
                          "11px 15px",
                        border:
                          active
                            ? "1px solid rgba(63, 255, 197, 0.72)"
                            : "1px solid rgba(67, 113, 132, 0.38)",
                        borderRadius: 8,
                        background:
                          active
                            ? "rgba(30, 115, 101, 0.38)"
                            : "rgba(6, 17, 23, 0.82)",
                        color:
                          active
                            ? "#dffff4"
                            : "#b7c8d0",
                        boxShadow:
                          active
                            ? "0 0 0 1px rgba(63, 255, 197, 0.10) inset"
                            : "none",
                        cursor:
                          running
                            ? "wait"
                            : "pointer",
                        fontSize: 12,
                        fontWeight: 900,
                        letterSpacing:
                          ".06em",
                        opacity:
                          running
                            ? 0.7
                            : 1,
                      }}
                    >
                      {company.symbol}
                    </button>
                  );
                },
              )}
            </div>

            <div
              style={{
                marginTop: 10,
                color: "#8ba9b8",
                fontSize: 13,
              }}
            >
              <strong
                style={{
                  color: "#dce8ed",
                }}
              >
                {selectedCompany.symbol}
              </strong>
              {" / "}
              {selectedCompany.sectorsSlug}
            </div>
          </div>

          <label
            className="rxmdi-financial-year-card"
          >
            <span
              className="rxmdi-financial-year-label"
            >
              DISCOVERY YEAR
            </span>

            <span
              className="rxmdi-financial-year-control"
            >
              <input
                type="number"
                min={2000}
                max={2100}
                value={year}
                disabled={running}
                onChange={
                  (event) =>
                    setYear(
                      Number(
                        event.target.value,
                      ),
                    )
                }
                aria-label="Financial discovery year"
              />

              <span
                className="rxmdi-financial-year-meta"
                aria-hidden="true"
              >
                FY
              </span>
            </span>

            <small
              className="rxmdi-financial-year-hint"
            >
              Editable period
            </small>
          </label>

          <button
            type="button"
            onClick={
              runFinancial
            }
            disabled={running}
            aria-busy={running}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 14,
              minWidth: 300,
              minHeight: 72,
              padding: "12px 18px",
              border:
                "1px solid rgba(63, 255, 197, 0.55)",
              borderRadius: 12,
              background:
                running
                  ? "rgba(22, 74, 67, 0.72)"
                  : "linear-gradient(135deg, rgba(20, 91, 80, 0.92), rgba(6, 24, 30, 0.96))",
              color: "#effffb",
              boxShadow:
                "0 0 0 1px rgba(63, 255, 197, 0.06) inset, 0 12px 34px rgba(0, 0, 0, 0.24)",
              cursor:
                running
                  ? "wait"
                  : "pointer",
              textAlign: "left",
              opacity:
                running
                  ? 0.78
                  : 1,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "grid",
                placeItems: "center",
                width: 42,
                height: 42,
                flex: "0 0 42px",
                borderRadius: 10,
                border:
                  "1px solid rgba(63, 255, 197, 0.35)",
                background:
                  "rgba(63, 255, 197, 0.08)",
                color: "#3fffc5",
                fontSize: 17,
                fontWeight: 900,
              }}
            >
              {running
                ? "..."
                : "◆"}
            </span>

            <span
              style={{
                display: "grid",
                gap: 3,
              }}
            >
              <small
                style={{
                  color: "#7faea1",
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: ".14em",
                }}
              >
                DETERMINISTIC EVIDENCE ENGINE
              </small>

              <strong
                style={{
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 950,
                  letterSpacing: ".035em",
                }}
              >
                {running
                  ? "INVESTIGATING..."
                  : "RUN FINANCIAL INVESTIGATION"}
              </strong>

              <span
                style={{
                  color: "#9db8b2",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {running
                  ? "Admitting and analyzing provider evidence"
                  : "Admit evidence -> analyze -> inspect"}
              </span>
            </span>

            <span
              aria-hidden="true"
              style={{
                marginLeft: "auto",
                color: "#3fffc5",
                fontSize: 20,
                fontWeight: 900,
              }}
            >
              →
            </span>
          </button>
        </section>

        <section
          style={{
            marginBottom: 24,
            padding: 18,
            border:
              "1px solid rgba(67, 113, 132, 0.28)",
            borderRadius: 12,
          }}
        >
          <strong>
            Evidence doctrine
          </strong>

          <p
            style={{
              margin:
                "8px 0 0",
              color: "#8ba9b8",
              lineHeight: 1.6,
            }}
          >
            Unit and currency remain unspecified unless the admitted
            provider evidence explicitly establishes them. Provider
            ratios are preserved rather than recomputed.
            Causality remains UNKNOWN.
          </p>
        </section>

        {response?.status ===
          "REJECTED" && (
          <section
            style={{
              padding: 18,
              marginBottom: 24,
              border:
                "1px solid rgba(240, 173, 78, 0.4)",
              borderRadius: 12,
            }}
          >
            <strong>
              INVESTIGATION REJECTED
            </strong>

            <p>
              Stage:
              {" "}
              {response.stage ??
                "UNKNOWN"}
            </p>

            <p>
              {(response.issues ??
                [
                  "UNKNOWN_ISSUE",
                ]).join(" | ")}
            </p>
          </section>
        )}

        {response?.status ===
          "ACCEPTED" && (
          <>
            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 10,
                marginBottom: 24,
              }}
            >
              <article>
                <span className="rx-kicker">
                  CASE
                </span>
                <h3>
                  {response.caseId}
                </h3>
              </article>

              <article>
                <span className="rx-kicker">
                  FINANCIAL REQUESTS
                </span>
                <h3>
                  {
                    response
                      .evidenceExecution
                      .summary
                      .financialRequestCount
                  }
                </h3>
              </article>

              <article>
                <span className="rx-kicker">
                  ANALYZED
                </span>
                <h3>
                  {
                    response
                      .evidenceExecution
                      .summary
                      .financialAnalyzedCount
                  }
                </h3>
              </article>

              <article>
                <span className="rx-kicker">
                  CAUSALITY
                </span>
                <h3>
                  {
                    response
                      .causalConclusion
                  }
                </h3>
              </article>
            </section>

            {analysis !== null && (
              <section>
                <div
                  style={{
                    marginBottom: 18,
                  }}
                >
                  <span className="rx-kicker">
                    ADMITTED FINANCIAL EVIDENCE
                  </span>

                  <h2>
                    {
                      analysis.companyId
                    }
                    {" "}
                    {
                      analysis.period.startYear
                    }
                    {" - "}
                    {
                      analysis.period.endYear
                    }
                  </h2>

                  <p
                    style={{
                      color: "#8ba9b8",
                    }}
                  >
                    {
                      analysis.observedRelationship
                    }
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 12,
                  }}
                >
                  {analysis.metrics.map(
                    (
                      metric,
                      index,
                    ) => (
                      <article
                        key={
                          `${metric.family}-${metric.metric}-${index}`
                        }
                        style={{
                          padding: 18,
                          border:
                            "1px solid rgba(54, 225, 181, 0.22)",
                          borderRadius: 12,
                        }}
                      >
                        <span className="rx-kicker">
                          {
                            humanMetric(
                              metric.family,
                            )
                          }
                        </span>

                        <h3>
                          {
                            humanMetric(
                              metric.metric,
                            )
                          }
                        </h3>

                        <p>
                          {
                            metric.firstYear
                          }
                          :
                          {" "}
                          {
                            formatNumber(
                              metric.firstValue,
                            )
                          }
                        </p>

                        <p>
                          {
                            metric.latestYear
                          }
                          :
                          {" "}
                          {
                            formatNumber(
                              metric.latestValue,
                            )
                          }
                        </p>

                        <p>
                          Change:
                          {" "}
                          {
                            formatNumber(
                              metric.absoluteChange,
                            )
                          }
                        </p>

                        <p>
                          Change %:
                          {" "}
                          {
                            formatPercent(
                              metric.percentageChange,
                            )
                          }
                        </p>

                        <small>
                          {
                            metric.observationCount
                          }
                          {" "}
                          admitted observations
                        </small>
                      </article>
                    ),
                  )}
                </div>
              </section>
            )}
          </>
        )}

        <Link
          href={`/investigations?symbol=${encodeURIComponent(
            selectedSymbol,
          )}`}
          style={{
            display: "inline-block",
            margin:
              "28px 0 40px",
            color: "#3fffc5",
            textDecoration: "none",
            fontWeight: 900,
          }}
        >
          {"<- BACK TO INVESTIGATION PATHS"}
        </Link>
      </div>
    </main>
  );
}