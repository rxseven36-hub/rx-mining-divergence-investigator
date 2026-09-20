"use client";

import { useState } from "react";

interface ResourcesReservesInvestigatorProps {
  initialSymbol: string;
}

interface CompanyConfig {
  name: string;
  sectorsSlug: string;
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

const YEARS = [2024, 2023] as const;

function normalizedSymbol(value: string): string {
  const candidate = value.trim().toUpperCase();
  return COMPANIES[candidate] ? candidate : "BUMI";
}

function displayValue(observation: any): string {
  if (!observation || typeof observation.value !== "number") {
    return "Not admitted";
  }

  return `${observation.value} Mt`;
}

export default function ResourcesReservesInvestigator({
  initialSymbol,
}: ResourcesReservesInvestigatorProps) {
  const [symbol, setSymbol] = useState(
    normalizedSymbol(initialSymbol),
  );
  const [year, setYear] = useState<number>(2024);
  const [result, setResult] = useState<any>(null);
  const [runtimeError, setRuntimeError] =
    useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [showEvidence, setShowEvidence] =
    useState(false);

  const company = COMPANIES[symbol];
  const geology = result?.resourcesReserves;

  function clearResult() {
    setResult(null);
    setRuntimeError(null);
    setShowEvidence(false);
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

    try {
      const response = await fetch(
        "/api/investigate/resources-reserves",
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

      const payload = await response.json();
      setResult(payload);

      if (!response.ok) {
        setRuntimeError(
          Array.isArray(payload?.issues)
            ? payload.issues.join(", ")
            : "Investigation rejected.",
        );
      }
    } catch {
      setRuntimeError(
        "Unable to execute Resources / Reserves investigation.",
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="rx-shell rx-geology-page">
      <a
        className="rx-investigator-back"
        href={`/investigations?symbol=${symbol}`}
        aria-label="Back to investigation paths"
      >
        <span aria-hidden="true">&larr;</span>
        BACK
      </a>
      <header className="rx-topbar">
        <div className="rx-brand">
          <span className="rx-brand-mark">RX</span>

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
          GEOLOGICAL EVIDENCE PATH
        </div>
      </header>

      <div className="rx-workspace rx-geology-workspace">
        <section className="rx-geology-hero">
          <div className="rx-geology-hero-copy">
            <div className="rx-kicker-row">
              <span className="rx-kicker">
                RESOURCES / RESERVES
              </span>
              <span className="rx-engine-badge">
                CAUSALITY UNKNOWN
              </span>
            </div>

            <h1>
              Inspect reported geological
              <span> resources and reserves.</span>
            </h1>

            <p>
              Preserve geological measurement time.
              Keep source performance context separate.
              Never estimate missing geology.
            </p>
          </div>

          <div className="rx-geology-doctrine">
            <div className="rx-geology-core">
              <strong>RX</strong>
              <span>GEOLOGY</span>
            </div>

            <div>
              <span>SOURCE FACTS ONLY</span>
              <strong>NO DERIVED GEOLOGY</strong>
              <small>TEMPORAL SEMANTICS PRESERVED</small>
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
                  className={
                    ticker === symbol ? "is-active" : ""
                  }
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
                <strong>Performance record</strong>
              </div>
            </div>

            <div className="rx-geology-options">
              {YEARS.map((candidateYear) => (
                <button
                  key={candidateYear}
                  type="button"
                  onClick={() => selectYear(candidateYear)}
                  className={
                    candidateYear === year
                      ? "is-active"
                      : ""
                  }
                >
                  FY{candidateYear}
                </button>
              ))}
            </div>

            <div className="rx-geology-selection">
              <strong>FY{year}</strong>
              <span>
                Retrieval context only. Geological
                measurement year remains independent.
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
              {symbol} Resources / Reserves
            </h2>
            <p>
              {company.name} · source record FY{year} ·
              geological evidence admitted separately.
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
              : "INITIATE GEOLOGICAL INVESTIGATION"}
          </button>
        </section>

        {runtimeError && (
          <section className="rx-geology-card rx-geology-error">
            <span>INVESTIGATION REJECTED</span>
            <strong>{runtimeError}</strong>
          </section>
        )}

        {result?.status === "ACCEPTED" && geology && (
          <section className="rx-geology-result">
            <div className="rx-geology-result-head">
              <div>
                <span>ADMITTED GEOLOGICAL EVIDENCE</span>
                <h2>
                  {symbol} Resources / Reserves
                </h2>
              </div>

              <strong>{geology.availability}</strong>
            </div>

            <div className="rx-geology-metrics">
              <article className="rx-geology-metric">
                <span>TOTAL RESOURCES</span>
                <strong>
                  {displayValue(geology.totalResource)}
                </strong>
                <small>Admitted source fact</small>
              </article>

              <article className="rx-geology-metric">
                <span>TOTAL RESERVES</span>
                <strong>
                  {displayValue(geology.totalReserve)}
                </strong>
                <small>Admitted source fact</small>
              </article>

              <article className="rx-geology-metric">
                <span>GEO MEASUREMENT</span>
                <strong>
                  {geology.measurementYear ??
                    "Unavailable"}
                </strong>
                <small>Geological measurement year</small>
              </article>

              <article className="rx-geology-metric">
                <span>SOURCE RECORD</span>
                <strong>
                  {geology.sourcePerformanceYear
                    ? `FY${geology.sourcePerformanceYear}`
                    : `FY${year}`}
                </strong>
                <small>Retrieval performance context</small>
              </article>
            </div>

            <article className="rx-geology-card rx-geology-interpretation">
              <div className="rx-geology-interpretation-copy">
                <span>04 / EVIDENCE INTERPRETATION</span>
                <h3>What the admitted evidence says</h3>

                <p>{geology.observedRelationship}</p>

                <small>
                  Geological measurement year and source
                  performance year remain intentionally
                  separate. RX does not infer causality,
                  estimate missing geology, or derive
                  unreported totals.
                </small>
              </div>

              <div className="rx-geology-evidence-action">
                <span>CAUSALITY</span>
                <strong>UNKNOWN</strong>

                <button
                  type="button"
                  onClick={() =>
                    setShowEvidence(!showEvidence)
                  }
                >
                  {showEvidence
                    ? "HIDE EVIDENCE"
                    : "SHOW EVIDENCE"}
                </button>
              </div>
            </article>

            {showEvidence && (
              <pre className="rx-geology-evidence">
                {JSON.stringify(
                  result.evidence,
                  null,
                  2,
                )}
              </pre>
            )}
          </section>
        )}

        <footer className="rx-footer">
          <span>
            RXseven / Mining Divergence Investigator
          </span>
          <span>
            GEOLOGICAL FACTS | TEMPORAL CONTEXT |
            CAUSALITY UNKNOWN
          </span>
        </footer>
      </div>
    </main>
  );
}