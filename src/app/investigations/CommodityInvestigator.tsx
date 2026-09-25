"use client";

import {
  useState,
} from "react";

import TimeSeriesChart from "../../components/rxmdi/TimeSeriesChart";

type Commodity =
  | "COAL"
  | "GOLD"
  | "NICKEL"
  | "COPPER";

interface CommodityMetricResult {
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

  series: Array<{
    date: string;
    value: number;
    unit: string;
  }>;
}

interface CommodityApiResult {
  status: "ACCEPTED";
  stage: "COMPLETE";
  path: "commodity-context";
  commodity: Commodity;

  requestedPeriod: {
    startYear: number;
    endYear: number;
  };

  commodityPrice: {
    status:
      | "COMMODITY_PRICE_EVIDENCE_AVAILABLE"
      | "NO_COMMODITY_PRICE_EVIDENCE";

    commodity: Commodity | null;

    period: {
      start: string | null;
      end: string | null;
    };

    price:
      CommodityMetricResult | null;

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
      commodity: Commodity;
      metric: string;
      value: number;
      sourceField: string;
    }>;
  };

  causalConclusion: "UNKNOWN";
  issues: [];
}

const COMMODITIES:
  Array<{
    id: Commodity;
    label: string;
  }> = [
  {
    id: "COAL",
    label: "Coal",
  },
  {
    id: "GOLD",
    label: "Gold",
  },
  {
    id: "NICKEL",
    label: "Nickel",
  },
  {
    id: "COPPER",
    label: "Copper",
  },
];

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

function currentUtcYear(): number {
  return new Date().getUTCFullYear();
}

