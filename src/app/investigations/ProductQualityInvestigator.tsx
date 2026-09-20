"use client";

import {
  useState,
} from "react";

interface ProductQualityInvestigatorProps {
  initialSymbol: string;
}

interface CompanyConfig {
  name: string;
  sectorsSlug: string;
}

interface ProductQualityObservation {
  id: string;
  companyId: string;
  commodityType: string | null;
  commoditySubtype: string | null;
  productName: string;
  metric:
    | "CALORIFIC_VALUE"
    | "TOTAL_MOISTURE"
    | "ASH_ARB"
    | "TOTAL_SULPHUR_ARB"
    | "ASH_ADB"
    | "TOTAL_SULPHUR_ADB"
    | "VOLATILE_MATTER_ADB"
    | "FIXED_CARBON_ADB";
  min: number | null;
  max: number | null;
  unit: {
    symbol: "kcal/kg" | "%";
    dimension:
      | "ENERGY_PER_MASS"
      | "PERCENTAGE";
  };
  sourcePerformanceYear: number | null;
  sourceField: string;
}

interface ProductQualityProfile {
  productName: string;
  companyId: string;
  commodityType: string | null;
  commoditySubtype: string | null;
  sourcePerformanceYear: number | null;
  observations:
    ProductQualityObservation[];
}

interface ProductQualityApiResult {
  status: "ACCEPTED";
  stage: "COMPLETE";
  path: "product-quality";
  companyId: string;
  sectorsSlug: string;
  requestedPerformanceYear: number;

  productQuality: {
    status:
      | "ANALYZED"
      | "INSUFFICIENT_EVIDENCE";

    productCount: number;
    observationCount: number;
    sourcePerformanceYears: number[];
    products: ProductQualityProfile[];
    observedRelationship: string;
  };

  evidence: {
    pack: {
      evidence: Array<{
        evidenceId: string;
        source: string;
        sourceReference: string;
        truthClass: string;
        description: string;
      }>;
    };

    admittedObservations:
      ProductQualityObservation[];
  };

  causalConclusion: "UNKNOWN";
  issues: [];
}

const COMPANIES:
  Record<string, CompanyConfig> = {
    BUMI: {
      name:
        "PT Bumi Resources Tbk",
      sectorsSlug:
        "pt-bumi-resources-tbk",
    },

    ADMR: {
      name:
        "PT Adaro Minerals Indonesia Tbk",
      sectorsSlug:
        "pt-adaro-minerals-indonesia-tbk",
    },

    BYAN: {
      name:
        "PT Bayan Resources Tbk",
      sectorsSlug:
        "pt-bayan-resources-tbk",
    },

    ITMG: {
      name:
        "PT Indo Tambangraya Megah Tbk",
      sectorsSlug:
        "pt-indo-tambangraya-megah-tbk",
    },

    GEMS: {
      name:
        "PT Golden Energy Mines Tbk",
      sectorsSlug:
        "pt-golden-energy-mines-tbk",
    },
  };

const YEARS =
  [2024, 2023] as const;

const METRIC_LABELS:
  Record<
    ProductQualityObservation["metric"],
    string
  > = {
    CALORIFIC_VALUE:
      "CALORIFIC VALUE",

    TOTAL_MOISTURE:
      "TOTAL MOISTURE",

    ASH_ARB:
      "ASH / ARB",

    TOTAL_SULPHUR_ARB:
      "TOTAL SULPHUR / ARB",

    ASH_ADB:
      "ASH / ADB",

    TOTAL_SULPHUR_ADB:
      "TOTAL SULPHUR / ADB",

    VOLATILE_MATTER_ADB:
      "VOLATILE MATTER / ADB",

    FIXED_CARBON_ADB:
      "FIXED CARBON / ADB",
  };

function normalizeSymbol(
  value:
    string,
): string {
  const candidate =
    value.trim().toUpperCase();

  return COMPANIES[candidate]
    ? candidate
    : "BUMI";
}

function formatNumber(
  value:
    number,
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits:
        2,
    },
  ).format(value);
}

function formatRange(
  observation:
    ProductQualityObservation,
): string {
  const {
    min,
    max,
    unit,
  } = observation;

  const unitSymbol =
    unit.symbol;

  if (
    min === null &&
    max === null
  ) {
    return "NOT ADMITTED";
  }

  if (
    min !== null &&
    max !== null &&
    min === max
  ) {
    return `${formatNumber(min)} ${unitSymbol}`;
  }

  if (
    min !== null &&
    max !== null
  ) {
    return `${formatNumber(min)} - ${formatNumber(max)} ${unitSymbol}`;
  }

  if (min !== null) {
    return `MIN ${formatNumber(min)} ${unitSymbol}`;
  }

  return `MAX ${formatNumber(max as number)} ${unitSymbol}`;
}

