import Link from "next/link";

import { MiningHero } from "@/components/rxmdi/MiningHero";
import { MobileNav } from "@/components/rxmdi/MobileNav";
import { ProductHeader } from "@/components/rxmdi/ProductHeader";

const marketRows = [
  { name: "IDX Mining", status: "Live", direction: "up", href: "/today?focus=idx-mining" },
  { name: "Coal", status: "Tracked", direction: "up", href: "/today?focus=coal" },
  { name: "Nickel", status: "Tracked", direction: "down", href: "/today?focus=nickel" },
  { name: "Gold", status: "Tracked", direction: "up", href: "/today?focus=gold" },
  { name: "CPO", status: "Tracked", direction: "down", href: "/today?focus=cpo" },
] as const;

const moverRows = [
  { ticker: "ADRO", context: "Mining", direction: "up", href: "/companies/ADRO" },
  { ticker: "ITMG", context: "Mining", direction: "up", href: "/companies/ITMG" },
  { ticker: "AMMN", context: "Mining", direction: "up", href: "/companies/AMMN" },
  { ticker: "PTBA", context: "Mining", direction: "up", href: "/companies/PTBA" },
  { ticker: "ANTM", context: "Mining", direction: "down", href: "/companies/ANTM" },
] as const;

const newsRows = [
  { time: "16:20", headline: "Mining company developments and operational updates", href: "/today?section=news" },
  { time: "14:05", headline: "Commodity and market context across Indonesian mining", href: "/today?section=news" },
  { time: "11:32", headline: "Company activity and relevant industry developments", href: "/today?section=news" },
  { time: "09:17", headline: "Policy, downstreaming, and strategic mining context", href: "/today?section=news" },
] as const;

export default function Home() {
  return (
    <main className="rxn-app">
      <ProductHeader />

      <div className="rxn-page">
        <MiningHero />

        <section className="rxn-divergence">
          <div className="rxn-divergence-main">
            <div className="rxn-intelligence-label">
              <span>⚡</span>
              INTELLIGENCE HEADLINE
            </div>

            <div className="rxn-divergence-heading">
              <h2>Observed Divergence</h2>
              <span>INVESTIGATION READY</span>
            </div>

            <h3>
              Production and sales do not always move together.
            </h3>

            <p>
              RX MDI turns an observed gap into an evidence-backed
              investigation with deterministic analysis and traceable
              supporting evidence.
            </p>

            <Link href="/investigations" className="rxn-investigate-button">
              <span className="rxn-search-icon" aria-hidden="true" />
              Investigate Divergence
              <strong>→</strong>
            </Link>
          </div>

          <div className="rxn-divergence-metrics">
            <article>
              <span>Production</span>
              <strong>Verified</strong>
              <small>Sectors evidence</small>
              <div className="rxn-spark positive"><i /></div>
            </article>

            <article>
              <span>Sales</span>
              <strong>Verified</strong>
              <small>Sectors evidence</small>
              <div className="rxn-spark warning"><i /></div>
            </article>

            <article>
              <span>Observed Gap</span>
              <strong>Live</strong>
              <small>Computed deterministically</small>
              <div className="rxn-spark negative"><i /></div>
            </article>
          </div>

          <div className="rxn-divergence-meta">
            <span>◉ High-priority investigation path</span>
            <span>◎ Peer-aware intelligence</span>
            <span>▣ Evidence available</span>
          </div>

          <aside className="rxn-divergence-image">
            <div>
              <em>
                “Numbers tell a story.
                <strong> Divergence helps you find the real one.</strong>”
              </em>
              <span>RX MDI</span>
            </div>
          </aside>
        </section>

        <section className="rxn-dashboard-grid">
          <article className="rxn-panel rxn-panel-live">
            <header>
              <div>
                <span className="rxn-panel-icon">↗</span>
                <strong>Market Overview</strong>
              </div>
              <Link href="/today" className="rxn-see-more">
                See more <span>→</span>
              </Link>
            </header>

            <div className="rxn-list">
              {marketRows.map((item) => (
                <Link key={item.name} href={item.href} className="rxn-click-row">
                  <span>{item.name}</span>
                  <strong>{item.status}</strong>
                  <i className={item.direction === "down" ? "down" : ""}>
                    {item.direction === "down" ? "↘" : "↗"}
                  </i>
                </Link>
              ))}
            </div>
          </article>

          <article className="rxn-panel rxn-panel-live">
            <header>
              <div>
                <span className="rxn-panel-icon">↕</span>
                <strong>Top Movers (Mining)</strong>
              </div>
              <Link href="/companies" className="rxn-see-more">
                See more <span>→</span>
              </Link>
            </header>

            <div className="rxn-list">
              {moverRows.map((item) => (
                <Link key={item.ticker} href={item.href} className="rxn-click-row">
                  <span className="rxn-row-primary">{item.ticker}</span>
                  <strong>{item.context}</strong>
                  <i className={item.direction === "down" ? "down" : ""}>
                    {item.direction === "down" ? "↘" : "↗"}
                  </i>
                </Link>
              ))}
            </div>
          </article>

          <article className="rxn-panel rxn-panel-live">
            <header>
              <div>
                <span className="rxn-panel-icon">▤</span>
                <strong>Latest News</strong>
              </div>
              <Link href="/today?section=news" className="rxn-see-more">
                See more <span>→</span>
              </Link>
            </header>

            <div className="rxn-news-list">
              {newsRows.map((item) => (
                <Link key={`${item.time}-${item.headline}`} href={item.href} className="rxn-news-row">
                  <time>{item.time}</time>
                  <span>{item.headline}</span>
                  <b aria-hidden="true">→</b>
                </Link>
              ))}
            </div>
          </article>

          <article className="rxn-panel rxn-panel-live">
            <header>
              <div>
                <span className="rxn-panel-icon">◎</span>
                <strong>Intelligence Signals</strong>
              </div>
              <Link href="/investigations" className="rxn-see-more">
                See more <span>→</span>
              </Link>
            </header>

            <div className="rxn-signal-list">
              <Link href="/investigations" className="rxn-signal-row">
                <b className="red">1</b>
                <span>
                  <strong>Divergence Detected</strong>
                  <small>Open live investigation</small>
                </span>
                <i>→</i>
              </Link>

              <Link href="/investigations" className="rxn-signal-row">
                <b className="amber">↔</b>
                <span>
                  <strong>Peer Comparison</strong>
                  <small>Explore deterministic context</small>
                </span>
                <i>→</i>
              </Link>

              <Link href="/investigations" className="rxn-signal-row">
                <b className="blue">✓</b>
                <span>
                  <strong>Evidence Chain</strong>
                  <small>Inspect traceable source facts</small>
                </span>
                <i>→</i>
              </Link>

              <Link href="/investigations" className="rxn-signal-row">
                <b>5</b>
                <span>
                  <strong>Live Investigation Set</strong>
                  <small>Open validated company coverage</small>
                </span>
                <i>→</i>
              </Link>
            </div>
          </article>
        </section>

        <footer className="rxn-footer">
          <div>
            <strong>RX<span>seven</span></strong>
            <p>“Dari masalah nyata menjadi solusi nyata.”</p>
          </div>

          <nav>
            <Link href="/companies">Companies</Link>
            <Link href="/investigations">Methods</Link>
            <span>Data Source</span>
            <span>Disclaimer</span>
          </nav>
        </footer>
      </div>

      <MobileNav />
    </main>
  );
}
