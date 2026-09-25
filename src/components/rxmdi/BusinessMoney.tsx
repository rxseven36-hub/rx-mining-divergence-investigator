import s from "./BusinessMoney.module.css";

type BusinessMoneyProps = {
  year: number;
  revenue: number | null;
  netProfit: number | null;
  assets: number | null;
  costRevenue: number | null;
};

const money = (value: number | null) => {
  if (value == null || !Number.isFinite(value)) return "NOT REPORTED";

  if (Math.abs(value) >= 1e9) {
    return `US$${(value / 1e9).toFixed(2)}B`;
  }

  if (Math.abs(value) >= 1e6) {
    return `US$${(value / 1e6).toFixed(1)}M`;
  }

  return `US$${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)}`;
};

const visualWidth = (
  value: number | null,
  reference: number | null,
) => {
  if (
    value == null ||
    reference == null ||
    !Number.isFinite(value) ||
    !Number.isFinite(reference) ||
    reference <= 0
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, (Math.abs(value) / reference) * 100),
  );
};

export function BusinessMoney({
  year,
  revenue,
  netProfit,
  assets,
  costRevenue,
}: BusinessMoneyProps) {
  const magnitudeReference = Math.max(
    Math.abs(revenue ?? 0),
    Math.abs(costRevenue ?? 0),
    Math.abs(netProfit ?? 0),
  );

  return (
    <article className={s.panel}>
      <header className={s.header}>
        <div>
          <span>BUSINESS & MONEY · FY{year}</span>
          <h3>Business scale and reported earnings</h3>
        </div>

        <small>REPORTED FINANCIALS</small>
      </header>

      <div className={s.metrics}>
        <div>
          <span>REVENUE</span>
          <strong>{money(revenue)}</strong>
          <small>Reported value</small>
        </div>

        <div>
          <span>COST OF REVENUE</span>
          <strong>{money(costRevenue)}</strong>
          <small>Reported value</small>
        </div>

        <div>
          <span>NET PROFIT</span>
          <strong>{money(netProfit)}</strong>
          <small>Reported value</small>
        </div>

        <div>
          <span>TOTAL ASSETS</span>
          <strong>{money(assets)}</strong>
          <small>Reported value</small>
        </div>
      </div>

      <div className={s.visual}>
        <div className={s.visualHead}>
          <div>
            <span>REPORTED MAGNITUDE</span>
            <strong>Revenue · cost · net profit</strong>
          </div>

          <small>Visual scale only</small>
        </div>

        <div className={s.bar}>
          <div className={s.barMeta}>
            <span>Revenue</span>
            <strong>{money(revenue)}</strong>
          </div>

          <div className={s.track}>
            <div
              className={s.revenue}
              style={{
                width: `${visualWidth(
                  revenue,
                  magnitudeReference,
                )}%`,
              }}
            />
          </div>
        </div>

        <div className={s.bar}>
          <div className={s.barMeta}>
            <span>Cost of revenue</span>
            <strong>{money(costRevenue)}</strong>
          </div>

          <div className={s.track}>
            <div
              className={s.cost}
              style={{
                width: `${visualWidth(
                  costRevenue,
                  magnitudeReference,
                )}%`,
              }}
            />
          </div>
        </div>

        <div className={s.bar}>
          <div className={s.barMeta}>
            <span>Net profit</span>
            <strong>{money(netProfit)}</strong>
          </div>

          <div className={s.track}>
            <div
              className={s.profit}
              style={{
                width: `${visualWidth(
                  netProfit,
                  magnitudeReference,
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className={s.read}>
        <span>RX MDI READ</span>

        <p>
          FY{year} reported revenue was{" "}
          <strong>{money(revenue)}</strong>, with{" "}
          <strong>{money(costRevenue)}</strong> reported as cost of
          revenue and <strong>{money(netProfit)}</strong> reported as
          net profit. Total assets were reported at{" "}
          <strong>{money(assets)}</strong>.
        </p>

        <small>
          Bars visualize the relative magnitude of reported values for
          readability only. RX MDI does not infer causality, valuation
          quality, or investment judgment from these observations.
        </small>
      </div>
    </article>
  );
}