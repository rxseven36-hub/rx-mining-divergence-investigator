"use client";

import { useState } from "react";

interface SalesDestinationInvestigatorProps {
  initialSymbol: string;
}

interface CompanyConfig {
  name: string;
  sectorsSlug: string;
}

interface SalesDestinationObservation {
  id: string;
  companyId: string;
  year: number;
  destinationLabel: string;
  revenueUsd: number | null;
  percentageOfTotalRevenue: number | null;
  volume: number | null;
  percentageOfSalesVolume: number | null;
  commodityType: string | null;
  unit: string | null;
  sourceField: "data";
}

interface SalesDestinationApiResult {
  status: "ACCEPTED";
  stage: "COMPLETE";
  path: "sales-destination";
  companyId: string;
  sectorsSlug: string;
  requestedYear: number;

  salesDestination: {
    status: "ANALYZED" | "INSUFFICIENT_EVIDENCE";
    years: number[];
    destinationCount: number;
    observationCount: number;
    observationsWithRevenue: number;
    observationsWithRevenueShare: number;
    observationsWithVolume: number;
    observationsWithVolumeShare: number;
    destinations: unknown[];
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
    admittedObservations: SalesDestinationObservation[];
  };

  causalConclusion: "UNKNOWN";
  issues: [];
}

const COMPANIES: Record<string, CompanyConfig> = {
  BUMI: {
    name: "PT Bumi Resources Tbk",
    sectorsSlug: "pt-bumi-resources-tbk",
  },
  ADMR: {
    name: "PT Adaro Minerals Indonesia Tbk",
    sectorsSlug: "pt-adaro-minerals-indonesia-tbk",
  },
  BYAN: {
    name: "PT Bayan Resources Tbk",
    sectorsSlug: "pt-bayan-resources-tbk",
  },
  ITMG: {
    name: "PT Indo Tambangraya Megah Tbk",
    sectorsSlug: "pt-indo-tambangraya-megah-tbk",
  },
  GEMS: {
    name: "PT Golden Energy Mines Tbk",
    sectorsSlug: "pt-golden-energy-mines-tbk",
  },
};

const YEARS = [2024] as const;

