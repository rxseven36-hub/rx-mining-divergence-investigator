import styles from "./CompanyLab.module.css";

import historyJson from "./generated/bumi-history.json";
import sitesJson from "./generated/bumi-sites.json";

import { bumiCompanyLabData as data } from "./bumi-company-lab.data";

import HistoricalTrend from "./HistoricalTrend";
import MineOperations from "./MineOperations";
import CoalProducts from "./CoalProducts";
import SalesGeography from "./SalesGeography";

import productsJson from "./generated/bumi-products.json";
import salesDestinationsJson from "./generated/bumi-sales-destinations.json";
import CompanyMineFootprint from "./CompanyMineFootprint";

import type {
  BumiHistoryPoint,
  BumiMineSite,
  BumiCoalProduct,
  BumiSalesDestination,
} from "./company-lab.types";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);
}

function MetricCard({
  label,
  value,
  unit,
  note,
}: {
  label: string;
  value: number;
  unit: string;
  note: string;
}) {
  return (
    <article className={styles.metricCard}>
      <span className={styles.metricLabel}>
        {label}
      </span>

      <div className={styles.metricValue}>
        {formatNumber(value)}
        <span>{unit}</span>
      </div>

      <p>{note}</p>
    </article>
  );
}

export default function BumiCompanyLab() {
  const history: BumiHistoryPoint[] = Array.isArray(historyJson)
  ? (historyJson as BumiHistoryPoint[])
  : [historyJson as BumiHistoryPoint];

const sites: BumiMineSite[] = Array.isArray(sitesJson)
  ? (sitesJson as BumiMineSite[])
  : [sitesJson as BumiMineSite];
  
const products: BumiCoalProduct[] = Array.isArray(productsJson)
  ? (productsJson as BumiCoalProduct[])
  : [productsJson as BumiCoalProduct];

const salesDestinations: BumiSalesDestination[] = Array.isArray(
  salesDestinationsJson,
)
  ? (salesDestinationsJson as BumiSalesDestination[])
  : [salesDestinationsJson as BumiSalesDestination];
  const productionWidth = Math.min(
    100,
    (data.production / data.sales) * 100,
  );

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>
            RX MDI · COMPANY INTELLIGENCE
          </div>

          <div className={styles.titleRow}>
            <div className={styles.ticker}>
              {data.ticker}
            </div>

            <div>
              <h1>{data.name}</h1>

              <div className={styles.tags}>
                <span>{data.symbol}</span>
                <span>{data.subtype}</span>
                <span>
                  {data.siteCount} validated mining sites
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.heroStatus}>
          <span>DATA YEAR</span>
          <strong>{data.year}</strong>
          <small>
            Verified company performance
          </small>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <span>AT A GLANCE</span>

            <h2>
              The scale of BUMI&apos;s mining business
            </h2>
          </div>

          <p>
            A fast view of production, sales and the
            coal base supporting the company&apos;s
            operations.
          </p>
        </div>

        <div className={styles.metrics}>
          <MetricCard
            label="PRODUCTION"
            value={data.production}
            unit="Mt"
            note="Coal produced during 2024"
          />

          <MetricCard
            label="SALES"
            value={data.sales}
            unit="Mt"
            note="Coal sales volume during 2024"
          />

          <MetricCard
            label="RESERVES"
            value={data.reserves}
            unit="Mt"
            note="Reported total coal reserves"
          />

          <MetricCard
            label="RESOURCES"
            value={data.resources}
            unit="Mt"
            note="Reported total coal resources"
          />
        </div>
      </section>

      <section className={styles.pulse}>
        <div className={styles.pulseIntro}>
          <span>OPERATIONAL PULSE</span>

          <h2>
            How much coal moved through the business?
          </h2>

          <p>
            Production and sales remained closely matched,
            while the mining operation moved substantially
            more overburden to expose coal.
          </p>

          <div className={styles.secondaryMetrics}>
            <div>
              <span>OVERBURDEN</span>

              <strong>
                {formatNumber(data.overburden)}
              </strong>

              <small>Mt · 2024 reported value</small>
            </div>

            <div>
              <span>STRIP RATIO</span>

              <strong>
                {formatNumber(data.stripRatio)}
              </strong>

              <small>2024 company level</small>
            </div>
          </div>
        </div>

        <div className={styles.volumePanel}>
          <div className={styles.volumeHeader}>
            <div>
              <span>2024 COAL VOLUME</span>
              <strong>Production vs Sales</strong>
            </div>

            <small>Mt</small>
          </div>

          <div className={styles.barGroup}>
            <div className={styles.barItem}>
              <div className={styles.barMeta}>
                <span>Production</span>

                <strong>
                  {formatNumber(data.production)} Mt
                </strong>
              </div>

              <div className={styles.track}>
                <div
                  className={`${styles.fill} ${styles.production}`}
                  style={{
                    width: `${productionWidth}%`,
                  }}
                />
              </div>
            </div>

            <div className={styles.barItem}>
              <div className={styles.barMeta}>
                <span>Sales</span>

                <strong>
                  {formatNumber(data.sales)} Mt
                </strong>
              </div>

              <div className={styles.track}>
                <div
                  className={`${styles.fill} ${styles.sales}`}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>

          <div className={styles.pulseInsight}>
            <span>RX MDI READ</span>

            <p>
              Sales were slightly above production in
              2024:
              <strong> +1.1 Mt</strong>. This becomes
              more meaningful when viewed against
              historical performance and mine-level
              operations.
            </p>
          </div>
        </div>
      </section>

      <HistoricalTrend data={history} />

      <MineOperations sites={sites} />
      <CompanyMineFootprint />
      <CoalProducts products={products} />

      <SalesGeography destinations={salesDestinations} />

      <section className={styles.nextLayer}>
        <span>NEXT INTELLIGENCE LAYERS</span>

        <div>


          <strong>Business & Money</strong>
          <strong>Market Pulse</strong>
          <strong>Events</strong>
          <strong>Investigate</strong>
        </div>
      </section>
    </main>
  );
}

