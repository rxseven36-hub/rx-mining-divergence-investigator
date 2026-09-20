"use client";

import {
  useState,
} from "react";

import {
  InvestigatorBack,
} from "./InvestigatorBack";

interface RXEvidenceItem {
  evidenceId?: string;
  source?: string;
  truthClass?: string;
  description?: string;
}

interface RXObservation {
  metric?: string;
  value?: number | null;

  unit?: {
    symbol?: string;
    dimension?: string;
  };

  period?: {
    year?: number | null;
  };
}

interface RXObStripAcceptedResult {
  status: "ACCEPTED";
  stage: "COMPLETE";
  path: "ob-strip";
  causalConclusion: "UNKNOWN";
  year: number;

  obStrip: {
    status:
      | "ANALYZED"
      | "INSUFFICIENT_EVIDENCE";

    availability:
      | "BOTH_AVAILABLE"
      | "OVERBURDEN_ONLY"
      | "STRIP_RATIO_ONLY"
      | "NO_COMPARABLE_EVIDENCE";

    periodYear:
      number | null;

    overburden:
      RXObservation | null;

    stripRatio:
      RXObservation | null;

    observedRelationship:
      string;
  };

  evidence: {
    pack: {
      evidence?: RXEvidenceItem[];
    };

    admittedObservations?:
      RXObservation[];
  };

  issues: [];
}

interface RXObStripRejectedResult {
  status: "REJECTED";
  stage?: string;
  path?: "ob-strip";
  causalConclusion?: "UNKNOWN";
  issues?: string[];
}

type RXObStripResult =
  | RXObStripAcceptedResult
  | RXObStripRejectedResult;

const INVESTIGATION_COMPANIES = {
  BUMI: {
    companyId:
      "rx-company-bumi",

    sectorsSlug:
      "pt-bumi-resources-tbk",

    ticker:
      "BUMI.JK",

    name:
      "PT Bumi Resources Tbk",
  },

  BYAN: {
    companyId:
      "rx-company-byan",

    sectorsSlug:
      "pt-bayan-resources-tbk",

    ticker:
      "BYAN.JK",

    name:
      "PT Bayan Resources Tbk",
  },

  GEMS: {
    companyId:
      "rx-company-gems",

    sectorsSlug:
      "pt-golden-energy-mines-tbk",

    ticker:
      "GEMS.JK",

    name:
      "PT Golden Energy Mines Tbk",
  },

  ITMG: {
    companyId:
      "rx-company-itmg",

    sectorsSlug:
      "pt-indo-tambangraya-megah-tbk",

    ticker:
      "ITMG.JK",

    name:
      "PT Indo Tambangraya Megah Tbk",
  },

  ADMR: {
    companyId:
      "rx-company-admr",

    sectorsSlug:
      "pt-adaro-minerals-indonesia-tbk",

    ticker:
      "ADMR.JK",

    name:
      "PT Adaro Minerals Indonesia Tbk",
  },
} as const;

type InvestigationSymbol =
  keyof typeof INVESTIGATION_COMPANIES;

interface ObStripInvestigatorProps {
  initialSymbol: string;
}

function resolveSymbol(
  _value: string,
): InvestigationSymbol {
  return "BUMI";
}

function formatValue(
  value: number | null | undefined,
): string {
  if (
    typeof value !== "number"
  ) {
    return "Not established by admitted evidence";
  }

  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 2,
    },
  ).format(value);
}

