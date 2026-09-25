"use client";

import styles from "./OwnershipStructure.module.css";

type OwnershipEntry = { name?: string | null; percentage_ownership?: number | null };
type Props = {
  symbol: string;
  parents?: OwnershipEntry[] | null;
  subsidiaries?: OwnershipEntry[] | null;
};

const pct = (value: number | null | undefined) =>
  value != null && Number.isFinite(Number(value))
    ? `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(value))}%`
    : "Percentage not reported";

export function OwnershipStructure({ symbol, parents, subsidiaries }: Props) {
  const parentRows = (parents ?? []).filter((row) => row?.name);
  const subsidiaryRows = (subsidiaries ?? []).filter((row) => row?.name);

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <span>OWNERSHIP STRUCTURE</span>
          <h3>Reported ownership around {symbol}</h3>
        </div>
        <b>COLLECTED RELATIONSHIPS</b>
      </header>

      <div className={styles.relationship}>
        <div className={styles.parentBlock}>
          <span>PARENT OWNERSHIP</span>
          {parentRows.length ? (
            <div className={styles.parentList}>
              {parentRows.map((row, index) => (
                <article key={`${row.name}-${index}`}>
                  <strong>{row.name}</strong>
                  <em>{pct(row.percentage_ownership)}</em>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.missing}>No collected parent ownership detail</div>
          )}
        </div>

        <div className={styles.connector} aria-hidden="true">
          <span />
          <b>{symbol}</b>
          <span />
        </div>

        <div className={styles.subBlock}>
          <div className={styles.subHead}>
            <span>SUBSIDIARIES</span>
            <strong>{subsidiaryRows.length} collected</strong>
          </div>
          {subsidiaryRows.length ? (
            <details>
              <summary>Show reported subsidiaries</summary>
              <div className={styles.subList}>
                {subsidiaryRows.map((row, index) => (
                  <article key={`${row.name}-${index}`}>
                    <strong>{row.name}</strong>
                    <span>{pct(row.percentage_ownership)}</span>
                  </article>
                ))}
              </div>
            </details>
          ) : (
            <div className={styles.missing}>No collected subsidiary ownership detail</div>
          )}
        </div>
      </div>

      <p className={styles.guardrail}>
        RX MDI shows collected ownership relationships only. Missing parent data
        does not mean that no parent or controlling shareholder exists, and RX MDI
        does not infer a business group from company names.
      </p>
    </section>
  );
}
