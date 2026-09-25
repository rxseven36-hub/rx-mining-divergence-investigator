"use client";

import {
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { InvestigatorBack } from "./InvestigatorBack";

const loadingStories = [
  ["01", "DETECTING PRODUCTION / SALES DIVERGENCE", "Comparing reported production and sales."],
  ["02", "GATHERING SECTORS EVIDENCE", "Collecting canonical operational and market facts."],
  ["03", "BUILDING EVIDENCE CHAIN", "Binding admitted evidence to the investigation."],
  ["04", "TESTING EXPLANATIONS", "AI proposes evidence-bounded possibilities."],
  ["05", "CHALLENGING CLAIMS", "RX tests the explanation against admitted evidence."],
  ["06", "SYNTHESIZING INTELLIGENCE", "Preparing the final defensible brief."],
] as const;

const resultPipeline = [
  "DETECT",
  "PRIORITIZE",
  "INVESTIGATE",
  "PROVE",
  "BRIEF",
] as const;

interface RXObservation {
  metric?: string;
  value?: number;
  unit?: unknown;
}

interface RXEvidenceItem {
  evidenceId?: string;
  source?: string;
  truthClass?: string;
  description?: string;
}

interface RXDegradedWorkspaceResult {
  status: "DEGRADED";
  stage: "SYNTHESIS";
  causalConclusion: "UNKNOWN";
  company: {
    id: string;
    sectorsSlug: string;
    ticker: string;
    commodity: string;
  };
  year: number;
  divergence: {
    production: RXObservation | null;
    sales: RXObservation | null;
  };
  investigationCase: {
    trigger: {
      priorityScore: number;
      divergenceRatio: number;
      rank: number;
      triggerType: "DETERMINISTIC_DIVERGENCE_PRIORITY";
    };
  } | null;
  evidence: {
    pack: {
      evidence?: RXEvidenceItem[];
    };
  };
  hypothesis: null;
  challenge: null;
  brief: null;
  degradation: {
    code: "AI_SYNTHESIS_PROVIDER_UNAVAILABLE";
  };
}

interface RXAcceptedWorkspaceResult {
  status: "ACCEPTED";
  stage: "COMPLETE";
  causalConclusion: "UNKNOWN";
  company: {
    id: string;
    sectorsSlug: string;
    ticker: string;
    commodity: string;
  };
  year: number;
  divergence: {
    production: RXObservation | null;
    sales: RXObservation | null;
  };
  investigationCase: {
    trigger: {
      priorityScore: number;
      divergenceRatio: number;
      rank: number;
      triggerType: "DETERMINISTIC_DIVERGENCE_PRIORITY";
    };
  } | null;
  evidence: {
    pack: {
      evidence?: RXEvidenceItem[];
    };
  };
  hypothesis: Record<string, unknown>;
  challenge: Record<string, unknown>;
  brief: Record<string, unknown>;
}

interface RXRejectedWorkspaceResult {
  status: "REJECTED";
  stage?: string;
  causalConclusion?: "UNKNOWN";
  issues?: string[];
}

type RXWorkspaceResult =
  | RXAcceptedWorkspaceResult
  | RXDegradedWorkspaceResult
  | RXRejectedWorkspaceResult;
function readText(
  value: unknown,
  keys: string[],
) {
  if (
    typeof value === "string" &&
    value.trim().length > 0
  ) {
    return value;
  }

  if (
    typeof value !== "object" ||
    value === null
  ) {
    return null;
  }

  const record = value as Record<string, unknown>;

  for (const key of keys) {
    const candidate = record[key];

    if (
      typeof candidate === "string" &&
      candidate.trim().length > 0
    ) {
      return candidate;
    }
  }

  return null;
}

function readTextList(
  value: unknown,
  keys: string[],
) {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return [];
  }

  const record = value as Record<string, unknown>;

  for (const key of keys) {
    const candidate = record[key];

    if (Array.isArray(candidate)) {
      const values = candidate.filter(
        (item): item is string =>
          typeof item === "string" &&
          item.trim().length > 0,
      );

      if (values.length > 0) {
        return values;
      }
    }
  }

  return [];
}

