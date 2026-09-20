import Link from "next/link";
import styles from "./ProductionSalesVisual.module.css";

type Props = {
  symbol: string;
  year: number | string;
  production: number | null | undefined;
  sales: number | null | undefined;
  unit?: string | null;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function ProductionSalesVisual({
  symbol,
  year,
  production,
  sales,
  unit,
}: Props) {
  const productionValue =
    production != null && Number.isFinite(Number(production))
      ? Number(production)
      : null;

  const salesValue =
    sales != null && Number.isFinite(Number(sales))
      ? Number(sales)
      : null;

  const displayUnit = unit?.trim() || "Mt";

  if (productionValue === null || salesValue === null) {
    return (
      <article className={styles.visual}>
        <div className={styles.heading}>
          <div>
            <span>VISUAL INTELLIGENCE · {year}</span>
            <h3>Production vs sales</h3>
          </div>

          <span className={styles.state}>INSUFFICIENT DATA</span>
        </div>

        <div className={styles.unavailable}>
          <strong>No comparable production / sales pair</strong>
          <p>
            RX MDI does not estimate missing operational values.
          </p>
        </div>
      </article>
    );
  }

  const maxValue = Math.max(productionValue, salesValue, 1);

  const productionWidth =
    (productionValue / maxValue) * 100;

  const salesWidth =
    (salesValue / maxValue) * 100;

  const gap = salesValue - productionValue;
  const absoluteGap = Math.abs(gap);

  const relativeGap =
    productionValue !== 0
      ? (absoluteGap / Math.abs(productionValue)) * 100
      : null;

  const direction =
    gap > 0
      ? "Sales exceeded reported production"
      : gap < 0
        ? "Production exceeded reported sales"
        : "Production and sales were equal";

  return (
    <article className={styles.visual}>
      <div className={styles.heading}>
        <div>
          <span>VISUAL INTELLIGENCE · {year}</span>
          <h3>Production vs sales</h3>
        </div>

        <span className={styles.state}>OBSERVED GAP</span>
      </div>

      <div className={styles.chart}>
        <div className={styles.row}>
          <div className={styles.label}>
            <span>PRODUCTION</span>
            <strong>
              {formatNumber(productionValue)} {displayUnit}
            </strong>
          </div>

          <div className={styles.track}>
            <div
              className={`${styles.bar} ${styles.production}`}
              style={{ width: `${productionWidth}%` }}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.label}>
            <span>SALES</span>
            <strong>
              {formatNumber(salesValue)} {displayUnit}
            </strong>
          </div>

          <div className={styles.track}>
            <div
              className={`${styles.bar} ${styles.sales}`}
              style={{ width: `${salesWidth}%` }}
            />
          </div>
        </div>
      </div>

      <div className={styles.intelligence}>
        <div>
          <span>OBSERVED GAP</span>
          <strong>
            {gap > 0 ? "+" : gap < 0 ? "−" : ""}
            {formatNumber(absoluteGap)} {displayUnit}
          </strong>
        </div>

        <div>
          <span>RELATIVE TO PRODUCTION</span>
          <strong>
            {relativeGap !== null
              ? `${relativeGap.toFixed(1)}%`
              : "N/A"}
          </strong>
        </div>

        <div className={styles.readout}>
          <span>WHAT THE DATA SHOWS</span>
          <strong>{direction}</strong>
          <small>
            This is an observed numerical relationship, not a causal
            conclusion.
          </small>
        </div>
      </div>

      <div className={styles.footer}>
        <p>
          Compare the reported operational values first, then open the
          investigation layer for evidence-bounded analysis.
        </p>

        <Link href={`/investigations?symbol=${symbol}&path=production-sales`}>
          Investigate {symbol}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}