function humanizeEvidenceField(value: string): string {
  const labels: Record<string, string> = {
    company_type: "Company type",
    activities: "Activities",
    commodity_type: "Commodity",
    commodities: "Commodities",
    operation_province: "Operation province",
    operation_district: "Operation district",
    mining_site_count: "Reported mining sites",
    mining_contract: "Mining contracts",
    mining_contracts: "Mining contracts",
    mining_license: "Mining licenses",
    mining_licenses: "Mining licenses",
    production: "Production",
    sales: "Sales",
    price: "Price",
    volume: "Trading volume",
    market_cap: "Market capitalization",
    marketcap: "Market capitalization",
    overburden: "Overburden removal",
    strip_ratio: "Strip ratio",
  };

  const normalized = value.trim().toLowerCase();
  return labels[normalized] ??
    normalized
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatEvidenceValue(value: unknown): string {
  if (
    value === null ||
    typeof value === "undefined" ||
    value === ""
  ) {
    return "Not reported";
  }

  if (Array.isArray(value)) {
    return value.length > 0
      ? value.map(formatEvidenceValue).join(", ")
      : "Not reported";
  }

  if (typeof value === "object") {
    return Object.entries(
      value as Record<string, unknown>,
    )
      .map(
        ([key, nested]) =>
          `${humanizeEvidenceField(key)}: ${formatEvidenceValue(nested)}`,
      )
      .join(" | ");
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function describeEvidence(
  description: string | undefined,
): {
  title: string;
  summary: string;
} {
  if (!description?.trim()) {
    return {
      title: "Admitted evidence",
      summary:
        "Canonical source-backed evidence was admitted into this investigation.",
    };
  }

  const separator = description.indexOf(":");
  if (separator < 0) {
    return {
      title: "Admitted evidence",
      summary: description.trim(),
    };
  }

  const key = description.slice(0, separator).trim();
  const rawValue = description.slice(separator + 1).trim();

  let readableValue = rawValue;
  if (
    rawValue.startsWith("[") ||
    rawValue.startsWith("{")
  ) {
    try {
      readableValue = formatEvidenceValue(
        JSON.parse(rawValue) as unknown,
      );
    } catch {
      readableValue =
        "Source-backed detail is available in the admitted evidence record.";
    }
  }

  return {
    title: humanizeEvidenceField(key),
    summary:
      readableValue ||
      "Source-backed detail is available in the admitted evidence record.",
  };
}

function humanizeTruthClass(
  value: string | undefined,
): string {
  const normalized = (value ?? "ADMITTED").toUpperCase();

  if (normalized === "SOURCE_FACT") {
    return "Source-backed fact";
  }

  if (normalized === "ADMITTED") {
    return "Admitted evidence";
  }

  return normalized
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function CommodityInvestigator() {
  const currentYear =
    currentUtcYear();

  const [
    commodity,
    setCommodity,
  ] = useState<Commodity>(
    "COAL",
  );

  const [
    startYear,
    setStartYear,
  ] = useState(
    currentYear - 2,
  );

  const [
    endYear,
    setEndYear,
  ] = useState(
    currentYear,
  );

  const [
    result,
    setResult,
  ] = useState<
    CommodityApiResult | null
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

  const selectedCommodity =
    COMMODITIES.find(
      (item) =>
        item.id === commodity,
    ) ?? COMMODITIES[0];

  function clearResult() {
    setResult(null);
    setRuntimeError(null);
    setShowEvidence(false);
  }

  function selectCommodity(
    value: Commodity,
  ) {
    setCommodity(value);
    clearResult();
  }

  function changeStartYear(
    value: number,
  ) {
    setStartYear(value);
    clearResult();
  }

  function changeEndYear(
    value: number,
  ) {
    setEndYear(value);
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
          "/api/investigate/commodity",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              commodity,
              startYear,
              endYear,
            }),
          },
        );

      const payload =
        (await response.json()) as
          | CommodityApiResult
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
            : "Commodity investigation was rejected.";

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
          : "Commodity investigation failed.",
      );
    } finally {
      setRunning(false);
    }
  }

  const invalidPeriod =
    !Number.isInteger(startYear) ||
    !Number.isInteger(endYear) ||
    startYear < 1900 ||
    endYear > 2100 ||
    startYear > endYear;

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
          COMMODITY PATH READY
        </div>
      </header>

      <div className="rx-workspace rx-market-investigator rx-commodity-investigator rx-commodity-viewport">
        <a
          className="rx-investigator-back"
          href="/investigations"
        >
          <span>{"<-"}</span>
          BACK
        </a>

        <section className="rx-market-hero rx-commodity-hero-compact">
          <div className="rx-kicker-row">
            <span className="rx-kicker">
              COMMODITY CONTEXT
            </span>

            <span className="rx-engine-badge">
              GLOBAL
            </span>
          </div>

          <h1>
            What moved in the
            {" "}
            commodity record?
          </h1>

          <p>
            RX compares admitted commodity
            price observations across the
            selected period. This is
            standalone market context.
            Commodity movement is not
            automatically attributed to any
            mining company, event, or cause.
          </p>
        </section>

        <section className="rx-market-control-grid rx-commodity-control-grid">
          <article className="rx-market-control-card">
            <span className="rx-kicker">
              COMMODITY
            </span>

            <div className="rx-market-company-buttons">
              {COMMODITIES.map(
                (item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      item.id ===
                      commodity
                        ? "is-active"
                        : ""
                    }
                    onClick={() =>
                      selectCommodity(
                        item.id,
                      )
                    }
                  >
                    {item.id}
                  </button>
                ),
              )}
            </div>

            <strong>
              {selectedCommodity.label}
            </strong>

            <small>
              GLOBAL COMMODITY PRICE CONTEXT
            </small>
          </article>

          <article className="rx-market-control-card">
            <span className="rx-kicker">
              EVIDENCE PERIOD
            </span>

            <label className="rx-market-date-field">
              <span>
                START YEAR
              </span>

              <input
                type="number"
                min="1900"
                max="2100"
                step="1"
                value={
                  startYear
                }
                onChange={
                  (event) =>
                    changeStartYear(
                      Number(
                        event.target.value,
                      ),
                    )
                }
              />
            </label>

            <label className="rx-market-date-field">
              <span>
                END YEAR
              </span>

              <input
                type="number"
                min="1900"
                max="2100"
                step="1"
                value={
                  endYear
                }
                onChange={
                  (event) =>
                    changeEndYear(
                      Number(
                        event.target.value,
                      ),
                    )
                }
              />
            </label>

            <small>
              {startYear}
              {" -> "}
              {endYear}
            </small>
          </article>
        </section>

        <section className="rx-market-action-card rx-commodity-action-card">
          <div>
            <span className="rx-kicker">
              INVESTIGATION CASE
            </span>

            <h2>
              {commodity}
              {" Price Movement"}
            </h2>

            <p>
              Inspect admitted commodity
              price observations for the
              selected period. RX describes
              the source-established movement
              only. It does not infer bullish
              or bearish state, anomaly,
              company impact, event
              explanation, or causality.
            </p>
          </div>

          <button
            type="button"
            className="rx-run-button"
            disabled={
              running ||
              invalidPeriod
            }
            onClick={
              runInvestigation
            }
          >
            {running
              ? "RUNNING..."
              : "INVESTIGATE MOVEMENT"}
          </button>
        </section>

        {invalidPeriod ? (
          <section className="rx-market-message-card">
            <span className="rx-kicker">
              PERIOD INVALID
            </span>

            <p>
              Start year must not be after
              end year. Supported year
              values are 1900 through 2100.
            </p>
          </section>
        ) : null}

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
                  ADMITTED COMMODITY EVIDENCE
                </span>

                <h2>
                  {result.commodity}
                  {" Price Movement"}
                </h2>
              </div>

              <span className="rx-engine-badge">
                CAUSALITY UNKNOWN
              </span>
            </section>

            <section className="rx-market-metric-grid">
              <article className="rx-market-metric-card">
                <span className="rx-kicker">
                  COMMODITY PRICE
                </span>

                {result.commodityPrice.price ? (
                  <>
                    <strong>
                      {formatNumber(
                        result.commodityPrice
                          .price.latest.value,
                      )}
                      {" "}
                      {
                        result.commodityPrice
                          .price.latest.unit
                      }
                    </strong>

                    <p>
                      {
                        result.commodityPrice
                          .price.first.date
                      }
                      {" -> "}
                      {
                        result.commodityPrice
                          .price.latest.date
                      }
                    </p>

                    <small>
                      CHANGE{" "}
                      {formatNumber(
                        result.commodityPrice
                          .price.absoluteChange,
                      )}
                      {" "}
                      {
                        result.commodityPrice
                          .price.latest.unit
                      }
                      {" | "}
                      {formatPercentage(
                        result.commodityPrice
                          .price.percentageChange,
                      )}
                      {" | "}
                      {
                        result.commodityPrice
                          .price.observationCount
                      }
                      {" OBSERVATIONS"}
                    </small>
                  </>
                ) : (
                  <>
                    <strong>
                      NOT ADMITTED
                    </strong>

                    <p>
                      No admitted commodity
                      price evidence.
                    </p>
                  </>
                )}
              </article>
            </section>

            {result.commodityPrice.price ? (
              <section
                style={{
                  margin: "12px 0",
                }}
              >
                <TimeSeriesChart
                  label={`${result.commodity} Global Price Trend`}
                  series={
                    result.commodityPrice.price.series
                  }
                />

                <p
                  style={{
                    margin: "8px 2px 0",
                    color: "#668694",
                    fontSize: "10px",
                    lineHeight: 1.55,
                  }}
                >
                  Global commodity context only.
                  RX does not infer company impact
                  or causality from this movement.
                </p>
              </section>
            ) : null}

            <section className="rx-market-interpretation-card">
              <span className="rx-kicker">
                EVIDENCE INTERPRETATION
              </span>

              <p>
                {
                  result.commodityPrice
                    .observedRelationship
                }
              </p>

              <small>
                This is a deterministic
                description of admitted
                commodity-price facts.
                RX does not infer why the
                observed movement occurred
                or what it means for a
                specific company.
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
                  normalized commodity-price
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
                            {describeEvidence(item.description).title}
                          </strong>

                          <p>
                            {describeEvidence(item.description).summary}
                          </p>

                          <small>
                            {humanizeTruthClass(item.truthClass)}
                          </small>

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
            RXseven / Commodity Context
          </span>

          <span>
            COMMODITY FACTS | ADMITTED EVIDENCE | CAUSALITY UNKNOWN
          </span>
        </footer>
      </div>
    </main>
  );
}