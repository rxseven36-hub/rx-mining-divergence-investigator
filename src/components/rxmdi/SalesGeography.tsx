"use client";

import Link from "next/link";
import styles from "./SalesGeography.module.css";

type SalesDestination = {
  name?: string | null;
  percentage_of_sales_volume?: number | null;
  revenue_usd?: number | null;
  volume?: number | null;
  unit?: string | null;
};

type Props = {
  symbol: string;
  year?: number | string | null;
  destinations?: SalesDestination[] | null;
};

type MetricKind = "percentage" | "volume" | "revenue";

const number = (value: number, digits = 2) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);

const usd = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `US$${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `US$${(value / 1e6).toFixed(1)}M`;
  return `US$${number(value, 0)}`;
};

function metricKind(rows: SalesDestination[]): MetricKind | null {
  if (rows.some((row) => row.percentage_of_sales_volume != null)) return "percentage";
  if (rows.some((row) => row.volume != null)) return "volume";
  if (rows.some((row) => row.revenue_usd != null)) return "revenue";
  return null;
}

function valueFor(row: SalesDestination, kind: MetricKind): number | null {
  if (kind === "percentage") return row.percentage_of_sales_volume ?? null;
  if (kind === "volume") return row.volume ?? null;
  return row.revenue_usd ?? null;
}

function displayValue(row: SalesDestination, kind: MetricKind) {
  const value = valueFor(row, kind);
  if (value == null) return "Not reported";
  if (kind === "percentage") return `${number(value)}% of sales volume`;
  if (kind === "revenue") return `${usd(value)} reported revenue`;
  return `${number(value)}${row.unit ? ` ${row.unit}` : ""}`;
}

function metricLabel(kind: MetricKind) {
  if (kind === "percentage") return "REPORTED SALES VOLUME SHARE";
  if (kind === "volume") return "REPORTED DESTINATION VOLUME";
  return "REPORTED DESTINATION REVENUE";
}

export function SalesGeography({ symbol, year, destinations }: Props) {
  const rows = (destinations ?? []).filter((row) => row?.name);
  const kind = metricKind(rows);

  const comparable = kind
    ? rows.filter((row) => valueFor(row, kind) != null)
    : [];

  const max = comparable.reduce(
    (current, row) => Math.max(current, Math.abs(valueFor(row, kind!) ?? 0)),
    0,
  );

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <span>VISUAL INTELLIGENCE{year ? ` / ${year}` : ""}</span>
          <h3>Sales geography</h3>
          <p>Where reported sales are exposed</p>
        </div>
        <b>REPORTED DESTINATIONS</b>
      </header>

      {!rows.length || !kind ? (
        <div className={styles.empty}>
          <strong>No collected destination detail</strong>
          <p>
            RX MDI does not infer destination exposure when the collected company
            dataset does not provide it.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.meta}>
            <div>
              <span>DESTINATIONS</span>
              <strong>{rows.length}</strong>
            </div>
            <div>
              <span>VISUAL METRIC</span>
              <strong>{metricLabel(kind)}</strong>
            </div>
            <div>
              <span>EVIDENCE MODE</span>
              <strong>PROVIDER REPORTED</strong>
            </div>
          </div>

          <div className={styles.chart}>
            {rows.map((row, index) => {
              const value = valueFor(row, kind);
              const width =
                value != null && max > 0
                  ? Math.max(2, (Math.abs(value) / max) * 100)
                  : 0;

              return (
                <article className={styles.row} key={`${row.name}-${index}`}>
                  <div className={styles.label}>
                    <strong>{row.name}</strong>
                    <span>{displayValue(row, kind)}</span>
                  </div>

                  <div className={styles.track} aria-hidden="true">
                    {value != null ? (
                      <span className={styles.bar} style={{ width: `${width}%` }} />
                    ) : (
                      <span className={styles.missing}>NOT REPORTED</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className={styles.readout}>
            <span>WHAT THE VISUAL SHOWS</span>
            <strong>
              Bar length compares only the provider-reported metric selected above.
            </strong>
            <small>
              RX MDI does not convert revenue into sales share, fill missing values,
              combine overlapping country and regional rows, or classify a destination
              as domestic or export unless the collected evidence says so.
            </small>
          </div>
        </>
      )}

      <div className={styles.footer}>
        <p>
          Read the reported geography first, then open the investigation layer for
          admitted evidence and the provider-shaped observations.
        </p>
        <Link href={`/investigations?symbol=${symbol}&path=sales-destination`}>
          Investigate Sales Destination
        </Link>
      </div>
    </section>
  );
}