function ProductCard({
  product,
}: {
  product:
    ProductQualityProfile;
}) {
  return (
    <article className="rx-geology-card">
      <div className="rx-geology-card-head">
        <span className="rx-product-quality-badge">
          PRODUCT
        </span>

        <div>
          <small>
            REPORTED QUALITY
          </small>

          <strong>
            {product.productName}
          </strong>
        </div>
      </div>

      <div
        style={{
          display:
            "grid",

          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",

          gap:
            10,

          marginTop:
            18,
        }}
      >
        {product.observations.map(
          (observation) => (
            <div
              key={
                observation.id
              }
              className="rx-geology-metric"
            >
              <span>
                {
                  METRIC_LABELS[
                    observation.metric
                  ]
                }
              </span>

              <strong>
                {formatRange(
                  observation,
                )}
              </strong>

              <small>
                SOURCE FACT
              </small>
            </div>
          ),
        )}
      </div>

      <div
        className="rx-geology-selection"
        style={{
          marginTop:
            14,
        }}
      >
        <strong>
          {product.commodityType ??
            "COMMODITY UNSPECIFIED"}
        </strong>

        <span>
          {product.commoditySubtype ??
            "Subtype not reported"}
          {" | "}
          {product.sourcePerformanceYear
            ? `FY${product.sourcePerformanceYear}`
            : "Source year unavailable"}
        </span>
      </div>
    </article>
  );
}

