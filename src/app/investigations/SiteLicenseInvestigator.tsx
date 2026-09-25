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

interface RXOperationalFact<T = unknown> {
  value?: T;
  semantic?: {
    state?: string;
    basis?: string;
  };
}

interface RXSiteLicenseAcceptedResult {
  status: "ACCEPTED";
  stage: "COMPLETE";
  path: "site-license";
  causalConclusion: "UNKNOWN";

  siteLicense: {
    miningSiteCount:
      RXOperationalFact<number | null>;

    miningLicenses:
      RXOperationalFact<unknown[]>;

    miningContracts:
      RXOperationalFact<unknown[]>;
  };

  evidence: {
    pack: {
      evidence?: RXEvidenceItem[];
    };
  };

  issues: [];
}

interface RXSiteLicenseRejectedResult {
  status: "REJECTED";
  stage?: string;
  path?: "site-license";
  causalConclusion?: "UNKNOWN";
  issues?: string[];
}

type RXSiteLicenseResult =
  | RXSiteLicenseAcceptedResult
  | RXSiteLicenseRejectedResult;

const INVESTIGATION_COMPANIES = {
  BUMI: {
    companyId: "rx-company-bumi",
    sectorsSlug: "pt-bumi-resources-tbk",
    ticker: "BUMI.JK",
    name: "PT Bumi Resources Tbk",
  },

  BYAN: {
    companyId: "rx-company-byan",
    sectorsSlug: "pt-bayan-resources-tbk",
    ticker: "BYAN.JK",
    name: "PT Bayan Resources Tbk",
  },

  GEMS: {
    companyId: "rx-company-gems",
    sectorsSlug: "pt-golden-energy-mines-tbk",
    ticker: "GEMS.JK",
    name: "PT Golden Energy Mines Tbk",
  },

  ITMG: {
    companyId: "rx-company-itmg",
    sectorsSlug: "pt-indo-tambangraya-megah-tbk",
    ticker: "ITMG.JK",
    name: "PT Indo Tambangraya Megah Tbk",
  },

  ADMR: {
    companyId: "rx-company-admr",
    sectorsSlug: "pt-adaro-minerals-indonesia-tbk",
    ticker: "ADMR.JK",
    name: "PT Adaro Minerals Indonesia Tbk",
  },
} as const;

type InvestigationSymbol =
  keyof typeof INVESTIGATION_COMPANIES;

interface SiteLicenseInvestigatorProps {
  initialSymbol: string;
}

function resolveSymbol(
  value: string,
): InvestigationSymbol {
  const normalized =
    value.toUpperCase();

  if (
    normalized in
    INVESTIGATION_COMPANIES
  ) {
    return normalized as InvestigationSymbol;
  }

  return "BUMI";
}

function readFactValue<T>(
  fact:
    RXOperationalFact<T> | undefined,
): T | null {
  if (!fact) {
    return null;
  }

  if (
    typeof fact.value ===
      "undefined"
  ) {
    return null;
  }

  return fact.value as T;
}

