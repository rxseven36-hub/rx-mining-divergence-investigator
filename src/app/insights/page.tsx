import { MobileNav } from "@/components/rxmdi/MobileNav";
import { ProductHeader } from "@/components/rxmdi/ProductHeader";
import { InsightsClient } from "./InsightsClient";
import styles from "./insights.module.css";

export default function InsightsPage() {
  return (
    <main className="rxn-app">
      <ProductHeader />

      <section className={styles.page}>
        <header className={styles.hero}>
          <span>INSIGHTS</span>
          <h1>
            Find the pattern.
            <br />
            <em>Understand what it means.</em>
          </h1>
          <p>
            RX MDI turns verified mining data into cross-company patterns, rankings,
            anomalies, and divergence signals before deeper investigation.
          </p>
        </header>

        <InsightsClient />
      </section>

      <MobileNav />
    </main>
  );
}
