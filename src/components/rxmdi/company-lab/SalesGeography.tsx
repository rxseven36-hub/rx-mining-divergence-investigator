import type { BumiSalesDestination } from "./company-lab.types";
import styles from "./CompanyLab.module.css";

type Props = {
  destinations: BumiSalesDestination[];
};

function format(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export default function SalesGeography({
  destinations,
}: Props) {
  const total = destinations.reduce(
    (sum, item) => sum + item.volume,
    0,
  );

  const domestic =
    destinations.find(
      (item) => item.country === "Indonesia",
    )?.volume ?? 0;

  const exportVolume = total - domestic;

  const exportShare =
    total > 0 ? (exportVolume / total) * 100 : 0;

  const maxVolume = Math.max(
    ...destinations.map((item) => item.volume),
    1,
  );

  const topExport =
    destinations.find(
      (item) => item.country !== "Indonesia",
    ) ?? null;

  return (
    <section className={styles.salesSection}>
      <div className={styles.salesHeader}>
        <div>
          <span>SALES GEOGRAPHY</span>
          <h2>Where does BUMI&apos;s coal go?</h2>
          <p>
            Reported 2024 sales volumes show both domestic demand
            and the company&apos;s major international markets.
          </p>
        </div>

        <div className={styles.salesTotal}>
          <span>TOTAL DESTINATION VOLUME</span>
          <strong>{format(total)} Mt</strong>
          <small>2024 reported destinations</small>
        </div>
      </div>

      <div className={styles.salesHighlights}>
        <div>
          <span>DOMESTIC</span>
          <strong>{format(domestic)} Mt</strong>
          <small>Indonesia</small>
        </div>

        <div>
          <span>EXPORT</span>
          <strong>{format(exportVolume)} Mt</strong>
          <small>{format(exportShare)}% of destination volume</small>
        </div>

        {topExport && (
          <div>
            <span>LARGEST EXPORT MARKET</span>
            <strong>{topExport.country}</strong>
            <small>{format(topExport.volume)} Mt</small>
          </div>
        )}
      </div>

      <div className={styles.salesRanking}>
        {destinations.map((destination, index) => {
          const width =
            (destination.volume / maxVolume) * 100;

          const share =
            total > 0
              ? (destination.volume / total) * 100
              : 0;

          return (
            <article
              key={destination.country}
              className={styles.salesRow}
            >
              <span className={styles.salesRank}>
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className={styles.salesCountry}>
                <strong>{destination.country}</strong>
                <small>
                  {destination.country === "Indonesia"
                    ? "Domestic market"
                    : "Export market"}
                </small>
              </div>

              <div className={styles.salesBarArea}>
                <div className={styles.salesBarMeta}>
                  <span>{format(share)}%</span>
                  <strong>
                    {format(destination.volume)} Mt
                  </strong>
                </div>

                <div className={styles.salesTrack}>
                  <div
                    className={styles.salesFill}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.salesRead}>
        <span>RX MDI READ</span>

        <p>
          Indonesia is the largest single destination in the
          reported dataset, while China and India form the two
          largest export markets.
        </p>
      </div>
    </section>
  );
}
