"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  comparisonSnapshots,
  goldenComparisonSymbols,
  type ComparisonCompany,
  type ComparisonMetric,
} from "@/lib/rxmdi/comparison-snapshots";
import styles from "./compare.module.css";

type MetricKey =
  | "production"
  | "sales"
  | "reserves"
  | "resources"
  | "revenue"
  | "netProfit"
  | "priceMove"
  | "foreignFlow";

type MetricDefinition = { label: string; key: MetricKey };
type MetricGroup = { title: string; description: string; metrics: MetricDefinition[] };

const supported = [...goldenComparisonSymbols];
const groups: MetricGroup[] = [
  {
    title: "Operations",
    description: "Reported operating scale and mining inventory.",
    metrics: [
      { label: "Production", key: "production" },
      { label: "Sales", key: "sales" },
      { label: "Reserves", key: "reserves" },
      { label: "Resources", key: "resources" },
    ],
  },
  {
    title: "Business & Money",
    description: "Provider-reported financial observations; no recomputed margin.",
    metrics: [
      { label: "Revenue", key: "revenue" },
      { label: "Net profit", key: "netProfit" },
    ],
  },
  {
    title: "Market Context",
    description: "Collected market-window observations. Context is not causality.",
    metrics: [
      { label: "Recent price move", key: "priceMove" },
      { label: "Net foreign flow", key: "foreignFlow" },
    ],
  },
];

function MetricValue({ metric }: { metric: ComparisonMetric }) {
  return (
    <div className={styles.metricValue}>
      <strong>{metric.value}</strong>
      <small>{metric.period}</small>
    </div>
  );
}

function CompanyHeading({ company }: { company: ComparisonCompany }) {
  return (
    <div className={styles.companyHeading}>
      <strong>{company.symbol}</strong>
      <span>{company.name}</span>
      <small>{company.commodity}</small>
    </div>
  );
}

type CompareClientProps = {
  initialCompanies: string[];
};

export function CompareClient({ initialCompanies }: CompareClientProps) {
  const [selected, setSelected] = useState<string[]>(() => initialCompanies);
  const companies = useMemo(
    () => selected.map((symbol) => comparisonSnapshots[symbol]).filter(Boolean),
    [selected],
  );

  function toggle(symbol: string) {
    setSelected((current) => {
      let next = current;

      if (current.includes(symbol)) {
        if (current.length <= 2) return current;
        next = current.filter((item) => item !== symbol);
      } else {
        next = [...current, symbol];
      }

      const url = new URL(window.location.href);
      url.searchParams.set("companies", next.join(","));
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);

      return next;
    });
  }

  return (
    <>
      <section className={styles.selector}>
        <div>
          <span>SUPPORTED COMPARISON SET</span>
          <h2>Select 2 or 3 companies</h2>
          <p>BUMI, BYAN and ITMG currently have the complete comparison snapshot used by this surface.</p>
        </div>
        <div className={styles.chips}>
          {supported.map((symbol) => {
            const active = selected.includes(symbol);
            return (
              <button
                key={symbol}
                type="button"
                className={active ? styles.activeChip : undefined}
                onClick={() => toggle(symbol)}
                aria-pressed={active}
              >
                {symbol}
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.coverage}>
        <strong>{companies.length} COMPANIES</strong>
        <span>Reported values remain paired with their own reporting or observation period.</span>
      </section>

      {groups.map((group) => (
        <section className={styles.group} key={group.title}>
          <header>
            <span>REPORTED COMPARISON</span>
            <h2>{group.title}</h2>
            <p>{group.description}</p>
          </header>
          <div className={styles.tableWrap}>
            <div className={styles.table} style={{ minWidth: `${180 + companies.length * 210}px` }}>
              <div className={`${styles.row} ${styles.head}`}>
                <div className={styles.label}>METRIC</div>
                {companies.map((company) => (
                  <CompanyHeading key={company.symbol} company={company} />
                ))}
              </div>
              {group.metrics.map((metric) => (
                <div className={styles.row} key={metric.key}>
                  <div className={styles.label}>{metric.label}</div>
                  {companies.map((company) => (
                    <MetricValue key={company.symbol} metric={company[metric.key]} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className={styles.guardrail}>
        <span>RX MDI COMPARISON GUARDRAIL</span>
        <strong>Side by side does not mean same period, same meaning, or causality.</strong>
        <p>
          RX MDI preserves the period attached to each observation. This surface does not rank companies,
          recompute financial ratios, or infer that market movement caused operational or financial results.
        </p>
      </section>

      <section className={styles.next}>
        <div>
          <span>GO DEEPER</span>
          <h2>Move from comparison to evidence.</h2>
        </div>
        <div className={styles.companyActions}>
          {companies.map((company) => (
            <div key={company.symbol}>
              <strong>{company.symbol}</strong>
              <Link href={`/companies/${company.symbol}`}>Open Company</Link>
              <Link href={`/investigations?symbol=${company.symbol}`}>Investigate</Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
