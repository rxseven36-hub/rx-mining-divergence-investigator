import {
  comparisonSnapshots,
  goldenComparisonSymbols,
  type ComparisonCompany,
  type ComparisonMetric,
} from "@/lib/rxmdi/comparison-snapshots";

type PeerComparisonProps = {
  symbol: string;
};

type MetricKey =
  | "production"
  | "sales"
  | "reserves"
  | "resources"
  | "revenue"
  | "netProfit"
  | "netMargin"
  | "priceMove"
  | "foreignFlow";

type MetricDefinition = {
  label: string;
  key: MetricKey;
};

const metrics: MetricDefinition[] = [
  { label: "Production", key: "production" },
  { label: "Sales", key: "sales" },
  { label: "Reserves", key: "reserves" },
  { label: "Resources", key: "resources" },
  { label: "Revenue", key: "revenue" },
  { label: "Net profit", key: "netProfit" },
  { label: "Net margin", key: "netMargin" },
  { label: "Recent price move", key: "priceMove" },
  { label: "Net foreign flow", key: "foreignFlow" },
];

function MetricValue({ metric }: { metric: ComparisonMetric }) {
  return (
    <div className="rxc-compare-value">
      <strong>{metric.value}</strong>
      <small>{metric.period}</small>
    </div>
  );
}

function CompanyHeading({ company }: { company: ComparisonCompany }) {
  return (
    <div className="rxc-compare-company">
      <strong>{company.symbol}</strong>
      <span>{company.name}</span>
      <small>{company.commodity}</small>
    </div>
  );
}

export function PeerComparison({ symbol }: PeerComparisonProps) {
  const normalizedSymbol = symbol.toUpperCase();

  const companies = goldenComparisonSymbols.map(
    (companySymbol) => comparisonSnapshots[companySymbol],
  );

  if (!comparisonSnapshots[normalizedSymbol]) {
    return null;
  }

  return (
    <section id="compare" className="rxc-section rxc-compare">
      <div className="rxc-section-head">
        <div>
          <span>COMPARE</span>
          <h2>Put {normalizedSymbol} beside its peers.</h2>
        </div>

        <p>
          Compare operating scale, financial performance and recent market
          context without hiding differences in reporting periods.
        </p>
      </div>

      <div className="rxc-compare-table" role="table">
        <div className="rxc-compare-row rxc-compare-head" role="row">
          <div className="rxc-compare-label" role="columnheader">
            COMPANY
          </div>

          {companies.map((company) => (
            <div role="columnheader" key={company.symbol}>
              <CompanyHeading company={company} />
            </div>
          ))}
        </div>

        {metrics.map((definition) => (
          <div className="rxc-compare-row" role="row" key={definition.key}>
            <div className="rxc-compare-label" role="rowheader">
              {definition.label}
            </div>

            {companies.map((company) => (
              <div role="cell" key={company.symbol}>
                <MetricValue metric={company[definition.key]} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="rxc-compare-read">
        <article>
          <span>OPERATING SCALE</span>
          <strong>BUMI leads this three-company set in 2024 production.</strong>
          <p>
            BUMI reported 74.7 Mt of production, compared with 50.5 Mt for
            BYAN and 20.2 Mt for ITMG.
          </p>
        </article>

        <article>
          <span>FINANCIAL PROFILE</span>
          <strong>BYAN converts a smaller production base into higher profit.</strong>
          <p>
            BYAN reported US$943M of 2024 net profit and a derived 27.4% net
            margin, versus BUMI&apos;s US$90M and 6.6%.
          </p>
        </article>

        <article>
          <span>MARKET CONTEXT</span>
          <strong>The recent market signals do not move in one direction.</strong>
          <p>
            All three stocks rose in the selected market window, while BUMI
            recorded positive net foreign flow and BYAN and ITMG recorded
            negative net foreign flow. This is context, not proof of causality.
          </p>
        </article>
      </div>

      <div className="rxc-compare-note">
        <strong>PERIOD MATTERS</strong>
        <p>
          Operational and financial metrics shown here use 2024 reporting
          periods. BYAN resources and reserves are measured in 2022, while
          BUMI and ITMG use 2024 measurements. Market metrics use the same
          12 Aug - 10 Sep 2026 observation window.
        </p>
      </div>
    </section>
  );
}
