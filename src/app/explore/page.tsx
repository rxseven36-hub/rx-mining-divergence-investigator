import { MobileNav } from "@/components/rxmdi/MobileNav";
import { ProductHeader } from "@/components/rxmdi/ProductHeader";
import { ExploreClient } from "./ExploreClient";
import styles from "./explore.module.css";

type ExplorePageProps = {
  searchParams: Promise<{
    view?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const initialView = firstValue(params.view) === "map" ? "map" : "discovery";

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

        <ExploreClient initialView={initialView} />
      </section>

      <MobileNav />
    </main>
  );
}
