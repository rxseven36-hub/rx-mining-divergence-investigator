"use client";

import Link from "next/link";

const trustItems = [
  { title: "Real Data", subtitle: "Powered by Sectors", icon: "\u25c9" },
  { title: "Deterministic Analysis", subtitle: "No AI hallucination", icon: "\u2726" },
  { title: "Traceable Evidence", subtitle: "See the source", icon: "\u25c7" },
  { title: "Built for Real Users", subtitle: "Analyst. Investor. Everyone.", icon: "\u2726" },
];

export function MiningHero() {
  return (
    <section className="rxlock-hero" aria-label="RX MDI introduction">
      <div className="rxlock-shade" />
      <div className="rxlock-copy">
        <h1>Indonesian<br />Mining Intelligence,<br /><span>in One Place.</span></h1>
        <p className="rxlock-subtitle">Know what happened. Discover what doesn&apos;t add up.</p>
        <div className="rxlock-topics" aria-label="RX MDI topics">
          <span>Market</span><i>{"\u2022"}</i><span>Companies</span><i>{"\u2022"}</i><span>News</span><i>{"\u2022"}</i><span>Financials</span><i>{"\u2022"}</i><span>Peers</span><i>{"\u2022"}</i><span>Intelligence</span>
        </div>
        <div className="rxlock-actions"><Link href="/today" className="rxlock-primary"><span>{"\u2315"}</span>Explore Today<b>{"\u2192"}</b></Link></div>
      </div>
      <div className="rxlock-quote"><blockquote>&ldquo;From data to deeper understanding.&rdquo;</blockquote><small>RXseven</small></div>
      <aside className="rxlock-trust" aria-label="RX MDI trust principles">
        {trustItems.map((item) => <div key={item.title} className="rxlock-trust-item"><div className="rxlock-trust-icon" aria-hidden="true">{item.icon}</div><div><strong>{item.title}</strong><span>{item.subtitle}</span></div></div>)}
      </aside>
      <div className="rxlock-tagline">Indonesia&apos;s Resources<br />A Brighter Tomorrow</div>
    </section>
  );
}
