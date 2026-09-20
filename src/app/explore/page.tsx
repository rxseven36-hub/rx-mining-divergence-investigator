import { MobileNav } from "@/components/rxmdi/MobileNav";
import { ProductHeader } from "@/components/rxmdi/ProductHeader";
import { ExploreClient } from "./ExploreClient";
import styles from "./explore.module.css";

export default function ExplorePage() {
  return (
    <main className="rxn-app">
      <ProductHeader />

      <section className={styles.page}>
        <header className={styles.hero}>
          <span>EXPLORE</span>
          <h1>
            Discover the mining universe.
            <br />
            <em>Find what matters.</em>
          </h1>
          <p>
            Screen and compare Indonesian mining companies by operations, financials,
            resources, products, markets, and geography.
          </p>
        </header>

        <ExploreClient />
      </section>

      <MobileNav />
    </main>
  );
}