function humanizeFieldName(value: string): string {
  const labels: Record<string, string> = {
    license_type: "License type",
    license_number: "License number",
    license_no: "License number",
    location: "Location",
    city: "City",
    province: "Province",
    area: "Licensed area",
    area_ha: "Licensed area (ha)",
    licensed_area: "Licensed area",
    activity: "Activity",
    commodity: "Commodity",
    effective_date: "Effective date",
    effective: "Effective date",
    start_date: "Start date",
    expiry_date: "Expiry date",
    expiration_date: "Expiry date",
    expires: "Expiry date",
    end_date: "End date",
    contract_type: "Contract type",
    contract_number: "Contract number",
    contract_no: "Contract number",
    operator: "Operator",
    holder: "Holder",
    status: "Status",
    wiup_code: "WIUP code",
    cn: "CN",
    generation: "Generation",
    licensed_area_ha: "Licensed area (ha)",
    license_effective_date: "Effective date",
    license_expiry_date: "Expiry date",
    commodity_type: "Commodity",
    activities: "Activities",
    commodities: "Commodities",
  };

  const normalized = value.trim().toLowerCase();
  return labels[normalized] ?? normalized
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function describeEvidence(description: string | undefined) {
  if (!description) {
    return {
      title: "Operational evidence",
      summary: "A source-backed operational fact was admitted into this investigation.",
    };
  }

  const separator = description.indexOf(":");
  const key = separator >= 0
    ? description.slice(0, separator).trim().toLowerCase()
    : "";
  const value = separator >= 0
    ? description.slice(separator + 1).trim()
    : description.trim();

  if (key === "mining_site_count") {
    return {
      title: "Mining sites",
      summary: value === "0"
        ? "No mining sites were reported in this admitted evidence set."
        : `The source reported ${value} mining site${value === "1" ? "" : "s"} in this admitted evidence set.`,
    };
  }

  if (key === "mining_license" || key === "mining_licenses") {
    return {
      title: "Mining licenses",
      summary: "Source-backed mining license records were admitted. Readable license details are shown below.",
    };
  }

  if (key === "mining_contract" || key === "mining_contracts") {
    return {
      title: "Mining contracts",
      summary: "Source-backed mining contract records were admitted. Readable contract details are shown below.",
    };
  }

  let readableValue = value;

  if (
    value.startsWith("[") ||
    value.startsWith("{")
  ) {
    try {
      const parsed = JSON.parse(value) as unknown;
      readableValue = formatFieldValue(parsed);
    } catch {
      readableValue = "";
    }
  }

  return {
    title: key ? humanizeFieldName(key) : "Operational evidence",
    summary:
      readableValue ||
      "Source-backed operational detail is available in Raw Evidence.",
  };
}

function humanizeTruthClass(value: string | undefined): string {
  const normalized = (value ?? "ADMITTED").toUpperCase();
  if (normalized === "SOURCE_FACT") return "Source-backed fact";
  if (normalized === "ADMITTED") return "Admitted evidence";
  return "Evidence";
}

function formatFieldValue(value: unknown): string {
  if (value === null || typeof value === "undefined" || value === "") {
    return "Not reported";
  }
  if (Array.isArray(value)) {
    return value.length ? value.map(formatFieldValue).join(", ") : "Not reported";
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, nested]) => `${humanizeFieldName(key)}: ${formatFieldValue(nested)}`)
      .join(" | ");
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function renderStructuredRecords(
  records: unknown[],
  emptyMessage: string,
  recordLabel: string,
) {
  if (!Array.isArray(records) || records.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return records.map((record, index) => {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      return (
        <article key={index}>
          <strong>{recordLabel} {index + 1}</strong>
          <p>{formatFieldValue(record)}</p>
        </article>
      );
    }

    return (
      <article key={index}>
        <strong>{recordLabel} {index + 1}</strong>
        <dl>
          {Object.entries(record as Record<string, unknown>).map(([key, value]) => (
            <div key={key}>
              <dt>{humanizeFieldName(key)}</dt>
              <dd>{formatFieldValue(value)}</dd>
            </div>
          ))}
        </dl>
      </article>
    );
  });
}

function formatObject(
  value: unknown,
): string {
  if (
    typeof value === "string"
  ) {
    return value;
  }

  try {
    return JSON.stringify(
      value,
      null,
      2,
    );
  } catch {
    return String(value);
  }
}

