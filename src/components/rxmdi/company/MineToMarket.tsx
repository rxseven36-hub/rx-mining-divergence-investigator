import type { Company360 } from "@/lib/rxmdi/company-types";

export function MineToMarket({ company }: { company: Company360 }) {
  const stages = [
    {
      number: "01",
      label: "COMMODITY",
      value: company.commodity,
      note: "What the business produces",
    },
    {
      number: "02",
      label: "PRODUCTION",
      value: company.operation.production.value,
      note: company.operation.production.period ?? "",
    },
    {
      number: "03",
      label: "SALES",
      value: company.operation.sales.value,
      note: company.operation.sales.period ?? "",
    },
    {
      number: "04",
      label: "MARKETS",
      value: "14 destinations",
      note: "Available 2024 destination data",
    },
    {
      number: "05",
      label: "REVENUE",
      value: company.financial.revenue.value,
      note: company.financial.revenue.period ?? "",
    },
  ];

  return (
    <section id="mining" className="rxc-section">
      <div className="rxc-section-head">
        <div>
          <span>FROM MINE TO MARKET</span>
          <h2>See how the business moves.</h2>
        </div>

        <p>
          Production, sales and financial results are related parts of the
          business story, but they are not treated as automatic causal links.
        </p>
      </div>

      <div className="rxc-journey">
        {stages.map((stage) => (
          <article key={stage.number}>
            <span>{stage.number}</span>
            <small>{stage.label}</small>
            <strong>{stage.value}</strong>
            <p>{stage.note}</p>
          </article>
        ))}
      </div>

      <div className="rxc-mining-grid">
        <div className="rxc-panel">
          <div className="rxc-panel-label">OPERATION SCALE</div>

          <div className="rxc-metric-grid">
            {[
              company.operation.production,
              company.operation.sales,
              company.operation.reserves,
              company.operation.resources,
            ].map((metric) => (
              <div key={metric.label} className="rxc-metric">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.period}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="rxc-panel">
          <div className="rxc-panel-label">WHERE THE COAL GOES</div>

          <div className="rxc-destinations">
            {company.destinations.map((destination) => (
              <div key={destination.country}>
                <span>{destination.country}</span>
                <strong>{destination.volume}</strong>
              </div>
            ))}
          </div>

          <p className="rxc-source-note">
            Largest available destination volumes shown. Period: 2024.
          </p>
        </div>
      </div>
    </section>
  );
}
