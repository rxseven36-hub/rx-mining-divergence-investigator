import Link from "next/link";

const trustItems = [
  {
    title: "Real Data",
    subtitle: "Powered by Sectors",
    icon: "◉",
  },
  {
    title: "Deterministic Analysis",
    subtitle: "No AI hallucination",
    icon: "✦",
  },
  {
    title: "Traceable Evidence",
    subtitle: "See the source",
    icon: "◇",
  },
  {
    title: "Built for Real Users",
    subtitle: "Analyst. Investor. Everyone.",
    icon: "✦",
  },
] as const;

export function MiningHero() {
  return (
    <section className="rxlock-hero" aria-label="RX MDI introduction">
      <div className="rxlock-shade" />

      <div className="rxlock-copy">
        <h1>
          Indonesian
          <br />
          Mining Intelligence,
          <br />
          <span>in One Place.</span>
        </h1>

        <p className="rxlock-subtitle">
          Know what happened. Discover what doesn&apos;t add up.
        </p>

        <div className="rxlock-topics" aria-label="RX MDI topics">
          <span>Market</span>
          <i>•</i>
          <span>Companies</span>
          <i>•</i>
          <span>News</span>
          <i>•</i>
          <span>Financials</span>
          <i>•</i>
          <span>Peers</span>
          <i>•</i>
          <span>Intelligence</span>
        </div>

        <div className="rxlock-actions">
          <Link
            href="/today"
            className="rxlock-primary rxmdi-explore-primary"
          >
            <span>⌕</span>
            Explore Today
            <b>→</b>
          </Link>
        </div>
      </div>

      <div className="rxlock-quote">
        <blockquote>“From data to deeper understanding.”</blockquote>
        <small>RXseven</small>
      </div>

      <aside className="rxlock-trust" aria-label="RX MDI trust principles">
        {trustItems.map((item) => (
          <div key={item.title} className="rxlock-trust-item">
            <div className="rxlock-trust-icon" aria-hidden="true">
              {item.icon}
            </div>
            <div>
              <strong>{item.title}</strong>
              <span>{item.subtitle}</span>
            </div>
          </div>
        ))}
      </aside>

      <div className="rxlock-tagline">
        Indonesia&apos;s Resources
        <br />
        A Brighter Tomorrow
      </div>
    </section>
  );
}
