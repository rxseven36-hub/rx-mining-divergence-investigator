import { marketSnapshots } from "@/lib/rxmdi/market-snapshots";

export function MarketActivity({ symbol }: { symbol: string }) {
  const snapshot = marketSnapshots[symbol];

  if (!snapshot) {
    return (
      <section id="market" className="rxc-section">
        <div className="rxc-section-head">
          <div>
            <span>MARKET ACTIVITY</span>
            <h2>Market data is not available yet.</h2>
          </div>

          <p>
            RX MDI does not invent missing market information.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="market" className="rxc-section rxc-market-section">
      <div className="rxc-section-head">
        <div>
          <span>MARKET ACTIVITY</span>
          <h2>How is the market treating {snapshot.symbol}?</h2>
        </div>

        <p>
          Price, volume, foreign flow and broker activity are shown as
          market context. Activity occurring together does not establish
          that one caused another.
        </p>
      </div>

      <div className="rxc-market-period">
        <span>
          MARKET WINDOW
        </span>

        <strong>
          {snapshot.period.start} - {snapshot.period.end}
        </strong>

        <small>
          {snapshot.period.tradingDays} trading days
        </small>
      </div>

      <div className="rxc-market-kpis">
        <article>
          <span>PRICE MOVE</span>

          <strong className="rxc-positive">
            {snapshot.price.change}
          </strong>

          <p>
            {snapshot.price.start} to {snapshot.price.latest}
          </p>

          <small>
            Latest: {snapshot.price.latestAsOf}
          </small>
        </article>

        <article>
          <span>AVERAGE VOLUME</span>

          <strong>
            {snapshot.volume.average}
          </strong>

          <p>shares / trading day</p>

          <small>
            Peak {snapshot.volume.peak} on {snapshot.volume.peakDate}
          </small>
        </article>

        <article>
          <span>NET FOREIGN FLOW</span>

          <strong className="rxc-positive">
            {snapshot.foreignFlow.net}
          </strong>

          <p>
            {snapshot.foreignFlow.positiveDays} net-buy days ·{" "}
            {snapshot.foreignFlow.negativeDays} net-sell days
          </p>

          <small>
            Same market window
          </small>
        </article>
      </div>

      <div className="rxc-market-detail-grid">
        <div className="rxc-panel rxc-foreign-panel">
          <div className="rxc-panel-label">
            FOREIGN FLOW EXTREMES
          </div>

          <div className="rxc-flow-extreme">
            <div>
              <span>Largest daily net buy</span>

              <strong className="rxc-positive">
                {snapshot.foreignFlow.largestBuy}
              </strong>

              <small>
                {snapshot.foreignFlow.largestBuyDate}
              </small>
            </div>

            <div>
              <span>Largest daily net sell</span>

              <strong className="rxc-negative">
                {snapshot.foreignFlow.largestSell}
              </strong>

              <small>
                {snapshot.foreignFlow.largestSellDate}
              </small>
            </div>
          </div>
        </div>

        <div className="rxc-panel">
          <div className="rxc-broker-heading">
            <div>
              <div className="rxc-panel-label">
                BROKER ACTIVITY
              </div>

              <small>
                {snapshot.brokerWindow.start} - {snapshot.brokerWindow.end}
              </small>
            </div>
          </div>

          <div className="rxc-broker-grid">
            <div>
              <h3>Top net buyers</h3>

              {snapshot.buyers.map((broker, index) => (
                <div
                  key={broker.code}
                  className="rxc-broker-row"
                >
                  <span>
                    <small>{String(index + 1).padStart(2, "0")}</small>
                    {broker.code}
                  </span>

                  <strong className="rxc-positive">
                    {broker.net}
                  </strong>
                </div>
              ))}
            </div>

            <div>
              <h3>Top net sellers</h3>

              {snapshot.sellers.map((broker, index) => (
                <div
                  key={broker.code}
                  className="rxc-broker-row"
                >
                  <span>
                    <small>{String(index + 1).padStart(2, "0")}</small>
                    {broker.code}
                  </span>

                  <strong className="rxc-negative">
                    {broker.net}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rxc-market-guardrail">
        <span>CONTEXT, NOT CAUSALITY</span>

        <p>
          BUMI&apos;s price rose during this period while net foreign flow was
          positive. RX MDI presents those facts together as context and
          does not claim that foreign buying caused the price move.
        </p>
      </div>
    </section>
  );
}

