"use client";

import {
  useMemo,
  useState,
} from "react";

interface MarketInvestigatorProps {
  initialSymbol: string;
}

interface CompanyOption {
  symbol: string;
  ticker: string;
  companyId: string;
  name: string;
}

interface MarketMetricResult {
  first: {
    date: string;
    value: number;
    unit: string;
  };

  latest: {
    date: string;
    value: number;
    unit: string;
  };

  absoluteChange: number;

  percentageChange: number | null;

  observationCount: number;
}

interface MarketApiResult {
  status: "ACCEPTED";
  stage: "COMPLETE";
  path: "market";
  companyId: string;
  ticker: string;

  requestedPeriod: {
    start: string;
    end: string;
  };

  market: {
    status:
      | "MARKET_EVIDENCE_AVAILABLE"
      | "NO_MARKET_EVIDENCE";

    symbol: string | null;

    period: {
      start: string | null;
      end: string | null;
    };

    price: MarketMetricResult | null;
    volume: MarketMetricResult | null;
    marketCap: MarketMetricResult | null;

    observedRelationship: string;

    causalConclusion: "UNKNOWN";
  };

  evidence: {
    collection: {
      evidence: Array<{
        evidenceId: string;
        source: string;
        sourceReference: string;
        truthClass: string;
        description: string;
      }>;
    };

    admittedObservations: Array<{
      id: string;
      symbol: string;
      metric: string;
      value: number;
      sourceField: string;
    }>;
  };

  causalConclusion: "UNKNOWN";
  issues: [];
}

const COMPANIES: CompanyOption[] = [
  {
    symbol: "BUMI",
    ticker: "BUMI.JK",
    companyId: "BUMI",
    name: "PT Bumi Resources Tbk",
  },
  {
    symbol: "BYAN",
    ticker: "BYAN.JK",
    companyId: "BYAN",
    name: "PT Bayan Resources Tbk",
  },
  {
    symbol: "GEMS",
    ticker: "GEMS.JK",
    companyId: "GEMS",
    name: "PT Golden Energy Mines Tbk",
  },
  {
    symbol: "ITMG",
    ticker: "ITMG.JK",
    companyId: "ITMG",
    name: "PT Indo Tambangraya Megah Tbk",
  },
  {
    symbol: "ADMR",
    ticker: "ADMR.JK",
    companyId: "ADMR",
    name: "PT Alamtri Minerals Indonesia Tbk",
  },
];

type RangePreset =
  | 30
  | 90;

function normalizeSymbol(
  value: string,
): string {
  const symbol =
    value.trim().toUpperCase();

  return COMPANIES.some(
    (company) =>
      company.symbol === symbol,
  )
    ? symbol
    : "BUMI";
}

function isoDate(
  date: Date,
): string {
  return date
    .toISOString()
    .slice(0, 10);
}

function todayUtcDate(): string {
  const now =
    new Date();

  return isoDate(
    new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
      ),
    ),
  );
}

function subtractCalendarDays(
  end: string,
  inclusiveDays: number,
): string {
  const date =
    new Date(
      `${end}T00:00:00Z`,
    );

  date.setUTCDate(
    date.getUTCDate() -
      (inclusiveDays - 1),
  );

  return isoDate(date);
}

function formatNumber(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 2,
    },
  ).format(value);
}

function formatPercentage(
  value: number | null,
): string {
  if (value === null) {
    return "N/A";
  }

  const sign =
    value > 0
      ? "+"
      : "";

  return `${sign}${value.toFixed(2)}%`;
}

function MetricCard({
  label,
  metric,
}: {
  label: string;
  metric: MarketMetricResult | null;
}) {
  return (
    <article className="rx-market-metric-card">
      <span className="rx-kicker">
        {label}
      </span>

      {metric ? (
        <>
          <strong>
            {formatNumber(
              metric.latest.value,
            )}
            {" "}
            {metric.latest.unit}
          </strong>

          <p>
            {metric.first.date}
            {" -> "}
            {metric.latest.date}
          </p>

          <small>
            CHANGE{" "}
            {formatNumber(
              metric.absoluteChange,
            )}
            {" "}
            {metric.latest.unit}
            {" | "}
            {formatPercentage(
              metric.percentageChange,
            )}
            {" | "}
            {metric.observationCount}
            {" OBSERVATIONS"}
          </small>
        </>
      ) : (
        <>
          <strong>
            NOT ADMITTED
          </strong>

          <p>
            No admitted evidence for
            this market metric.
          </p>
        </>
      )}
    </article>
  );
}