export default function ObStripInvestigator({
  initialSymbol,
}: ObStripInvestigatorProps) {
  const selectedSymbol =
    resolveSymbol(
      initialSymbol,
    );

  const selectedCompany =
    INVESTIGATION_COMPANIES[
      selectedSymbol
    ];

  const [
    year,
    setYear,
  ] =
    useState(2024);

  function selectYear(
    nextYear: number,
  ) {
    setYear(nextYear);
    setResult(null);
    setRuntimeError(null);
    setShowEvidence(false);
  }

  const [
    result,
    setResult,
  ] =
    useState<RXObStripResult | null>(
      null,
    );

  const [
    isRunning,
    setIsRunning,
  ] =
    useState(false);

  const [
    runtimeError,
    setRuntimeError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    showEvidence,
    setShowEvidence,
  ] =
    useState(false);

  async function runInvestigation() {
    setIsRunning(true);
    setRuntimeError(null);
    setResult(null);
    setShowEvidence(false);

    try {
      const response =
        await fetch(
          "/api/investigate/ob-strip",
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
                  selectedCompany
                    .companyId,

                sectorsSlug:
                  selectedCompany
                    .sectorsSlug,

                year,
              }),
          },
        );

      const payload =
        await response.json() as
          RXObStripResult;

      setResult(
        payload,
      );

      if (
        !response.ok ||
        payload.status !==
          "ACCEPTED"
      ) {
        const issues =
          "issues" in payload &&
          Array.isArray(
            payload.issues,
          )
            ? payload.issues
            : [];

        setRuntimeError(
          issues.length > 0
            ? issues.join(", ")
            : `HTTP ${response.status}`,
        );
      }
    } catch {
      setRuntimeError(
        "OB_STRIP_INVESTIGATION_REQUEST_FAILED",
      );
    } finally {
      setIsRunning(false);
    }
  }

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

  const overburden =
    accepted?.obStrip
      .overburden ??
    null;

  const stripRatio =
    accepted?.obStrip
      .stripRatio ??
    null;

  return (
    <main className="rx-shell">
      <a
        className="rx-investigator-back"
        href={`/investigations?symbol=${selectedSymbol}`}
        aria-label="Back to investigation paths"
      >
        <span aria-hidden="true">&larr;</span>
        BACK
      </a>
      <div className="rx-workspace">
        <InvestigatorBack />

        {!accepted &&
        !isRunning ? (
          <section className="rx-launch rx-investigator-launch rx-ob-strip-launch">
            <div className="rx-launch-copy rx-investigator-launch-copy">
              <div className="rx-kicker-row">
                <span className="rx-kicker">
                  INVESTIGATION PATH
                </span>

                <span className="rx-demo-badge">
                  OB / STRIP RATIO
                </span>
              </div>

              <h1>
                {selectedCompany.name}
              </h1>

              <p>
                Investigate admitted
                overburden-removal and
                strip-ratio observations
                for FY{year}. RX describes
                the reported evidence
                without inventing an
                overburden unit or causal
                explanation.
              </p>

              <div
                aria-label="Investigation period"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 20,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    opacity: 0.7,
                  }}
                >
                  PERFORMANCE PERIOD
                </span>

                {[2024, 2023].map(
                  (candidateYear) => (
                    <button
                      key={candidateYear}
                      type="button"
                      aria-pressed={
                        year === candidateYear
                      }
                      onClick={() =>
                        selectYear(
                          candidateYear,
                        )
                      }
                      style={{
                        border:
                          year === candidateYear
                            ? "1px solid currentColor"
                            : "1px solid rgba(255,255,255,0.18)",
                        borderRadius: 999,
                        background:
                          year === candidateYear
                            ? "rgba(35,255,194,0.10)"
                            : "transparent",
                        padding: "7px 12px",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                      }}
                    >
                      FY{candidateYear}
                    </button>
                  ),
                )}
              </div>

              <button
                type="button"
                className="rx-run-button rx-demo-case-card"
                onClick={runInvestigation}
              >
                <span className="rx-demo-case-label" style={{ fontSize: 11 }}>
                  <span className="rx-demo-case-dot" />
                  OB / STRIP RATIO CASE
                </span>

                <span className="rx-demo-case-main">
                  <span className="rx-demo-case-company">
                    <span className="rx-demo-case-symbol" style={{ fontSize: 20 }}>
                      {selectedCompany.ticker}
                    </span>

                    <span className="rx-demo-case-name" style={{ fontSize: 12 }}>
                      {selectedCompany.name}
                    </span>
                  </span>

                  <span className="rx-demo-case-meta" style={{ fontSize: 11 }}>
                    FY{year} · DEDICATED EVIDENCE PATH
                  </span>
                </span>

                <span className="rx-demo-case-action" style={{ fontSize: 12 }}>
                  <span>
                    INITIATE INVESTIGATION
                  </span>

                  <span className="rx-demo-case-arrow">
                    →
                  </span>
                </span>
              </button>

              {runtimeError ? (
                <div className="rx-error rx-error-bottom">
                  Investigation status:
                  {" "}
                  {runtimeError}
                </div>
              ) : null}
            </div>

            <div className="rx-launch-visual">
              <div className="rx-core-mark">
                <span>RX</span>

                <small>
                  OB / STRIP
                </small>
              </div>

              <div className="rx-launch-doctrine">
                <span>
                  ADMIT EVIDENCE.
                </span>

                <strong>
                  DESCRIBE WHAT IS OBSERVED.
                </strong>

                <small>
                  CAUSALITY UNKNOWN
                </small>
              </div>
            </div>
          </section>
        ) : null}

        {isRunning ? (
          <section className="rx-running">
            <div className="rx-investigation-visual">
              <div className="rx-scan-ring">
                <div className="rx-scan-core">
                  RX
                </div>

                <span className="rx-scan-dot dot-a" />
                <span className="rx-scan-dot dot-b" />
                <span className="rx-scan-dot dot-c" />
              </div>

              <div className="rx-running-story">
                <span>
                  OB / STRIP RATIO
                </span>

                <h2>
                  GATHERING HISTORICAL PERFORMANCE EVIDENCE
                </h2>

                <p>
                  Overburden and strip
                  ratio must cross their
                  dedicated admission
                  boundary before
                  deterministic analysis.
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {accepted ? (
          <>
            <section className="rx-cockpit-head">
              <div>
                <div className="rx-kicker-row">
                  <span className="rx-kicker">
                    LIVE SECTORS INTELLIGENCE
                  </span>

                  <span className="rx-demo-badge">
                    OB / STRIP RATIO
                  </span>
                </div>

                <h1>
                  {selectedCompany.name}
                </h1>

                <p>
                  {selectedCompany.ticker}
                  {" | "}
                  FY
                  {accepted.obStrip
                    .periodYear ??
                    year}
                </p>
              </div>

              <button
                type="button"
                className="rx-rerun-button"
                onClick={
                  runInvestigation
                }
              >
                RUN AGAIN
              </button>
            </section>

            <section className="rx-signal-card">
              <div className="rx-signal-title">
                <div>
                  <span>
                    ADMITTED HISTORICAL PERFORMANCE
                  </span>

                  <h2>
                    OB / Strip Evidence
                  </h2>
                </div>

                <strong>
                  {accepted.obStrip
                    .availability}
                </strong>
              </div>

              <div className="rx-brief-facts">
                <div>
                  <span>
                    OVERBURDEN REMOVAL
                  </span>

                  <p>
                    {formatValue(
                      overburden?.value,
                    )}
                  </p>

                  <small>
                    Unit intentionally
                    not invented when
                    source semantics do
                    not establish one.
                  </small>
                </div>

                <div>
                  <span>
                    STRIP RATIO
                  </span>

                  <p>
                    {formatValue(
                      stripRatio?.value,
                    )}
                  </p>

                  <small>
                    Deterministic ratio
                    observation.
                  </small>
                </div>

                <div>
                  <span>
                    PERFORMANCE PERIOD
                  </span>

                  <p>
                    FY
                    {accepted.obStrip
                      .periodYear ??
                      year}
                  </p>
                </div>
              </div>
            </section>

            <section className="rx-final-brief">
              <div className="rx-final-heading">
                <div>
                  <span>
                    INVESTIGATION RESULT
                  </span>

                  <h2>
                    Observed operational
                    relationship, not a
                    causal explanation.
                  </h2>
                </div>

                <div className="rx-unknown">
                  <span>
                    CAUSAL CONCLUSION
                  </span>

                  <strong>
                    UNKNOWN
                  </strong>
                </div>
              </div>

              <p className="rx-brief-summary">
                {accepted.obStrip
                  .observedRelationship}
                {" "}
                RX does not infer why
                these observations have
                these values and does
                not use unadmitted
                resources, reserves,
                production or sales as
                evidence in this path.
              </p>
            </section>

            <section className="rx-evidence-summary">
              <div>
                <span>
                  TRACEABLE EVIDENCE
                </span>

                <h2>
                  {evidenceItems.length}
                  {" "}
                  admitted source facts
                </h2>
              </div>

              <button
                type="button"
                className="rx-evidence-toggle"
                onClick={() =>
                  setShowEvidence(
                    (current) =>
                      !current,
                  )
                }
              >
                {showEvidence
                  ? "HIDE EVIDENCE"
                  : `EXPLORE ${evidenceItems.length} EVIDENCE`}
              </button>
            </section>

            {showEvidence ? (
              <section className="rx-evidence-drawer">
                <div className="rx-drawer-heading">
                  <div>
                    <span>
                      TRACEABLE SOURCE FACTS
                    </span>

                    <h2>
                      Admitted OB / Strip
                      evidence
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowEvidence(
                        false,
                      )
                    }
                  >
                    CLOSE
                  </button>
                </div>

                <div className="rx-evidence-list">
                  {evidenceItems.map(
                    (
                      item,
                      index,
                    ) => (
                      <article
                        key={
                          item.evidenceId ??
                          index
                        }
                      >
                        <span>
                          {String(
                            index + 1,
                          ).padStart(
                            2,
                            "0",
                          )}
                        </span>

                        <div>
                          <strong>
                            {item.truthClass ??
                              "ADMITTED"}
                          </strong>

                          <p>
                            {item.description ??
                              "Canonical admitted evidence"}
                          </p>
                        </div>

                        <small>
                          {item.source ??
                            "SECTORS"}
                        </small>
                      </article>
                    ),
                  )}
                </div>
              </section>
            ) : null}
          </>
        ) : null}

        {!isRunning &&
        runtimeError &&
        accepted ? (
          <div className="rx-error rx-error-bottom">
            Investigation status:
            {" "}
            {runtimeError}
          </div>
        ) : null}

        <footer className="rx-footer">
          <span>
            RXseven / Mining Divergence Investigator
          </span>

          <span>
            CONTEXT SELECTS | RX PROVES | CAUSALITY STAYS UNKNOWN
          </span>
        </footer>
      </div>
    </main>
  );
}