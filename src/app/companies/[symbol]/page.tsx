import { notFound } from "next/navigation";

import { MobileNav } from "@/components/rxmdi/MobileNav";
import { ProductHeader } from "@/components/rxmdi/ProductHeader";
import { CompanyEssentials } from "@/components/rxmdi/company/CompanyEssentials";
import { CompanyHero } from "@/components/rxmdi/company/CompanyHero";
import { MineToMarket } from "@/components/rxmdi/company/MineToMarket";
import { MarketActivity } from "@/components/rxmdi/company/MarketActivity";
import { CompanyTimeline } from "@/components/rxmdi/company/CompanyTimeline";
import { PeerComparison } from "@/components/rxmdi/company/PeerComparison";
import { goldenCompanies } from "@/lib/rxmdi/golden-companies";

type CompanyPageProps = {
  params: Promise<{
    symbol: string;
  }>;
};

export default async function CompanyPage({
  params,
}: CompanyPageProps) {
  const { symbol } = await params;
  const normalizedSymbol = symbol.toUpperCase();
  const company = goldenCompanies[normalizedSymbol];

  if (!company) {
    notFound();
  }

  return (
    <main className="rxp-app rxc-app">
      <ProductHeader />

      <div className="rxc-page">
        <CompanyHero company={company} />

        <section id="overview" className="rxc-section rxc-overview">
          <div className="rxc-section-head">
            <div>
              <span>UNDERSTAND THE COMPANY</span>
              <h2>{company.symbol} at a glance.</h2>
            </div>

            <p>
              Start with the business. Then move through mining,
              markets, money and ownership without losing the source period.
            </p>
          </div>

          <div className="rxc-overview-grid">
            <article>
              <span>BUSINESS</span>
              <strong>{company.industry}</strong>
              <small>{company.sector}</small>
            </article>

            <article>
              <span>COMMODITY</span>
              <strong>{company.commodity}</strong>
              <small>Mining profile</small>
            </article>

            <article>
              <span>PRODUCTION</span>
              <strong>{company.operation.production.value}</strong>
              <small>{company.operation.production.period}</small>
            </article>

            <article>
              <span>SALES</span>
              <strong>{company.operation.sales.value}</strong>
              <small>{company.operation.sales.period}</small>
            </article>
          </div>
        </section>

        <MineToMarket company={company} />

        <CompanyEssentials company={company} />

        <MarketActivity symbol={company.symbol} />

        <CompanyTimeline symbol={company.symbol} />

        <PeerComparison symbol={company.symbol} />

        <footer className="rxp-footer">
          <div>
            <strong>RX MDI</strong>
            <span>Mining Intelligence, connected.</span>
          </div>

          <p>
            Information and analytical context only. Not investment advice.
          </p>
        </footer>
      </div>

      <MobileNav />
    </main>
  );
}



