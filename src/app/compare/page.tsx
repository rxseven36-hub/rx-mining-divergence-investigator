import { MobileNav } from "@/components/rxmdi/MobileNav";
import { ProductHeader } from "@/components/rxmdi/ProductHeader";
import { goldenComparisonSymbols } from "@/lib/rxmdi/comparison-snapshots";
import { CompareClient } from "./CompareClient";
import styles from "./compare.module.css";

type ComparePageProps = {
  searchParams: Promise<{
    companies?: string | string[];
  }>;
};

const supported = [...goldenComparisonSymbols];

function resolveInitialCompanies(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value.join(",") : value ?? "";
  const requested = raw
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(
      (symbol, index, values) =>
        supported.includes(symbol as (typeof supported)[number]) &&
        values.indexOf(symbol) === index,
    );

  return requested.length >= 2 ? requested : ["BUMI", "BYAN"];
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const initialCompanies = resolveInitialCompanies(params.companies);

  return (
    <main className="rxn-app">
      <ProductHeader />
      <section className={styles.page}>
        <header className={styles.hero}>
          <span>COMPARE</span>
          <h1>Put reported mining observations side by side.</h1>
          <p>
            Compare supported RX MDI company snapshots without ranking companies,
            hiding reporting periods, or inferring causality.
          </p>
        </header>
        <CompareClient initialCompanies={initialCompanies} />
      </section>
      <MobileNav />
    </main>
  );
}
