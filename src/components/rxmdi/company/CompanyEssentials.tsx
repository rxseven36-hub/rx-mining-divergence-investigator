import type { Company360 } from "@/lib/rxmdi/company-types";

export function CompanyEssentials({ company }: { company: Company360 }) {
  return (
    <>
      <section id="financial" className="rxc-section">
        <div className="rxc-section-head">
          <div>
            <span>FINANCIAL</span>
            <h2>How much money does it make?</h2>
          </div>

          <p>
            Financial values retain their reporting period instead of being
            presented as if every metric were updated at the same time.
          </p>
        </div>

        <div className="rxc-financial-grid">
          {Object.values(company.financial).map((metric) => (
            <article key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.period}</small>
            </article>
          ))}
        </div>
      </section>

      <section id="ownership" className="rxc-section">
        <div className="rxc-section-head">
          <div>
            <span>OWNERSHIP</span>
            <h2>Who owns and controls the network?</h2>
          </div>

          <p>
            Shareholders and corporate subsidiaries are shown separately.
            They describe different relationships.
          </p>
        </div>

        <div className="rxc-ownership-grid">
          <div className="rxc-panel">
            <div className="rxc-panel-label">SHAREHOLDERS</div>

            {company.ownership.shareholders.map((item) => (
              <div className="rxc-owner-row" key={item.name}>
                <span>{item.name}</span>
                <strong>{item.stake}</strong>
              </div>
            ))}
          </div>

          <div className="rxc-panel">
            <div className="rxc-panel-label">CORPORATE NETWORK</div>

            {company.ownership.subsidiaries.map((item) => (
              <div className="rxc-owner-row" key={item.name}>
                <span>{item.name}</span>
                <strong>{item.stake}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
