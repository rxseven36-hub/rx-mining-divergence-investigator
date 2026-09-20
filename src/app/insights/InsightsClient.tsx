"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./insights.module.css";

type InsightType = "all" | "operations" | "financials" | "resources" | "markets" | "divergence";

type Insight = {
  id: string;
  type: Exclude<InsightType, "all">;
  label: string;
  title: string;
  summary: string;
  takeaway: string;
  metric: string;
  companies: string[];
  action?: "investigate" | "compare";
};

const insights: Insight[] = [
  {
    id: "production-leaders",
    type: "operations",
    label: "OPERATIONS RANKING",
    title: "Large-volume producers dominate the FY2024 operating picture",
    summary:
      "BUMI, BYAN, and GEMS sit inside the high-production group in the collected FY2024 performance dataset.",
    takeaway:
      "This is a useful first split when comparing scale before cost structure, stripping intensity, or reserve depth.",
    metric: "> 50 Mt",
    companies: ["BUMI", "BYAN", "GEMS"],
    action: "compare",
  },
  {
    id: "sales-above-production",
    type: "divergence",
    label: "DIVERGENCE SIGNAL",
    title: "BUMI reported sales above production in FY2024",
    summary:
      "Reported production was 74.7 Mt while reported sales were 75.8 Mt, creating a deterministic 1.1 Mt gap.",
    takeaway:
      "The arithmetic is clear. The cause is not. This is exactly the kind of signal that should move from insight to investigation.",
    metric: "+1.1 Mt",
    companies: ["BUMI"],
    action: "investigate",
  },
  {
    id: "strip-ratio",
    type: "operations",
    label: "OPERATING INTENSITY",
    title: "Strip ratio creates a second layer beyond headline production",
    summary:
      "The collected performance dataset supports cross-company comparison of production, overburden, and strip ratio.",
    takeaway:
      "Two miners with similar production can carry very different mining intensity. Scale alone is not enough.",
    metric: "Cross-company",
    companies: ["ADMR", "BUMI", "BYAN", "GEMS", "ITMG"],
    action: "compare",
  },
  {
    id: "financial-structure",
    type: "financials",
    label: "FINANCIAL STRUCTURE",
    title: "Revenue alone does not explain mining economics",
    summary:
      "The FY2024 financial dataset includes assets, revenue, cost of revenue, cost breakdowns, and net profit for five tracked companies.",
    takeaway:
      "This lets RX MDI compare operating scale with the economic structure underneath it instead of treating revenue as the whole story.",
    metric: "5 companies",
    companies: ["ADMR", "BUMI", "BYAN", "GEMS", "ITMG"],
    action: "compare",
  },
  {
    id: "bumi-costs",
    type: "financials",
    label: "COST STRUCTURE",
    title: "BUMI's reported cost base is heavily shaped by mining and stripping",
    summary:
      "For FY2024, BUMI reported USD 1.19B cost of revenue, including USD 849.26M of stripping and mining costs.",
    takeaway:
      "Cost composition is more informative than margin alone when explaining why production scale does not automatically translate into profit.",
    metric: "USD 849.26M",
    companies: ["BUMI"],
    action: "compare",
  },
  {
    id: "resource-depth",
    type: "resources",
    label: "RESERVE DEPTH",
    title: "Reserve and resource depth adds strategic context to production",
    summary:
      "The collected performance data includes reported reserves and resources for the five-company deep-coverage set.",
    takeaway:
      "Production answers how much is mined now. Reserves and resources help frame how much reported mining inventory sits behind that output.",
    metric: "FY2024",
    companies: ["ADMR", "BUMI", "BYAN", "GEMS", "ITMG"],
    action: "compare",
  },
  {
    id: "bumi-resource-depth",
    type: "resources",
    label: "COMPANY SIGNAL",
    title: "BUMI reports 2.354 Bt reserves against 6.817 Bt resources",
    summary:
      "The FY2024 performance snapshot reports total reserves of 2.354 Bt and total resources of 6.817 Bt.",
    takeaway:
      "That gives useful context for current output, but reserve conversion, mine planning, and economic recoverability still require deeper analysis.",
    metric: "34.5%",
    companies: ["BUMI"],
    action: "compare",
  },
  {
    id: "sales-geography",
    type: "markets",
    label: "SALES EXPOSURE",
    title: "Sales destination data reveals geographic dependence",
    summary:
      "Country-level FY2024 sales volume is available for BUMI, BYAN, GEMS, and ITMG.",
    takeaway:
      "Destination mix can reveal whether a company depends more heavily on domestic demand or specific export markets.",
    metric: "4 companies",
    companies: ["BUMI", "BYAN", "GEMS", "ITMG"],
    action: "compare",
  },
  {
    id: "bumi-destinations",
    type: "markets",
    label: "DESTINATION PATTERN",
    title: "BUMI's largest reported destination volumes include Indonesia, China, and India",
    summary:
      "In the collected FY2024 destination dataset, Indonesia, China, and India are the three largest reported BUMI sales-volume destinations.",
    takeaway:
      "This creates a concrete base for geographic exposure analysis without inventing revenue attribution where the source is null.",
    metric: "Top 3",
    companies: ["BUMI"],
    action: "compare",
  },
  {
    id: "market-observable",
    type: "markets",
    label: "MARKET INTELLIGENCE",
    title: "BUMI, BYAN, and ITMG have collected daily, broker, and foreign-flow data",
    summary:
      "These three companies currently support a market-intelligence layer on top of company and operational data.",
    takeaway:
      "That enables RX MDI to connect company fundamentals with market behavior without pretending every company has equal market coverage.",
    metric: "3 companies",
    companies: ["BUMI", "BYAN", "ITMG"],
    action: "compare",
  },
];