export default function SiteLicenseInvestigator({
  initialSymbol,
}: SiteLicenseInvestigatorProps) {
  const [selectedSymbol, setSelectedSymbol] =
    useState<InvestigationSymbol>(
      resolveSymbol(
        initialSymbol,
      ),
    );

  const [result, setResult] =
    useState<RXSiteLicenseResult | null>(
      null,
    );

  const [isRunning, setIsRunning] =
    useState(false);

  const [runtimeError, setRuntimeError] =
    useState<string | null>(
      null,
    );

  const [showEvidence, setShowEvidence] =
    useState(false);

  const selectedCompany =
    INVESTIGATION_COMPANIES[
      selectedSymbol
    ];

  const accepted =
    result?.status === "ACCEPTED"
      ? result
      : null;

  const siteCount =
    readFactValue(
      accepted?.siteLicense
        .miningSiteCount,
    );

  const licenses =
    readFactValue(
      accepted?.siteLicense
        .miningLicenses,
    ) ?? [];

  const contracts =
    readFactValue(
      accepted?.siteLicense
        .miningContracts,
    ) ?? [];

  const evidenceItems =
    accepted?.evidence
      .pack
      .evidence ?? [];

  async function runInvestigation() {
    setIsRunning(true);
    setRuntimeError(null);
    setResult(null);
    setShowEvidence(false);

    try {
      const response =
        await fetch(
          "/api/investigate/site-license",
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
                  selectedCompany
                    .companyId,

                sectorsSlug:
                  selectedCompany
                    .sectorsSlug,
              }),
          },
        );

      const payload =
        await response.json() as
          RXSiteLicenseResult;

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
            "Site / License investigation rejected.",
        );
      }
    } catch {
      setRuntimeError(
        "Unable to complete the Site / License investigation.",
      );
    } finally {
      setIsRunning(false);
    }
  }

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
      <InvestigatorBack />

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
            ? "SITE / LICENSE INVESTIGATION ACTIVE"
            : accepted
              ? "OPERATIONAL EVIDENCE READY"
              : "SITE / LICENSE ENGINE READY"}
        </div>
      </header>

      <div className="rx-workspace">
        {!accepted &&
        !isRunning ? (
          <section
            className="rx-launch rx-investigator-launch rx-site-launch"
            style={{
              minHeight: "auto",
              paddingTop: 24,
              paddingBottom: 24,
              alignItems: "center",
            }}
          >
            <div className="rx-launch-copy rx-investigator-launch-copy">
              <div className="rx-kicker-row">
                <span className="rx-kicker">
                  SITE / LICENSE INTELLIGENCE
                </span>

                <span className="rx-engine-badge">
                  CONTEXT-AWARE PATH
                </span>
              </div>

              <h1
                style={{
                  margin: "8px 0 8px",
                  maxWidth: 680,
                  fontSize: "clamp(36px, 4vw, 56px)",
                  lineHeight: 0.94,
                  letterSpacing: "-0.045em",
                }}
              >
                Investigate operational
                footprint.
                <span>
                  {" "}
                  Sites, licenses & contracts.
                </span>
              </h1>

              <p
                style={{
                  margin: "0 0 8px",
                  maxWidth: 680,
                  lineHeight: 1.45,
                }}
              >
                Trace admitted operational
                evidence without inferring
                causality.
              </p>
              <div className="rx-company-selector-card">
                <span className="rx-company-selector-label">
                  LIVE INVESTIGATION COMPANY
                </span>

                <div
                  className="rx-company-selector-options"
                  aria-label="Live investigation company"
                >
                  {(Object.keys(
                    INVESTIGATION_COMPANIES,
                  ) as InvestigationSymbol[]).map(
                    (symbol) => (
                      <button
                        key={symbol}
                        type="button"
                        aria-pressed={
                          selectedSymbol === symbol
                        }
                        className={
                          selectedSymbol === symbol
                            ? "is-active"
                            : ""
                        }
                        onClick={() => {
                          setSelectedSymbol(symbol);
                          setResult(null);
                          setRuntimeError(null);
                          setShowEvidence(false);
                        }}
                      >
                        {symbol}
                      </button>
                    ),
                  )}
                </div>

                <div className="rx-company-selector-current">
                  <strong>{selectedSymbol}</strong>
                  <span>{selectedCompany.name}</span>
                </div>
              </div>

              <button
                type="button"
                className="rx-run-button rx-demo-case-card"
                onClick={
                  runInvestigation
                }
              >
                <span className="rx-demo-case-label">
                  <span className="rx-demo-case-dot" />
                  SITE / LICENSE CASE
                </span>

                <span className="rx-demo-case-main">
                  <span className="rx-demo-case-company">
                    <span className="rx-demo-case-symbol">
                      {
                        selectedCompany
                          .ticker
                      }
                    </span>

                    <span className="rx-demo-case-name">
                      {
                        selectedCompany
                          .name
                      }
                    </span>
                  </span>

                  <span className="rx-demo-case-meta">
                    OPERATIONAL CONTEXT
                  </span>
                </span>

                <span className="rx-demo-case-action">
                  <span>
                    INITIATE SITE / LICENSE INVESTIGATION
                  </span>

                  <span className="rx-demo-case-arrow">
                    {"->"}
                  </span>
                </span>
              </button>

              {runtimeError ? (
                <div className="rx-error">
                  {runtimeError}
                </div>
              ) : null}
            </div>

            <div
              className="rx-launch-visual"
              style={{
                minHeight: 360,
                transform: "scale(0.88)",
                transformOrigin: "center center",
              }}
            >
              <div className="rx-orbit rx-orbit-one" />
              <div className="rx-orbit rx-orbit-two" />

              <div className="rx-core-mark">
                <span>RX</span>
                <small>
                  OPERATIONS
                </small>
              </div>

              <div className="rx-launch-doctrine">
                <span>
                  CONTEXT SELECTS.
                </span>

                <strong>
                  RX PROVES.
                </strong>

                <small>
                  CAUSALITY REMAINS UNKNOWN
                </small>
              </div>
            </div>
          </section>
        ) : null}

        {isRunning ? (
          <section className="rx-running">
            <div className="rx-running-head">
              <span className="rx-kicker">
                LIVE SITE / LICENSE /
                {" "}
                {selectedSymbol}
              </span>

              <strong>
                RX INVESTIGATION ACTIVE
              </strong>

              <p>
                Collecting canonical
                operational context and
                passing it through the
                existing evidence
                admission boundary.
              </p>
            </div>

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
                  SITE / LICENSE
                </span>

                <h2>
                  GATHERING OPERATIONAL EVIDENCE
                </h2>

                <p>
                  Sites, licenses and
                  contracts are admitted
                  before they become RX
                  evidence.
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
                    SITE / LICENSE
                  </span>
                </div>

                <h1>
                  {selectedCompany.name}
                </h1>

                <p>
                  {selectedCompany.ticker}
                  {" | "}
                  OPERATIONAL CONTEXT
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
                    ADMITTED OPERATIONAL CONTEXT
                  </span>

                  <h2>
                    Site / License Footprint
                  </h2>
                </div>

                <strong>
                  EVIDENCE READY
                </strong>
              </div>

              <div className="rx-brief-facts">
                <div>
                  <span>
                    MINING SITES
                  </span>

                  <p>
                    {typeof siteCount ===
                    "number"
                      ? siteCount
                      : "Not established by admitted evidence"}
                  </p>
                </div>

                <div>
                  <span>
                    LICENSE RECORDS
                  </span>

                  <p>
                    {Array.isArray(
                      licenses,
                    )
                      ? licenses.length
                      : 0}
                  </p>
                </div>

                <div>
                  <span>
                    CONTRACT RECORDS
                  </span>

                  <p>
                    {Array.isArray(
                      contracts,
                    )
                      ? contracts.length
                      : 0}
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
                    Operational evidence,
                    not causal inference.
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
                RX established the
                currently admitted
                mining-site, license and
                contract context for
                {` ${selectedCompany.name}. `}
                This path does not claim
                that the operational
                footprint caused any
                production, sales,
                financial or market
                outcome.
              </p>
            </section>

            <section className="rx-evidence-summary">
              <div>
                <span>
                  EVIDENCE LAYER
                </span>

                <strong>
                  {evidenceItems.length}
                  {" "}
                  admitted facts
                </strong>

                <p>
                  Canonical operational
                  evidence remains
                  traceable below.
                </p>
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
                      Admitted evidence
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

                <div className="rx-human-evidence">
                  <section>
                    <h3>Mining licenses</h3>
                    <p>
                      Human-readable view of the admitted license records.
                    </p>
                    <div className="rx-human-records">
                      {renderStructuredRecords(
                        licenses,
                        "No mining license records were reported in this admitted evidence set.",
                        "License",
                      )}
                    </div>
                  </section>

                  <section>
                    <h3>Mining contracts</h3>
                    <p>
                      Human-readable view of the admitted contract records.
                    </p>
                    <div className="rx-human-records">
                      {renderStructuredRecords(
                        contracts,
                        "No mining contract records were reported in this admitted evidence set.",
                        "Contract",
                      )}
                    </div>
                  </section>
                </div>

                <div className="rx-drawer-heading" style={{ marginTop: 20 }}>
                  <div>
                    <span>TRACEABILITY</span>
                    <h2>Source facts</h2>
                  </div>
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
                            {describeEvidence(item.description).title}
                          </strong>

                          <p>
                            {describeEvidence(item.description).summary}
                          </p>

                          <small>
                            {humanizeTruthClass(item.truthClass)}
                          </small>
                        </div>

                        <small>
                          Source: {item.source ?? "SECTORS"}
                        </small>
                      </article>
                    ),
                  )}
                </div>

                <div
                  style={{
                    marginTop:
                      18,
                  }}
                >
                  <details>
                    <summary>
                      RAW EVIDENCE - LICENSE RECORDS
                    </summary>

                    <pre
                      style={{
                        whiteSpace:
                          "pre-wrap",
                        overflowWrap:
                          "anywhere",
                      }}
                    >
                      {formatObject(
                        licenses,
                      )}
                    </pre>
                  </details>

                  <details>
                    <summary>
                      RAW EVIDENCE - CONTRACT RECORDS
                    </summary>

                    <pre
                      style={{
                        whiteSpace:
                          "pre-wrap",
                        overflowWrap:
                          "anywhere",
                      }}
                    >
                      {formatObject(
                        contracts,
                      )}
                    </pre>
                  </details>
                </div>
              </section>
            ) : null}
          </>
        ) : null}

        {!isRunning &&
        runtimeError ? (
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