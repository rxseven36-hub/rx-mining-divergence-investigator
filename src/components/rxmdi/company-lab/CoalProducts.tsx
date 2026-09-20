import type { BumiCoalProduct } from "./company-lab.types";
import styles from "./CompanyLab.module.css";

type Props = {
  products: BumiCoalProduct[];
};

function format(value: number | null, suffix = "") {
  if (value === null || value === undefined) {
    return "â€”";
  }

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value)}${suffix}`;
}

export default function CoalProducts({ products }: Props) {
  const usable = products.filter(
    (product) => product.calorificMax !== null,
  );

  const maxCalorific = Math.max(
    ...usable.map((product) => product.calorificMax ?? 0),
    1,
  );

  const highest = usable[0] ?? null;
  const lowest = usable[usable.length - 1] ?? null;

  return (
    <section className={styles.productSection}>
      <div className={styles.productHeader}>
        <div>
          <span>COAL PRODUCTS</span>
          <h2>What kind of coal does BUMI sell?</h2>
          <p>
            Compare product quality through calorific value,
            moisture, ash and sulphur.
          </p>
        </div>

        <div className={styles.productHeadline}>
          <span>{products.length}</span>
          <small>PRODUCT GRADES</small>
        </div>
      </div>

      {highest && lowest && (
        <div className={styles.productInsight}>
          <div>
            <span>HIGHEST CALORIFIC VALUE</span>
            <strong>{highest.name}</strong>
            <small>
              {format(highest.calorificMax, " kcal/kg")}
            </small>
          </div>

          <div>
            <span>LOWEST CALORIFIC VALUE</span>
            <strong>{lowest.name}</strong>
            <small>
              {format(lowest.calorificMax, " kcal/kg")}
            </small>
          </div>
        </div>
      )}

      <div className={styles.productList}>
        {products.map((product) => {
          const width =
            product.calorificMax === null
              ? 0
              : (product.calorificMax / maxCalorific) * 100;

          return (
            <article
              key={product.name}
              className={styles.productRow}
            >
              <div className={styles.productName}>
                <strong>{product.name}</strong>
                <span>Thermal Coal</span>
              </div>

              <div className={styles.productCalorific}>
                <div className={styles.productCalorificMeta}>
                  <span>CALORIFIC VALUE</span>
                  <strong>
                    {format(
                      product.calorificMax,
                      " kcal/kg",
                    )}
                  </strong>
                </div>

                <div className={styles.productTrack}>
                  <div
                    className={styles.productFill}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>

              <div className={styles.productQuality}>
                <span>MOISTURE</span>
                <strong>
                  {format(product.moistureMax, "%")}
                </strong>
              </div>

              <div className={styles.productQuality}>
                <span>ASH</span>
                <strong>
                  {format(product.ashMax, "%")}
                </strong>
              </div>

              <div className={styles.productQuality}>
                <span>SULPHUR</span>
                <strong>
                  {format(product.sulphurMax, "%")}
                </strong>
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.productNote}>
        Quality values are shown only where they are reported in
        the verified product dataset. Missing attributes are not
        estimated.
      </div>
    </section>
  );
}