function normalizeSymbol(value: string): string {
  const candidate = value.trim().toUpperCase();
  return COMPANIES[candidate] ? candidate : "BUMI";
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNullableNumber(
  value: number | null,
  suffix = "",
): string {
  return value === null
    ? "NOT REPORTED"
    : `${formatNumber(value)}${suffix}`;
}

function DestinationCard({
  observation,
}: {
  observation: SalesDestinationObservation;
}) {
  return (
    <article className="rx-geology-card">
      <div className="rx-geology-card-head">
        <span>DEST</span>
        <div>
          <small>PROVIDER LABEL</small>
          <strong>{observation.destinationLabel}</strong>
        </div>
      </div>

      <div className="rx-geology-metrics">
        <article className="rx-geology-metric">
          <span>REVENUE</span>
          <strong>
            {observation.revenueUsd === null
              ? "NOT REPORTED"
              : `USD ${formatNumber(observation.revenueUsd)}`}
          </strong>
          <small>SOURCE FACT</small>
        </article>

        <article className="rx-geology-metric">
          <span>REVENUE SHARE</span>
          <strong>
            {formatNullableNumber(
              observation.percentageOfTotalRevenue,
              "%",
            )}
          </strong>
          <small>NO DERIVATION</small>
        </article>

        <article className="rx-geology-metric">
          <span>VOLUME</span>
          <strong>
            {observation.volume === null
              ? "NOT REPORTED"
              : `${formatNumber(observation.volume)} ${
                  observation.unit ?? "UNIT NOT REPORTED"
                }`}
          </strong>
          <small>SOURCE FACT</small>
        </article>

        <article className="rx-geology-metric">
          <span>SALES VOLUME SHARE</span>
          <strong>
            {formatNullableNumber(
              observation.percentageOfSalesVolume,
              "%",
            )}
          </strong>
          <small>NO DERIVATION</small>
        </article>
      </div>

      <div className="rx-geology-selection">
        <strong>
          {observation.commodityType ?? "COMMODITY NOT REPORTED"}
        </strong>
        <span>
          FY{observation.year}
          {" | "}
          Provider geography preserved verbatim
        </span>
      </div>
    </article>
  );
}

function HumanEvidenceCard({
  observation,
}: {
  observation: SalesDestinationObservation;
}) {
  return (
    <article
      className="rx-geology-metric"
      style={{ display: "grid", gap: 10 }}
    >
      <div>
        <span>PROVIDER DESTINATION</span>
        <strong style={{ display: "block", marginTop: 6 }}>
          {observation.destinationLabel}
        </strong>
      </div>

      <div style={{ display: "grid", gap: 4, fontSize: 12 }}>
        <span>Source: Sectors</span>
        <span>Evidence type: Source Fact</span>
        <span>Status: Admitted by RX</span>
        <span>Reporting period: FY{observation.year}</span>
        <span>
          Revenue:{" "}
          {observation.revenueUsd === null
            ? "Not reported"
            : `USD ${formatNumber(observation.revenueUsd)}`}
        </span>
        <span>
          Revenue share:{" "}
          {formatNullableNumber(
            observation.percentageOfTotalRevenue,
            "%",
          )}
        </span>
        <span>
          Volume:{" "}
          {observation.volume === null
            ? "Not reported"
            : `${formatNumber(observation.volume)} ${
                observation.unit ?? "unit not reported"
              }`}
        </span>
        <span>
          Sales volume share:{" "}
          {formatNullableNumber(
            observation.percentageOfSalesVolume,
            "%",
          )}
        </span>
        <span>
          Commodity: {observation.commodityType ?? "Not reported"}
        </span>
      </div>
    </article>
  );
}

export default function SalesDestinationInvestigator({
  initialSymbol,
}: SalesDestinationInvestigatorProps) {
  const [symbol, setSymbol] = useState(
    normalizeSymbol(initialSymbol),
  );
  const [year, setYear] = useState<number>(2024);
  const [result, setResult] =
    useState<SalesDestinationApiResult | null>(null);
  const [runtimeError, setRuntimeError] =
    useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [showRawEvidence, setShowRawEvidence] = useState(false);

  const company = COMPANIES[symbol];

  function clearResult() {
    setResult(null);
    setRuntimeError(null);
    setShowEvidence(false);
    setShowRawEvidence(false);
  }

  function selectSymbol(nextSymbol: string) {
    setSymbol(nextSymbol);
    clearResult();
  }

  function selectYear(nextYear: number) {
    setYear(nextYear);
    clearResult();
  }

  async function runInvestigation() {
    setRunning(true);
    setRuntimeError(null);
    setResult(null);
    setShowEvidence(false);
    setShowRawEvidence(false);

    try {
      const response = await fetch(
        "/api/investigate/sales-destination",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyId: symbol,
            sectorsSlug: company.sectorsSlug,
            year,
          }),
        },
      );

      const payload = (await response.json()) as
        | SalesDestinationApiResult
        | { issues?: string[] };

      if (
        !response.ok ||
        !("status" in payload) ||
        payload.status !== "ACCEPTED"
      ) {
        const message =
          "issues" in payload &&
          Array.isArray(payload.issues)
            ? payload.issues.join(", ")
            : "Sales Destination investigation was rejected.";

        setRuntimeError(message);
        return;
      }

      setResult(payload);
    } catch (error: unknown) {
      setRuntimeError(
        error instanceof Error
          ? error.message
          : "Sales Destination investigation failed.",
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="rx-shell rx-geology-page">
      <a
        className="rx-investigator-back"
        href={`/investigations?symbol=${encodeURIComponent(symbol)}`}
        aria-label="Back to investigation paths"
      >
        <span aria-hidden="true">&larr;</span>
        BACK
      </a>

      <header className="rx-topbar">
        <div className="rx-brand">
          <span className="rx-brand-mark">RX</span>
          <div>
            <p className="rx-eyebrow">RXseven Intelligence</p>
            <p className="rx-brand-name">
              Mining Divergence Investigator
            </p>
          </div>
        </div>

        <div className="rx-topbar-status">
          <span className="rx-live-dot" />
          SALES DESTINATION PATH
        </div>
      </header>

      <div className="rx-workspace rx-geology-workspace">
        <section className="rx-geology-hero">
          <div className="rx-geology-hero-copy">
            <div className="rx-kicker-row">
              <span className="rx-kicker">SALES DESTINATION</span>
              <span className="rx-engine-badge">
                CAUSALITY UNKNOWN
              </span>
            </div>

            <h1>
              Inspect reported mining
              <span>{" "}sales destinations.</span>
            </h1>

            <p>
              RX preserves provider geography labels and reported
              values exactly. Missing revenue, volume, and percentages
              remain missing.
            </p>
          </div>

          <div className="rx-geology-doctrine">
            <div className="rx-geology-core">
              <strong>RX</strong>
              <span>DEST</span>
            </div>

            <div>
              <span>SOURCE FACTS ONLY</span>
              <strong>NO CONCENTRATION SCORE</strong>
              <small>NO GEOGRAPHY RECLASSIFICATION</small>
            </div>
          </div>
        </section>

        <section className="rx-geology-control-grid">
          <article className="rx-geology-card rx-geology-company-card">
            <div className="rx-geology-card-head">
              <span>01</span>
              <div>
                <small>COMPANY</small>
                <strong>Select mining company</strong>
              </div>
            </div>

            <div className="rx-geology-options">
              {Object.keys(COMPANIES).map((ticker) => (
                <button
                  key={ticker}
                  type="button"
                  onClick={() => selectSymbol(ticker)}
                  className={ticker === symbol ? "is-active" : ""}
                >
                  {ticker}
                </button>
              ))}
            </div>

            <div className="rx-geology-selection">
              <strong>{symbol}</strong>
              <span>{company.name}</span>
            </div>
          </article>

          <article className="rx-geology-card rx-geology-period-card">
            <div className="rx-geology-card-head">
              <span>02</span>
              <div>
                <small>SOURCE PERIOD</small>
                <strong>Sales-destination record</strong>
              </div>
            </div>

            <div className="rx-geology-options">
              {YEARS.map((candidateYear) => (
                <button
                  key={candidateYear}
                  type="button"
                  onClick={() => selectYear(candidateYear)}
                  className={
                    candidateYear === year ? "is-active" : ""
                  }
                >
                  FY{candidateYear}
                </button>
              ))}
            </div>

            <div className="rx-geology-selection">
              <strong>FY{year}</strong>
              <span>Provider sales-destination record.</span>
            </div>
          </article>
        </section>

        <section className="rx-geology-card rx-geology-action-card">
          <div>
            <span className="rx-geology-step">
              03 / INVESTIGATION
            </span>
            <h2>{symbol} Sales Destination</h2>
            <p>
              {company.name}
              {" | "}
              FY{year}
              {" | "}
              dedicated admitted sales-destination evidence.
            </p>
          </div>

          <button
            type="button"
            onClick={runInvestigation}
            disabled={running}
            className="rx-geology-initiate"
          >
            {running
              ? "INVESTIGATING..."
              : "INITIATE SALES DESTINATION INVESTIGATION"}
          </button>

          {running ? (
            <div
              className="rx-investigation-processing"
              role="status"
              aria-live="polite"
              aria-label="Sales destination investigation in progress"
            >
              <div className="rx-investigation-processing-copy">
                <span>RX INVESTIGATION ENGINE</span>
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
            <span>INVESTIGATION REJECTED</span>
            <strong>{runtimeError}</strong>
          </section>
        ) : null}

        {result ? (
          <section className="rx-geology-result">
            <div className="rx-geology-result-head">
              <div>
                <span>ADMITTED SALES DESTINATION EVIDENCE</span>
                <h2>{symbol} Sales Destination</h2>
              </div>

              <strong>
                {result.salesDestination.destinationCount}
                {" DESTINATIONS"}
              </strong>
            </div>

            <div className="rx-geology-metrics">
              <article className="rx-geology-metric">
                <span>DESTINATIONS</span>
                <strong>
                  {result.salesDestination.destinationCount}
                </strong>
                <small>Provider-defined labels</small>
              </article>

              <article className="rx-geology-metric">
                <span>OBSERVATIONS</span>
                <strong>
                  {result.salesDestination.observationCount}
                </strong>
                <small>Admitted source facts</small>
              </article>

              <article className="rx-geology-metric">
                <span>SOURCE RECORD</span>
                <strong>FY{result.requestedYear}</strong>
                <small>Retrieval context</small>
              </article>

              <article className="rx-geology-metric">
                <span>CAUSALITY</span>
                <strong>UNKNOWN</strong>
                <small>No causal inference</small>
              </article>
            </div>

            <div
              style={{
                display: "grid",
                gap: 14,
                marginTop: 14,
              }}
            >
              {result.evidence.admittedObservations.map(
                (observation) => (
                  <DestinationCard
                    key={observation.id}
                    observation={observation}
                  />
                ),
              )}
            </div>

            <article className="rx-geology-card rx-geology-interpretation">
              <div className="rx-geology-interpretation-copy">
                <span>04 / EVIDENCE INTERPRETATION</span>
                <h3>What the admitted evidence says</h3>
                <p>
                  {result.salesDestination.observedRelationship}
                </p>
                <small>
                  Destination labels remain provider-defined. Missing
                  facts remain missing. RX does not manufacture
                  domestic/export classes, percentages, concentration
                  scores, rankings, or causality.
                </small>
              </div>

              <div className="rx-geology-evidence-action">
                <span>CAUSALITY</span>
                <strong>UNKNOWN</strong>
                <button
                  type="button"
                  onClick={() =>
                    setShowEvidence((value) => !value)
                  }
                >
                  {showEvidence ? "HIDE EVIDENCE" : "SHOW EVIDENCE"}
                </button>
              </div>
            </article>

            {showEvidence ? (
              <section
                className="rx-geology-card"
                style={{ marginTop: 14 }}
              >
                <div className="rx-geology-card-head">
                  <span>05</span>
                  <div>
                    <small>ADMITTED EVIDENCE</small>
                    <strong>Human-readable source facts</strong>
                  </div>
                </div>

                <p style={{ marginTop: 14, marginBottom: 0 }}>
                  These are the sales-destination facts admitted by RX
                  from the selected Sectors record. Provider labels and
                  reported values are preserved; missing values are not
                  derived.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 10,
                    marginTop: 18,
                  }}
                >
                  {result.evidence.admittedObservations.map(
                    (observation) => (
                      <HumanEvidenceCard
                        key={observation.id}
                        observation={observation}
                      />
                    ),
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 16,
                  }}
                >
                  <button
                    type="button"
                    className="rx-geology-initiate"
                    onClick={() =>
                      setShowRawEvidence((value) => !value)
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
                    style={{ marginTop: 14 }}
                  >
                    {JSON.stringify(result.evidence, null, 2)}
                  </pre>
                ) : null}
              </section>
            ) : null}
          </section>
        ) : null}

        <footer className="rx-footer">
          <span>RXseven / Sales Destination Investigator</span>
          <span>
            PROVIDER FACTS | MISSING STAYS MISSING | CAUSALITY UNKNOWN
          </span>
        </footer>
      </div>
    </main>
  );
}