function HumanEvidenceCard({
  observation,
}: {
  observation:
    ProductQualityObservation;
}) {
  return (
    <article
      className="rx-geology-metric"
      style={{
        display:
          "grid",

        gap:
          10,
      }}
    >
      <div>
        <span>
          {METRIC_LABELS[
            observation.metric
          ]}
        </span>

        <strong
          style={{
            display:
              "block",

            marginTop:
              6,
          }}
        >
          {observation.productName}
        </strong>
      </div>

      <strong>
        {formatRange(
          observation,
        )}
      </strong>

      <div
        style={{
          display:
            "grid",

          gap:
            4,

          fontSize:
            12,
        }}
      >
        <span>
          Source: Sectors
        </span>

        <span>
          Evidence type: Source Fact
        </span>

        <span>
          Status: Admitted by RX
        </span>

        <span>
          Reporting period:{" "}
          {observation.sourcePerformanceYear
            ? `FY${observation.sourcePerformanceYear}`
            : "Unavailable"}
        </span>

        <span>
          {observation.commodityType ??
            "Commodity unspecified"}
          {observation.commoditySubtype
            ? ` / ${observation.commoditySubtype}`
            : ""}
        </span>
      </div>
    </article>
  );
}
export default function ProductQualityInvestigator({
  initialSymbol,
}: ProductQualityInvestigatorProps) {
  const [
    symbol,
    setSymbol,
  ] = useState(
    normalizeSymbol(
      initialSymbol,
    ),
  );

  const [
    year,
    setYear,
  ] = useState<number>(
    2024,
  );

  const [
    result,
    setResult,
  ] = useState<
    ProductQualityApiResult | null
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

  const [
    showRawEvidence,
    setShowRawEvidence,
  ] = useState(false);

  const company =
    COMPANIES[symbol];

  function clearResult() {
    setResult(null);
    setRuntimeError(null);
    setShowEvidence(false);
    setShowRawEvidence(false);
  }

  function selectSymbol(
    nextSymbol:
      string,
  ) {
    setSymbol(
      nextSymbol,
    );

    clearResult();
  }

  function selectYear(
    nextYear:
      number,
  ) {
    setYear(
      nextYear,
    );

    clearResult();
  }

  async function runInvestigation() {
    setRunning(true);
    setRuntimeError(null);
    setResult(null);
    setShowEvidence(false);
    setShowRawEvidence(false);

    try {
      const response =
        await fetch(
          "/api/investigate/product-quality",
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
                  symbol,

                sectorsSlug:
                  company.sectorsSlug,

                year,
              }),
          },
        );

      const payload =
        (await response.json()) as
          | ProductQualityApiResult
          | {
              issues?:
                string[];
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
            : "Product Quality investigation was rejected.";

        setRuntimeError(
          message,
        );

        return;
      }

      setResult(
        payload,
      );
    } catch (
      error:
        unknown
    ) {
      setRuntimeError(
        error instanceof Error
          ? error.message
          : "Product Quality investigation failed.",
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="rx-shell rx-geology-page">
      <a
        className="rx-investigator-back"
        href={
          `/investigations?symbol=${encodeURIComponent(
            symbol,
          )}`
        }
        aria-label="Back to investigation paths"
      >
        <span aria-hidden="true">
          &larr;
        </span>
        BACK
      </a>

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
          PRODUCT QUALITY PATH
        </div>
      </header>

      <div className="rx-workspace rx-geology-workspace">
        <section className="rx-geology-hero">
          <div className="rx-geology-hero-copy">
            <div className="rx-kicker-row">
              <span className="rx-kicker">
                PRODUCT QUALITY
              </span>

              <span className="rx-engine-badge">
                CAUSALITY UNKNOWN
              </span>
            </div>

            <h1>
              Inspect reported mining
              <span>
                {" "}product quality.
              </span>
            </h1>

            <p>
              RX preserves reported product
              identity, source min/max ranges,
              and ARB/ADB basis. Missing
              quality facts remain missing.
            </p>
          </div>

          <div className="rx-geology-doctrine">
            <div className="rx-geology-core">
              <strong>
                RX
              </strong>

              <span>
                QUALITY
              </span>
            </div>

            <div>
              <span>
                SOURCE FACTS ONLY
              </span>

              <strong>
                NO QUALITY SCORE
              </strong>

              <small>
                NO MIDPOINT DERIVATION
              </small>
            </div>
          </div>
        </section>

        <section className="rx-geology-control-grid">
          <article className="rx-geology-card rx-geology-company-card">
            <div className="rx-geology-card-head">
              <span>
                01
              </span>

              <div>
                <small>
                  COMPANY
                </small>

                <strong>
                  Select mining company
                </strong>
              </div>
            </div>

            <div className="rx-geology-options">
              {Object.keys(
                COMPANIES,
              ).map(
                (ticker) => (
                  <button
                    key={
                      ticker
                    }
                    type="button"
                    onClick={() =>
                      selectSymbol(
                        ticker,
                      )
                    }
                    className={
                      ticker === symbol
                        ? "is-active"
                        : ""
                    }
                  >
                    {ticker}
                  </button>
                ),
              )}
            </div>

            <div className="rx-geology-selection">
              <strong>
                {symbol}
              </strong>

              <span>
                {company.name}
              </span>
            </div>
          </article>

          <article className="rx-geology-card rx-geology-period-card">
            <div className="rx-geology-card-head">
              <span>
                02
              </span>

              <div>
                <small>
                  SOURCE PERIOD
                </small>

                <strong>
                  Performance record
                </strong>
              </div>
            </div>

            <div className="rx-geology-options">
              {YEARS.map(
                (
                  candidateYear,
                ) => (
                  <button
                    key={
                      candidateYear
                    }
                    type="button"
                    onClick={() =>
                      selectYear(
                        candidateYear,
                      )
                    }
                    className={
                      candidateYear === year
                        ? "is-active"
                        : ""
                    }
                  >
                    FY
                    {candidateYear}
                  </button>
                ),
              )}
            </div>

            <div className="rx-geology-selection">
              <strong>
                FY{year}
              </strong>

              <span>
                Historical-performance
                source record.
              </span>
            </div>
          </article>
        </section>

        <section className="rx-geology-card rx-geology-action-card">
          <div>
            <span className="rx-geology-step">
              03 / INVESTIGATION
            </span>

            <h2>
              {symbol}
              {" Product Quality"}
            </h2>

            <p>
              {company.name}
              {" | "}
              source record FY
              {year}
              {" | "}
              dedicated admitted
              product-quality evidence.
            </p>
          </div>

          <button
            type="button"
            onClick={
              runInvestigation
            }
            disabled={
              running
            }
            className="rx-geology-initiate"
          >
            {running
              ? "INVESTIGATING..."
              : "INITIATE PRODUCT QUALITY INVESTIGATION"}
          </button>
          {running ? (
            <div
              className="rx-investigation-processing"
              role="status"
              aria-live="polite"
              aria-label="Product quality investigation in progress"
            >
              <div className="rx-investigation-processing-copy">
                <span>
                  RX INVESTIGATION ENGINE
                </span>

                <strong>
                  Retrieving and admitting source evidence...
                </strong>
              </div>

              <div
                className="rx-investigation-processing-track"
                aria-hidden="true"
              >
                <span className="rx-investigation-processing-bar" />
              </div>
            </div>
          ) : null}
        </section>

        {runtimeError ? (
          <section className="rx-geology-card rx-geology-error">
            <span>
              INVESTIGATION REJECTED
            </span>

            <strong>
              {runtimeError}
            </strong>
          </section>
        ) : null}

        {result ? (
          <section className="rx-geology-result">
            <div className="rx-geology-result-head">
              <div>
                <span>
                  ADMITTED PRODUCT QUALITY EVIDENCE
                </span>

                <h2>
                  {symbol}
                  {" Product Quality"}
                </h2>
              </div>

              <strong>
                {
                  result.productQuality
                    .productCount
                }
                {" PRODUCTS"}
              </strong>
            </div>

            <div className="rx-geology-metrics">
              <article className="rx-geology-metric">
                <span>
                  PRODUCTS
                </span>

                <strong>
                  {
                    result.productQuality
                      .productCount
                  }
                </strong>

                <small>
                  Separate product profiles
                </small>
              </article>

              <article className="rx-geology-metric">
                <span>
                  QUALITY FACTS
                </span>

                <strong>
                  {
                    result.productQuality
                      .observationCount
                  }
                </strong>

                <small>
                  Admitted observations
                </small>
              </article>

              <article className="rx-geology-metric">
                <span>
                  SOURCE RECORD
                </span>

                <strong>
                  FY
                  {
                    result
                      .requestedPerformanceYear
                  }
                </strong>

                <small>
                  Retrieval context
                </small>
              </article>

              <article className="rx-geology-metric">
                <span>
                  CAUSALITY
                </span>

                <strong>
                  UNKNOWN
                </strong>

                <small>
                  No causal inference
                </small>
              </article>
            </div>

            <div
              style={{
                display:
                  "grid",

                gap:
                  14,

                marginTop:
                  14,
              }}
            >
              {result.productQuality
                .products.map(
                  (
                    product,
                    index,
                  ) => (
                    <ProductCard
                      key={
                        `${product.productName}-${index}`
                      }
                      product={
                        product
                      }
                    />
                  ),
                )}
            </div>

            <article className="rx-geology-card rx-geology-interpretation">
              <div className="rx-geology-interpretation-copy">
                <span>
                  04 / EVIDENCE INTERPRETATION
                </span>

                <h3>
                  What the admitted evidence says
                </h3>

                <p>
                  {
                    result.productQuality
                      .observedRelationship
                  }
                </p>

                <small>
                  RX preserves source ranges
                  exactly. ARB and ADB remain
                  separate. No midpoint,
                  average quality, ranking,
                  or overall quality score
                  is derived.
                </small>
              </div>

              <div className="rx-geology-evidence-action">
                <span>
                  CAUSALITY
                </span>

                <strong>
                  UNKNOWN
                </strong>

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
              </div>
            </article>

            {showEvidence ? (
              <section
                className="rx-geology-card"
                style={{
                  marginTop:
                    14,
                }}
              >
                <div
                  className="rx-geology-card-head"
                >
                  <span>
                    05
                  </span>

                  <div>
                    <small>
                      ADMITTED EVIDENCE
                    </small>

                    <strong>
                      Human-readable source facts
                    </strong>
                  </div>
                </div>

                <p
                  style={{
                    marginTop:
                      14,

                    marginBottom:
                      0,
                  }}
                >
                  These are the product-quality
                  facts admitted by RX from the
                  selected Sectors historical
                  performance record. Values are
                  shown exactly as reported; no
                  midpoint or quality score is
                  derived.
                </p>

                <div
                  style={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(240px, 1fr))",

                    gap:
                      10,

                    marginTop:
                      18,
                  }}
                >
                  {result.evidence
                    .admittedObservations
                    .map(
                      (
                        observation,
                      ) => (
                        <HumanEvidenceCard
                          key={
                            observation.id
                          }
                          observation={
                            observation
                          }
                        />
                      ),
                    )}
                </div>

                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "flex-end",

                    marginTop:
                      16,
                  }}
                >
                  <button
                    type="button"
                    className="rx-geology-initiate"
                    onClick={() =>
                      setShowRawEvidence(
                        (value) =>
                          !value,
                      )
                    }
                  >
                    {showRawEvidence
                      ? "HIDE RAW EVIDENCE"
                      : "VIEW RAW EVIDENCE"}
                  </button>
                </div>

                {showRawEvidence ? (
                  <pre
                    className="rx-geology-evidence"
                    style={{
                      marginTop:
                        14,
                    }}
                  >
                    {JSON.stringify(
                      result.evidence,
                      null,
                      2,
                    )}
                  </pre>
                ) : null}
              </section>
            ) : null}
          </section>
        ) : null}

        <footer className="rx-footer">
          <span>
            RXseven / Product Quality Investigator
          </span>

          <span>
            PRODUCT FACTS | SOURCE RANGES | CAUSALITY UNKNOWN
          </span>
        </footer>
      </div>
    </main>
  );
}