export default function MarketInvestigator({
  initialSymbol,
}: MarketInvestigatorProps) {
  const [
    selectedSymbol,
    setSelectedSymbol,
  ] = useState(
    normalizeSymbol(
      initialSymbol,
    ),
  );

  const [
    rangePreset,
    setRangePreset,
  ] = useState<RangePreset>(30);

  const [
    endDate,
    setEndDate,
  ] = useState(
    todayUtcDate(),
  );

  const [
    result,
    setResult,
  ] = useState<
    MarketApiResult | null
  >(null);

  const [
    runtimeError,
    setRuntimeError,
  ] = useState<
    string | null
  >(null);

  const [
    running,
    setRunning,
  ] = useState(false);

  const [
    showEvidence,
    setShowEvidence,
  ] = useState(false);

  const company =
    COMPANIES.find(
      (item) =>
        item.symbol ===
        selectedSymbol,
    ) ?? COMPANIES[0];

  const startDate =
    useMemo(
      () =>
        subtractCalendarDays(
          endDate,
          rangePreset,
        ),
      [
        endDate,
        rangePreset,
      ],
    );

  function clearResult() {
    setResult(null);
    setRuntimeError(null);
    setShowEvidence(false);
  }

  function selectCompany(
    symbol: string,
  ) {
    setSelectedSymbol(symbol);
    clearResult();
  }

  function selectRange(
    days: RangePreset,
  ) {
    setRangePreset(days);
    clearResult();
  }

  function selectEndDate(
    value: string,
  ) {
    setEndDate(value);
    clearResult();
  }

  async function runInvestigation() {
    setRunning(true);
    setRuntimeError(null);
    setResult(null);
    setShowEvidence(false);

    try {
      const response =
        await fetch(
          "/api/investigate/market",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              companyId:
                company.companyId,

              ticker:
                company.ticker,

              start:
                startDate,

              end:
                endDate,
            }),
          },
        );

      const payload =
        (await response.json()) as
          | MarketApiResult
          | {
              issues?: string[];
            };

      if (
        !response.ok ||
        !(
          "status" in payload
        ) ||
        payload.status !==
          "ACCEPTED"
      ) {
        const message =
          "issues" in payload &&
          Array.isArray(
            payload.issues,
          )
            ? payload.issues.join(
                ", ",
              )
            : "Market investigation was rejected.";

        setRuntimeError(
          message,
        );

        return;
      }

      setResult(payload);
    } catch (error: unknown) {
      setRuntimeError(
        error instanceof Error
          ? error.message
          : "Market investigation failed.",
      );
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
          <span className="rx-live-dot" />
          MARKET PATH READY
        </div>
      </header>

      <div className="rx-workspace rx-market-investigator">
        <a
          className="rx-investigator-back"
          href={
            `/investigations?symbol=${encodeURIComponent(
              selectedSymbol,
            )}`
          }
        >
          <span>{"<-"}</span>
          BACK
        </a>

        <section className="rx-market-hero">
          <div className="rx-kicker-row">
            <span className="rx-kicker">
              MARKET INVESTIGATION
            </span>

            <span className="rx-engine-badge">
              {company.symbol}
            </span>
          </div>

          <h1>
            What changed in the
            market record?
          </h1>

          <p>
            RX compares admitted daily
            closing price, trading
            volume, and market
            capitalization facts across
            the selected period.
            Observed change is not a
            causal explanation.
          </p>
        </section>

        <section className="rx-market-control-grid">
          <article className="rx-market-control-card">
            <span className="rx-kicker">
              COMPANY
            </span>

            <div className="rx-market-company-buttons">
              {COMPANIES.map(
                (item) => (
                  <button
                    key={
                      item.symbol
                    }
                    type="button"
                    className={
                      item.symbol ===
                      selectedSymbol
                        ? "is-active"
                        : ""
                    }
                    onClick={() =>
                      selectCompany(
                        item.symbol,
                      )
                    }
                  >
                    {item.symbol}
                  </button>
                ),
              )}
            </div>

            <strong>
              {company.name}
            </strong>

            <small>
              {company.ticker}
            </small>
          </article>

          <article className="rx-market-control-card">
            <span className="rx-kicker">
              MARKET PERIOD
            </span>

            <div className="rx-market-period-buttons">
              {[30, 90].map(
                (days) => (
                  <button
                    key={days}
                    type="button"
                    className={
                      rangePreset ===
                      days
                        ? "is-active"
                        : ""
                    }
                    onClick={() =>
                      selectRange(
                        days as
                          RangePreset,
                      )
                    }
                  >
                    {days} DAYS
                  </button>
                ),
              )}
            </div>

            <label className="rx-market-date-field">
              <span>
                END DATE
              </span>

              <input
                type="date"
                value={
                  endDate
                }
                onChange={
                  (event) =>
                    selectEndDate(
                      event.target
                        .value,
                    )
                }
              />
            </label>

            <small>
              {startDate}
              {" -> "}
              {endDate}
            </small>
          </article>
        </section>

        <section className="rx-market-action-card">
          <div>
            <span className="rx-kicker">
              INVESTIGATION CASE
            </span>

            <h2>
              {company.symbol}
              {" Market Record"}
            </h2>

            <p>
              Inspect admitted market
              observations for the
              selected {rangePreset}-day
              calendar window. RX does
              not infer bullish or
              bearish state, anomaly,
              mining causality, or event
              explanation from this
              path.
            </p>
          </div>

          <button
            type="button"
            className="rx-run-button"
            disabled={
              running ||
              endDate.length === 0
            }
            onClick={
              runInvestigation
            }
          >
            {running
              ? "RUNNING..."
              : "INITIATE"}
          </button>
        </section>

        {runtimeError ? (
          <section className="rx-market-message-card">
            <span className="rx-kicker">
              INVESTIGATION REJECTED
            </span>

            <p>
              {runtimeError}
            </p>
          </section>
        ) : null}

        {result ? (
          <>
            <section className="rx-market-result-heading">
              <div>
                <span className="rx-kicker">
                  ADMITTED MARKET EVIDENCE
                </span>

                <h2>
                  {company.symbol}
                  {" Market Record"}
                </h2>
              </div>

              <span className="rx-engine-badge">
                CAUSALITY UNKNOWN
              </span>
            </section>

            <section className="rx-market-metric-grid">
              <MetricCard
                label="CLOSING PRICE"
                metric={
                  result.market
                    .price
                }
              />

              <MetricCard
                label="TRADING VOLUME"
                metric={
                  result.market
                    .volume
                }
              />

              <MetricCard
                label="MARKET CAP"
                metric={
                  result.market
                    .marketCap
                }
              />
            </section>

            <section className="rx-market-interpretation-card">
              <span className="rx-kicker">
                EVIDENCE INTERPRETATION
              </span>

              <p>
                {
                  result.market
                    .observedRelationship
                }
              </p>

              <small>
                This is a deterministic
                description of admitted
                market facts. RX does
                not infer why the
                observed change
                occurred.
              </small>

              <button
                type="button"
                onClick={() =>
                  setShowEvidence(
                    (value) =>
                      !value,
                  )
                }
              >
                {showEvidence
                  ? "HIDE EVIDENCE"
                  : "SHOW EVIDENCE"}
              </button>
            </section>

            {showEvidence ? (
              <section className="rx-market-evidence-card">
                <span className="rx-kicker">
                  ADMITTED EVIDENCE
                </span>

                <p>
                  {
                    result.evidence
                      .admittedObservations
                      .length
                  }
                  {" "}
                  normalized market
                  observations admitted.
                </p>

                <div className="rx-market-evidence-list">
                  {result.evidence
                    .collection
                    .evidence
                    .map(
                      (item) => (
                        <article
                          key={
                            item.evidenceId
                          }
                        >
                          <strong>
                            {
                              item.truthClass
                            }
                          </strong>

                          <p>
                            {
                              item.description
                            }
                          </p>

                          <small>
                            {
                              item.sourceReference
                            }
                          </small>
                        </article>
                      ),
                    )}
                </div>
              </section>
            ) : null}
          </>
        ) : null}

        <footer className="rx-footer">
          <span>
            RXseven / Market Investigator
          </span>

          <span>
            MARKET FACTS | ADMITTED EVIDENCE | CAUSALITY UNKNOWN
          </span>
        </footer>
      </div>
    </main>
  );
}