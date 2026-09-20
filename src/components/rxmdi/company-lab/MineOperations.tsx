import Link from "next/link";
import type { BumiMineSite } from "./company-lab.types";
import styles from "./CompanyLab.module.css";

type Props = {
  sites: BumiMineSite[];
};

function number(value: number | null) {
  if (value === null || value === undefined) {
    return "Not reported";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);
}

export default function MineOperations({ sites }: Props) {
  const productionSites = sites.filter(
    (site) => site.production !== null,
  );

  const maxProduction = Math.max(
    ...productionSites.map((site) => site.production ?? 0),
    1,
  );

  return (
    <section className={styles.mineSection}>
      <div className={styles.mineHeader}>
        <div>
          <span>MINE OPERATIONS</span>
          <h2>Which mines drive BUMI&apos;s operations?</h2>

          <p>
            Compare reported production and mining intensity across
            validated operating sites.
          </p>
        </div>

        <Link
          href="/map-lab?company=BUMI"
          className={styles.mapButton}
        >
          Open Mining Map →
        </Link>
      </div>

      <div className={styles.mineSummary}>
        <div>
          <strong>{sites.length}</strong>
          <span>VALIDATED SITES</span>
        </div>

        <div>
          <strong>{productionSites.length}</strong>
          <span>WITH PRODUCTION DATA</span>
        </div>

        <div>
          <strong>
            {
              sites.filter(
                (site) => site.stripRatio !== null,
              ).length
            }
          </strong>
          <span>WITH STRIP RATIO</span>
        </div>

        <div>
  	  <strong>
    	    {
      	      sites.filter(
        	(site) =>
          	  site.resources !== null ||
          	  site.reserves !== null,
      	      ).length
    	     }
  	  </strong>
  	  <span>WITH QUANTIFIED R/R TOTALS</span>
	 </div>
      </div>

      <div className={styles.mineList}>
        {sites.map((site, index) => {
          const productionWidth =
            site.production === null
              ? 0
              : (site.production / maxProduction) * 100;

          return (
            <article
              key={`${site.slug ?? site.name}-${index}`}
              className={styles.mineRow}
            >
              <div className={styles.mineIdentity}>
                <span>
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>
                  <strong>{site.name}</strong>

                  <small>
                    {site.operator}
                    {site.province
                      ? ` · ${site.province}`
                      : ""}
                  </small>
                </div>
              </div>

              <div className={styles.mineProduction}>
                <div>
                  <span>PRODUCTION</span>

                  <strong>
                    {site.production === null
                      ? "Not reported"
                      : `${number(site.production)} Mt`}
                  </strong>
                </div>

                <div className={styles.mineTrack}>
                  {site.production !== null && (
                    <div
                      className={styles.mineFill}
                      style={{
                        width: `${productionWidth}%`,
                      }}
                    />
                  )}
                </div>
              </div>

              <div className={styles.mineMetric}>
                <span>STRIP RATIO</span>
                <strong>{number(site.stripRatio)}</strong>
              </div>

              <div className={styles.mineMetric}>
                <span>OVERBURDEN</span>

                <strong>
                  {site.overburden === null
                    ? "—"
                    : number(site.overburden)}
                </strong>
              </div>

              <div className={styles.mineMetric}>
                <span>DATA YEAR</span>
                <strong>{site.year ?? "—"}</strong>
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.mineNote}>
        Company-level production is not distributed among mines when
        supporting site-level evidence is unavailable.
      </div>
    </section>
  );
}