const filters: Array<{ key: InsightType; label: string }> = [
  { key: "all", label: "All Insights" },
  { key: "operations", label: "Operations" },
  { key: "financials", label: "Financials" },
  { key: "resources", label: "Resources" },
  { key: "markets", label: "Markets" },
  { key: "divergence", label: "Divergence" },
];

export function InsightsClient() {
  const [filter, setFilter] = useState<InsightType>("all");

  const [incomingSymbol] = useState(() => {
    if (typeof window === "undefined") return "";

    return (
      new URLSearchParams(window.location.search)
        .get("symbol")
        ?.toUpperCase() ?? ""
    );
  });

  const visible = useMemo(
    () => insights.filter((item) =>
      (filter === "all" || item.type === filter) &&
      (!incomingSymbol || item.companies.includes(incomingSymbol))
    ),
    [filter, incomingSymbol],
  );

  return (
    <>
      <section className={styles.overview}>
        <div>
          <span>INSIGHT ENGINE</span>
          <strong>{insights.length}</strong>
          <p>Current deterministic and evidence-grounded insight cards.</p>
        </div>
        <div>
          <span>DIVERGENCE PATH</span>
          <strong>Insight → Investigator</strong>
          <p>Signals can move into deeper evidence review without collapsing both experiences into one page.</p>
        </div>
        <div>
          <span>CORE RULE</span>
          <strong>No invented explanation</strong>
          <p>RX can calculate and surface the pattern while keeping unsupported causality explicitly unknown.</p>
        </div>
      </section>

      <section className={styles.filterBar}>
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            className={filter === item.key ? styles.activeFilter : undefined}
            onClick={() => setFilter(item.key)}
          >
            {item.label}
          </button>
        ))}
      </section>

      <section className={styles.grid}>
        {visible.map((item) => (
          <article key={item.id} className={styles.card}>
            <div className={styles.cardTop}>
              <span>{item.label}</span>
              <strong>{item.metric}</strong>
            </div>

            <h2>{item.title}</h2>
            <p>{item.summary}</p>

            <div className={styles.takeaway}>
              <span>WHY IT MATTERS</span>
              <strong>{item.takeaway}</strong>
            </div>

            <div className={styles.companyRow}>
              {item.companies.map((company) => (
                <span key={company}>{company}</span>
              ))}
            </div>

            <footer>
              <span>Evidence-grounded RX MDI insight</span>
              {item.action === "investigate" ? (
                <Link href={`/investigations?symbol=${item.companies[0]}&path=production-sales`}>Investigate</Link>
              ) : (
                <Link href="/explore">Explore data</Link>
              )}
            </footer>
          </article>
        ))}
      </section>

      <section className={styles.flow}>
        <div>
          <span>01</span>
          <strong>Data</strong>
          <p>Verified company, operational, financial and market inputs.</p>
        </div>
        <b>→</b>
        <div>
          <span>02</span>
          <strong>Insight</strong>
          <p>Pattern, ranking, anomaly, or deterministic divergence.</p>
        </div>
        <b>→</b>
        <div>
          <span>03</span>
          <strong>Investigator</strong>
          <p>Challenge the explanation against evidence and provenance.</p>
        </div>
      </section>
    </>
  );
}

