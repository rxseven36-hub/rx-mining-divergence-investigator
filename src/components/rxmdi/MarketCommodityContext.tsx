import Link from "next/link";
import styles from "./MarketCommodityContext.module.css";

type MarketSnapshot = {
  date?: string | null;
  close?: number | null;
  move?: number | null;
  volume?: number | null;
  marketCap?: number | null;
};

type MarketCommodityContextProps = {
  symbol: string;
  commodity: string;
  market: MarketSnapshot;
};

function formatNumber(value: number | null | undefined, digits = 2) {
  if (value == null || !Number.isFinite(Number(value))) return "—";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(Number(value));
}

function formatCompact(value: number | null | undefined) {
  if (value == null || !Number.isFinite(Number(value))) return "—";

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatMove(value: number | null | undefined) {
  if (value == null || !Number.isFinite(Number(value))) return "—";

  const numeric = Number(value);
  return `${numeric > 0 ? "+" : ""}${numeric.toFixed(2)}%`;
}

export function MarketCommodityContext({
  symbol,
  commodity,
  market,
}: MarketCommodityContextProps) {
  const commodityLabel = commodity.trim().toUpperCase() || "COMMODITY";

  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <div>
          <span>MARKET + GLOBAL CONTEXT</span>
          <h3>Put {symbol} beside the market around it.</h3>
        </div>

        <strong>OBSERVED CONTEXT</strong>
      </div>

      <div className={styles.grid}>
        <article className={styles.card}>
          <header>
            <div>
              <span>MARKET PULSE</span>
              <h4>{symbol} trading snapshot</h4>
            </div>

            <b>{market.date || "SNAPSHOT"}</b>
          </header>

          <div className={styles.metrics}>
            <div>
              <span>LAST CLOSE</span>
              <strong>{formatNumber(market.close, 0)}</strong>
            </div>

            <div>
              <span>DAILY MOVE</span>
              <strong>{formatMove(market.move)}</strong>
            </div>

            <div>
              <span>VOLUME</span>
              <strong>{formatCompact(market.volume)}</strong>
            </div>

            <div>
              <span>MARKET CAP</span>
              <strong>{formatCompact(market.marketCap)}</strong>
            </div>
          </div>

          <p>
            Latest values from the collected company market snapshot. Missing
            fields remain unavailable rather than being reconstructed.
          </p>

          <Link
            className={styles.action}
            href={`/investigations?symbol=${symbol}&path=market`}
          >
            Investigate {symbol} Market <span>→</span>
          </Link>
        </article>

        <article className={`${styles.card} ${styles.commodityCard}`}>
          <header>
            <div>
              <span>GLOBAL COMMODITY CONTEXT</span>
              <h4>{commodityLabel}</h4>
            </div>

            <b>GLOBAL CONTEXT</b>
          </header>

          <div className={styles.commodityBody}>
            <strong>{commodityLabel}</strong>
            <span>GLOBAL PRICE EVIDENCE</span>
          </div>

          <p>
            Deterministic commodity-price evidence is available through the
            Investigator. RX MDI does not claim that commodity movement caused
            this company&apos;s operational or market performance.
          </p>

          <Link
            className={styles.action}
            href={`/investigations?symbol=${symbol}&path=commodity-context`}
          >
            Investigate Global {commodityLabel} <span>→</span>
          </Link>
        </article>
      </div>

      <small className={styles.guardrail}>
        Context is evidence, not causality. Company-market observations and
        global commodity observations remain separate evidence domains.
      </small>
    </section>
  );
}
