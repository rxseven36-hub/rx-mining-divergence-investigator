import type { BumiHistoryPoint } from "./company-lab.types";
import styles from "./CompanyLab.module.css";

type Props = {
  data: BumiHistoryPoint[];
};

function number(value: number | null) {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);
}

export default function HistoricalTrend({ data }: Props) {
  const usable = data.filter(
    (item) => item.production !== null || item.sales !== null,
  );

  if (usable.length < 2) {
    return (
      <section className={styles.historySection}>
        <div className={styles.sectionHeading}>
          <div>
            <span>HISTORICAL PERFORMANCE</span>
            <h2>Production & sales through time</h2>
          </div>

          <p>
            RX MDI will only draw a historical trend when multiple
            verified yearly observations exist locally.
          </p>
        </div>

        <div className={styles.historyUnavailable}>
          <strong>Historical series not cached locally yet</strong>

          <p>
            Current verified company-level performance remains
            available for 2024. No missing years are estimated or
            fabricated.
          </p>
        </div>
      </section>
    );
  }

  const width = 900;
  const height = 280;
  const left = 55;
  const right = 25;
  const top = 25;
  const bottom = 40;

  const values = usable.flatMap((item) =>
    [item.production, item.sales].filter(
      (value): value is number => value !== null,
    ),
  );

  const maxValue = Math.max(...values) * 1.1;

  function x(index: number) {
    if (usable.length === 1) return width / 2;

    return (
      left +
      (index * (width - left - right)) /
        (usable.length - 1)
    );
  }

  function y(value: number) {
    return (
      top +
      (1 - value / maxValue) *
        (height - top - bottom)
    );
  }

  const productionPoints = usable
    .map((item, index) =>
      item.production === null
        ? null
        : `${x(index)},${y(item.production)}`,
    )
    .filter(Boolean)
    .join(" ");

  const salesPoints = usable
    .map((item, index) =>
      item.sales === null
        ? null
        : `${x(index)},${y(item.sales)}`,
    )
    .filter(Boolean)
    .join(" ");

  return (
    <section className={styles.historySection}>
      <div className={styles.sectionHeading}>
        <div>
          <span>HISTORICAL PERFORMANCE</span>
          <h2>Production & sales through time</h2>
        </div>

        <div className={styles.chartLegend}>
          <span>
            <i className={styles.legendProduction} />
            Production
          </span>

          <span>
            <i className={styles.legendSales} />
            Sales
          </span>
        </div>
      </div>

      <div className={styles.chartShell}>
        <svg
          className={styles.chart}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="BUMI production and sales history"
        >
          {[0.25, 0.5, 0.75, 1].map((level) => {
            const value = maxValue * level;
            const yy = y(value);

            return (
              <g key={level}>
                <line
                  x1={left}
                  x2={width - right}
                  y1={yy}
                  y2={yy}
                  className={styles.gridLine}
                />

                <text
                  x={left - 12}
                  y={yy + 4}
                  textAnchor="end"
                  className={styles.axisText}
                >
                  {number(value)}
                </text>
              </g>
            );
          })}

          <polyline
            points={productionPoints}
            className={styles.productionLine}
          />

          <polyline
            points={salesPoints}
            className={styles.salesLine}
          />

          {usable.map((item, index) => {
            const xx = x(index);

            return (
              <g key={item.year}>
                <text
                  x={xx}
                  y={height - 10}
                  textAnchor="middle"
                  className={styles.axisText}
                >
                  {item.year}
                </text>

                {item.production !== null && (
                  <circle
                    cx={xx}
                    cy={y(item.production)}
                    r="5"
                    className={styles.productionDot}
                  />
                )}

                {item.sales !== null && (
                  <circle
                    cx={xx}
                    cy={y(item.sales)}
                    r="5"
                    className={styles.salesDot}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className={styles.historyTable}>
        {usable.map((item) => (
          <div key={item.year}>
            <span>{item.year}</span>

            <strong>{number(item.production)} Mt</strong>

            <small>
              Sales {number(item.sales)} Mt
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}