function readUnit(
  unit: unknown,
) {
  if (
    typeof unit === "string" &&
    unit.trim().length > 0
  ) {
    return unit;
  }

  if (
    typeof unit !== "object" ||
    unit === null
  ) {
    return "";
  }

  const record = unit as Record<string, unknown>;
  const preferredKeys = [
    "symbol",
    "label",
    "name",
    "unit",
    "value",
  ];

  for (const key of preferredKeys) {
    const candidate = record[key];

    if (
      typeof candidate === "string" &&
      candidate.trim().length > 0
    ) {
      return candidate;
    }
  }

  return "";
}

function formatObservation(
  observation: RXObservation | null,
) {
  if (
    !observation ||
    typeof observation.value !== "number"
  ) {
    return "—";
  }

  const unit = readUnit(observation.unit);

  return unit
    ? `${observation.value} ${unit}`
    : String(observation.value);
}

function evidenceGroup(
  description: string,
) {
  const normalized = description.toLowerCase();

  if (
    normalized.includes("price") ||
    normalized.includes("market")
  ) {
    return "Market / Commodity";
  }

  if (
    normalized.includes("production") ||
    normalized.includes("sales") ||
    normalized.includes("historical") ||
    normalized.includes("strip ratio") ||
    normalized.includes("overburden")
  ) {
    return "Performance";
  }

  return "Company / Operations";
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

const INVESTIGATION_COMPANIES = {
  BUMI: { companyId: "rx-company-bumi", sectorsSlug: "pt-bumi-resources-tbk", ticker: "BUMI.JK", name: "PT Bumi Resources Tbk", commodity: "COAL", year: 2024 },
  BYAN: { companyId: "rx-company-byan", sectorsSlug: "pt-bayan-resources-tbk", ticker: "BYAN.JK", name: "PT Bayan Resources Tbk", commodity: "COAL", year: 2024 },
  GEMS: { companyId: "rx-company-gems", sectorsSlug: "pt-golden-energy-mines-tbk", ticker: "GEMS.JK", name: "PT Golden Energy Mines Tbk", commodity: "COAL", year: 2024 },
  ITMG: { companyId: "rx-company-itmg", sectorsSlug: "pt-indo-tambangraya-megah-tbk", ticker: "ITMG.JK", name: "PT Indo Tambangraya Megah Tbk", commodity: "COAL", year: 2024 },
  ADMR: { companyId: "rx-company-admr", sectorsSlug: "pt-adaro-minerals-indonesia-tbk", ticker: "ADMR.JK", name: "PT Adaro Minerals Indonesia Tbk", commodity: "COAL", year: 2024 },
} as const;

type InvestigationSymbol = keyof typeof INVESTIGATION_COMPANIES;

export default function Home() {
  const searchParams = useSearchParams();

  const [selectedSymbol, setSelectedSymbol] =
    useState<InvestigationSymbol>(() => {
      const requestedSymbol =
        searchParams
          .get("symbol")
          ?.toUpperCase();

      return requestedSymbol &&
        requestedSymbol in INVESTIGATION_COMPANIES
        ? requestedSymbol as InvestigationSymbol
        : "BUMI";
    });

  const selectedCompany =
    INVESTIGATION_COMPANIES[selectedSymbol];
  const [result, setResult] =
    useState<RXWorkspaceResult | null>(null);
  const [isRunning, setIsRunning] =
    useState(false);
  const [runtimeError, setRuntimeError] =
    useState<string | null>(null);
  const [loadingStep, setLoadingStep] =
    useState(0);
  const [showEvidence, setShowEvidence] =
    useState(false);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval =
      window.setInterval(
        () => {
          setLoadingStep(
            (current) =>
              (current + 1) %
              loadingStories.length,
          );
        },
        3200,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [isRunning]);

const accepted =
  result?.status === "ACCEPTED" ||
  result?.status === "DEGRADED"
    ? result
    : null;

  const degraded =
    result?.status === "DEGRADED"
      ? result
      : null;

  const evidenceItems =
    accepted?.evidence.pack.evidence ?? [];

  const production =
    accepted?.divergence.production ?? null;
  const sales =
    accepted?.divergence.sales ?? null;

  const productionValue =
    production &&
    typeof production.value === "number"
      ? production.value
      : null;
  const salesValue =
    sales &&
    typeof sales.value === "number"
      ? sales.value
      : null;
  const divergenceValue =
    productionValue !== null &&
    salesValue !== null
      ? salesValue - productionValue
      : null;

  const investigationTrigger =
    accepted?.investigationCase?.trigger ?? null;

  const divergenceRatio =
    investigationTrigger?.divergenceRatio ?? null;

  const priorityScore =
    investigationTrigger?.priorityScore ?? null;

  const divergenceDirection =
    divergenceValue === null
      ? null
      : divergenceValue > 0
        ? "SALES ABOVE REPORTED PRODUCTION"
        : divergenceValue < 0
          ? "PRODUCTION ABOVE REPORTED SALES"
          : "NO OBSERVED PRODUCTION / SALES GAP";

  const productionUnit = readUnit(production?.unit);
  const salesUnit = readUnit(sales?.unit);
  const displayUnit = salesUnit || productionUnit;

  const chartMax = Math.max(
    productionValue ?? 0,
    salesValue ?? 0,
    1,
  );
  const productionWidth =
    productionValue === null
      ? 0
      : (productionValue / chartMax) * 100;
  const salesWidth =
    salesValue === null
      ? 0
      : (salesValue / chartMax) * 100;

  const hypothesisText = accepted
    ? readText(accepted.hypothesis, [
        "statement",
        "hypothesis",
        "summary",
      ])
    : null;
  const challengeText = accepted
    ? readText(accepted.challenge, [
        "critique",
        "challenge",
        "summary",
      ])
    : null;
  const briefText = accepted
    ? readText(accepted.brief, [
        "executiveSummary",
        "summary",
        "brief",
      ])
    : null;
  const alternatives = accepted
    ? readTextList(accepted.brief, [
        "alternativeExplanations",
        "alternatives",
      ])
    : [];
  const uncertainties = accepted
    ? readTextList(accepted.brief, [
        "uncertainties",
      ])
    : [];
  const unresolved = accepted
    ? readTextList(accepted.brief, [
        "unresolvedConcerns",
      ])
    : [];

  const evidenceSummary = evidenceItems.reduce(
    (summary, item) => {
      const group = evidenceGroup(
        item.description ?? "",
      );
      summary[group] =
        (summary[group] ?? 0) + 1;
      return summary;
    },
    {} as Record<string, number>,
  );

  async function runInvestigation() {
    setLoadingStep(0);
    setIsRunning(true);
    setRuntimeError(null);
    setResult(null);
    setShowEvidence(false);
    setLoadingStep(0);

    try {
      const response = await fetch(
        "/api/investigate/production-sales",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            companyId: selectedCompany.companyId,
            sectorsSlug: selectedCompany.sectorsSlug,
            ticker: selectedCompany.ticker,
            commodity: selectedCompany.commodity,
            year: selectedCompany.year,
          }),
        },
      );

      const payload =
        await response.json() as RXWorkspaceResult;

      setResult(payload);

      if (payload.status === "REJECTED") {
        setRuntimeError(
          payload.issues?.join(", ") ??
            "Investigation rejected.",
        );
      }
    } catch {
      setRuntimeError(
        "Unable to complete the live investigation.",
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
          {isRunning
            ? "INVESTIGATION ACTIVE"
            : degraded
              ? "EVIDENCE READY / AI DEGRADED"
              : accepted
                ? "INTELLIGENCE READY"
                : "ENGINE READY"}
        </div>
      </header>

      <div className="rx-workspace">
        {!accepted && !isRunning ? (
          <section className="rx-launch rx-investigator-launch rx-production-launch">
            <div className="rx-launch-copy rx-investigator-launch-copy">
              <div className="rx-kicker-row">
                <span className="rx-kicker">
                  SECTORS / MARKET INTELLIGENCE
                </span>

                <span className="rx-engine-badge">
                  LIVE INVESTIGATION ENGINE
                </span>
              </div>

              <h1>
                Find the signal.
                <span> Challenge the explanation.</span>
              </h1>

              <p>
                One live mining investigation. Sectors establishes
                the evidence. AI proposes. RX challenges what the
                evidence cannot prove.
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
                onClick={runInvestigation}
              >
                <span className="rx-demo-case-label">
                  <span className="rx-demo-case-dot" />
                  FEATURED DEMO CASE
                </span>

                <span className="rx-demo-case-main">
                  <span className="rx-demo-case-company">
                    <span className="rx-demo-case-symbol">{selectedCompany.ticker}</span>

                    <span className="rx-demo-case-name">{selectedCompany.name}</span>
                  </span>

                  <span className="rx-demo-case-meta">{selectedCompany.commodity} · FY{selectedCompany.year}</span>
                </span>

                <span className="rx-demo-case-action">
                  <span>INITIATE INVESTIGATION</span>
                  <span className="rx-demo-case-arrow">→</span>
                </span>
              </button>

              {runtimeError ? (
                <div className="rx-error">
                  {runtimeError}
                </div>
              ) : null}
            </div>

            <div className="rx-launch-visual">
              <div className="rx-orbit rx-orbit-one" />
              <div className="rx-orbit rx-orbit-two" />
              <div className="rx-core-mark">
                <span>RX</span>
                <small>INTELLIGENCE</small>
              </div>
              <div className="rx-launch-doctrine">
                <span>AI PROPOSES.</span>
                <strong>RX PROVES.</strong>
                <small>CAUSALITY REMAINS UNKNOWN</small>
              </div>
            </div>
          </section>
        ) : null}

        {isRunning ? (
          <section className="rx-running">
            <div className="rx-running-head">
              <span className="rx-kicker">
                LIVE INVESTIGATION / {selectedSymbol} FY{selectedCompany.year}
              </span>
              <strong>RX INVESTIGATION ACTIVE</strong>
              <p>
                The sequence below is a visual narrative while the
                live investigation completes.
              </p>
            </div>

            <div className="rx-investigation-visual">
              <div className="rx-scan-ring">
                <div className="rx-scan-core">RX</div>
                <span className="rx-scan-dot dot-a" />
                <span className="rx-scan-dot dot-b" />
                <span className="rx-scan-dot dot-c" />
              </div>

              <div className="rx-running-story">
                <span>
                  {loadingStories[loadingStep][0]} / 06
                </span>
                <h2>
                  {loadingStories[loadingStep][1]}
                </h2>
                <p>
                  {loadingStories[loadingStep][2]}
                </p>

                <div className="rx-story-rail">
                  {loadingStories.map((story, index) => (
                    <i
                      key={story[0]}
                      className={
                        index <= loadingStep
                          ? "active"
                          : ""
                      }
                    />
                  ))}
                </div>
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
                    {degraded ? "AI DEGRADED" : "COMPLETE"}
                  </span>
                </div>
                <h1>{selectedCompany.name}</h1>
                <p>
                  {selectedCompany.ticker} · {selectedCompany.commodity} · FY {accepted.year}
                </p>
              </div>

              <button
                type="button"
                className="rx-rerun-button"
                onClick={runInvestigation}
              >
                RUN AGAIN
              </button>
            </section>

            <section className="rx-signal-card">
              <div className="rx-signal-title">
                <div>
                  <span>OBSERVED DIVERGENCE</span>
                  <h2>Production / Sales Divergence</h2>
                </div>
                <strong>DETECTED</strong>
              </div>

              <div className="rx-divergence-chart">
                <div className="rx-chart-row">
                  <div className="rx-chart-label">
                    <span>PRODUCTION</span>
                    <strong>
                      {formatObservation(production)}
                    </strong>
                  </div>
                  <div className="rx-bar-track">
                    <div
                      className="rx-bar production"
                      style={{
                        width: `${productionWidth}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rx-chart-row">
                  <div className="rx-chart-label">
                    <span>SALES</span>
                    <strong>
                      {formatObservation(sales)}
                    </strong>
                  </div>
                  <div className="rx-bar-track">
                    <div
                      className="rx-bar sales"
                      style={{
                        width: `${salesWidth}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rx-delta">
                  <span>OBSERVED GAP</span>
                  <strong>
                    {divergenceValue !== null
                      ? `${divergenceValue > 0 ? "+" : ""}${divergenceValue.toFixed(2)}`
                      : "N/A"}
                    {displayUnit ? ` ${displayUnit}` : ""}
                  </strong>
                  <small>
                    {divergenceDirection ?? "DIRECTION UNAVAILABLE"}
                  </small>
                </div>

                <div className="rx-delta">
                  <span>RELATIVE GAP</span>
                  <strong>
                    {divergenceRatio !== null
                      ? `${(divergenceRatio * 100).toFixed(2)}%`
                      : "N/A"}
                  </strong>
                  <small>
                    PRODUCTION / SALES DIVERGENCE MAGNITUDE
                  </small>
                </div>

                <div className="rx-delta">
                  <span>PRIORITY SCORE</span>
                  <strong>
                    {priorityScore?.toFixed(2) ?? "N/A"}
                  </strong>
                  <small>
                    DETERMINISTIC INVESTIGATION PRIORITY
                  </small>
                </div>
              </div>
            </section>

            <section className="rx-rail">
              {resultPipeline.map((step) => {
                const briefUnavailable =
                  degraded && step === "BRIEF";

                return (
                  <div key={step}>
                    <span>
                      {briefUnavailable ? "!" : "\u2713"}
                    </span>
                    <strong>{step}</strong>
                  </div>
                );
              })}
            </section>

            <section className="rx-duel">
              <article className="rx-duel-card rx-proposes">
                <div className="rx-duel-label">
                  <span>AI</span>
                  <strong>AI PROPOSES</strong>
                </div>
                <p>
                  {degraded
                    ? "AI synthesis unavailable. No hypothesis was produced."
                    : hypothesisText ??
                      "No hypothesis produced."}
                </p>
              </article>

              <div className="rx-versus">VS</div>

              <article className="rx-duel-card rx-challenges">
                <div className="rx-duel-label">
                  <span>RX</span>
                  <strong>RX CHALLENGES</strong>
                </div>
                <p>
                  {degraded
                    ? "AI synthesis unavailable. No adversarial challenge was produced."
                    : challengeText ??
                      "No adversarial challenge produced."}
                </p>
              </article>
            </section>

            <section className="rx-final-brief">
              <div className="rx-final-heading">
                <div>
                  <span>FINAL INTELLIGENCE BRIEF</span>
                  <h2>Evidence before explanation.</h2>
                </div>
                <div className="rx-unknown">
                  <span>CAUSAL CONCLUSION</span>
                  <strong>UNKNOWN</strong>
                </div>
              </div>

              <p className="rx-brief-summary">
                {degraded
                  ? "AI synthesis is currently unavailable. Deterministic investigation results and admitted evidence remain available. No causal conclusion is asserted."
                  : briefText ??
                    "No intelligence brief produced."}
              </p>

              <div className="rx-brief-facts">
                <div>
                  <span>MAY EXPLAIN IT</span>
                  <p>
                    {alternatives[0] ??
                      "No supported alternative recorded."}
                  </p>
                </div>
                <div>
                  <span>UNCERTAINTY</span>
                  <p>
                    {uncertainties[0] ??
                      "Material uncertainty remains."}
                  </p>
                </div>
                <div>
                  <span>UNRESOLVED</span>
                  <p>
                    {unresolved[0] ??
                      "Causal mechanism remains unresolved."}
                  </p>
                </div>
              </div>
            </section>

            <section className="rx-evidence-summary">
              <div>
                <span>EVIDENCE LAYER</span>
                <strong>
                  {evidenceItems.length} admitted facts
                </strong>
                <p>
                  Canonical evidence stays available without
                  overwhelming the investigation story.
                </p>
              </div>

              <div className="rx-evidence-groups">
                {Object.entries(evidenceSummary).map(
                  ([group, count]) => (
                    <div key={group}>
                      <strong>{count}</strong>
                      <span>{group}</span>
                    </div>
                  ),
                )}
              </div>

              <button
                type="button"
                className="rx-evidence-toggle"
                onClick={() =>
                  setShowEvidence((current) => !current)
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
                    <span>TRACEABLE SOURCE FACTS</span>
                    <h2>Admitted evidence</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEvidence(false)}
                  >
                    CLOSE ×
                  </button>
                </div>

                <div className="rx-evidence-list">
                  {evidenceItems.map((item, index) => (
                    <article
                      key={item.evidenceId ?? index}
                    >
                      <span>
                        {String(index + 1).padStart(2, "0")}
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
                        {item.source ?? "SECTORS"}
                      </small>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : null}

        {!isRunning && runtimeError ? (
          <div className="rx-error rx-error-bottom">
            Investigation status: {runtimeError}
          </div>
        ) : null}

        <footer className="rx-footer">
          <span>
            RXseven / Mining Divergence Investigator
          </span>
          <span>
            AI PROPOSES · RX PROVES · CAUSALITY STAYS UNKNOWN
          </span>
        </footer>
      </div>
    </main>
  );
}



