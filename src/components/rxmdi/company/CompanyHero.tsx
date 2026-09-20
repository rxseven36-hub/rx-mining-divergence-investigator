import type { Company360 } from "@/lib/rxmdi/company-types";

export function CompanyHero({ company }: { company: Company360 }) {
  return (
    <section className="rxc-company-hero">
      <div className="rxc-company-kicker">
        COMPANY INTELLIGENCE
      </div>

      <div className="rxc-company-title-row">
        <div>
          <div className="rxc-company-symbol">{company.symbol}</div>
          <h1>{company.name}</h1>

          <div className="rxc-company-tags">
            <span>{company.industry}</span>
            <span>{company.sector}</span>
            <span>{company.commodity}</span>
            <span>{company.board}</span>
          </div>
        </div>

        <div className="rxc-market-glance">
          <div>
            <span>LATEST CLOSE</span>
            <strong>{company.price.value}</strong>
            <small>As of {company.price.asOf}</small>
          </div>

          <div>
            <span>MARKET CAP</span>
            <strong>{company.marketCap.value}</strong>
            <small>As of {company.marketCap.asOf}</small>
          </div>
        </div>
      </div>

      <p className="rxc-company-description">
        {company.description}
      </p>

      <nav className="rxc-company-nav" aria-label="Company sections">
        <a href="#overview">Overview</a>
        <a href="#mining">Mining</a>
        <a href="#financial">Financial</a>
        <a href="#ownership">Ownership</a>
        <a href="#market">Market</a>
        <a href="#timeline">Timeline</a>
        <a href="#compare">Compare</a>
      </nav>
    </section>
  );
}
