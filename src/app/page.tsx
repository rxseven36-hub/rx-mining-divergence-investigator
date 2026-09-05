const pipeline = [
  ["01", "Detect", "Material divergence identified"],
  ["02", "Prioritize", "Peer case selected"],
  ["03", "Investigate", "Sectors evidence collected"],
  ["04", "Evidence", "Canonical evidence bound"],
  ["05", "Synthesize", "Intelligence brief produced"],
] as const;

const evidence = [
  {
    label: "Company A",
    count: "03",
    title: "Operational evidence",
    description:
      "Production, sales, and historical operating context admitted from Sectors.",
  },
  {
    label: "Company B",
    count: "03",
    title: "Peer evidence",
    description:
      "Comparable peer observations preserved with canonical company identity.",
  },
  {
    label: "Shared",
    count: "02",
    title: "Market context",
    description:
      "Commodity and market evidence shared across the investigation.",
  },
] as const;

export default function Home() {
  return (
    <main className="rx-shell">
      <header className="rx-topbar">
        <div className="rx-brand">
          <span className="rx-brand-mark">RX</span>

          <div>
            <p className="rx-eyebrow">RXseven Intelligence</p>
            <p className="rx-brand-name">
              Mining Divergence Investigator
            </p>
          </div>
        </div>

        <div className="rx-topbar-status">
          <span className="rx-live-dot" />
          ENGINE READY
        </div>
      </header>

      <div className="rx-workspace">
        <section className="rx-hero">
          <div>
            <div className="rx-kicker-row">
              <span className="rx-kicker">SECTORS / MARKET INTELLIGENCE</span>
              <span className="rx-demo-badge">DEMO CASE</span>
            </div>

            <h1>
              Investigate the divergence.
              <span> Prove the intelligence.</span>
            </h1>

            <p className="rx-hero-copy">
              Evidence-first investigation for material mining
              divergences. Deterministic analysis establishes the
              facts. AI proposes explanations. RX challenges them
              against the evidence.
            </p>
          </div>

          <div className="rx-doctrine">
            <p>RX DOCTRINE</p>
            <strong>AI INTERPRETS.</strong>
            <strong> EVIDENCE DECIDES.</strong>
            <span>CAUSAL CONCLUSION REMAINS UNKNOWN</span>
          </div>
        </section>

        <section className="rx-case-grid">
          <article className="rx-company-card">
            <div className="rx-card-heading">
              <span>COMPANY A</span>
              <span className="rx-status-neutral">CANONICAL</span>
            </div>

            <h2>Mining Company Alpha</h2>

            <div className="rx-company-meta">
              <div>
                <span>COMMODITY</span>
                <strong>NICKEL</strong>
              </div>
              <div>
                <span>PERIOD</span>
                <strong>FY 2025</strong>
              </div>
            </div>
          </article>

          <article className="rx-divergence-card">
            <p>MATERIAL DIVERGENCE</p>
            <strong>DETECTED</strong>

            <div className="rx-divergence-line">
              <span />
              <i />
              <span />
            </div>

            <small>
              Investigation required before explanation
            </small>
          </article>

          <article className="rx-company-card">
            <div className="rx-card-heading">
              <span>COMPANY B</span>
              <span className="rx-status-neutral">CANONICAL</span>
            </div>

            <h2>Mining Company Beta</h2>

            <div className="rx-company-meta">
              <div>
                <span>COMMODITY</span>
                <strong>NICKEL</strong>
              </div>
              <div>
                <span>PERIOD</span>
                <strong>FY 2025</strong>
              </div>
            </div>
          </article>
        </section>

        <section className="rx-panel">
          <div className="rx-section-heading">
            <div>
              <p>INVESTIGATION PIPELINE</p>
              <h2>From signal to defensible intelligence</h2>
            </div>

            <span className="rx-complete-badge">
              COMPLETE
            </span>
          </div>

          <div className="rx-pipeline">
            {pipeline.map(([number, title, description]) => (
              <div className="rx-pipeline-step" key={number}>
                <div className="rx-step-number">{number}</div>

                <div>
                  <strong>{title}</strong>
                  <span>{description}</span>
                </div>

                <div className="rx-step-check">✓</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rx-panel">
          <div className="rx-section-heading">
            <div>
              <p>EVIDENCE LAYER</p>
              <h2>Every claim remains traceable</h2>
            </div>

            <span className="rx-evidence-count">
              08 ADMITTED ITEMS
            </span>
          </div>

          <div className="rx-evidence-grid">
            {evidence.map((item) => (
              <article className="rx-evidence-card" key={item.label}>
                <div className="rx-evidence-card-top">
                  <span>{item.label}</span>
                  <strong>{item.count}</strong>
                </div>

                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <div className="rx-source-row">
                  <span>SOURCE</span>
                  <strong>SECTORS</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rx-intelligence-grid">
          <article className="rx-panel rx-hypothesis">
            <div className="rx-section-heading compact">
              <div>
                <p>EVIDENCE-BOUNDED HYPOTHESIS</p>
                <h2>Proposed explanation</h2>
              </div>

              <span className="rx-ai-badge">AI</span>
            </div>

            <blockquote>
              The observed peer divergence may reflect differences
              in operational performance and market exposure during
              the investigated period.
            </blockquote>

            <div className="rx-two-column">
              <div>
                <span className="rx-mini-title">
                  SUPPORTING EVIDENCE
                </span>
                <p>
                  Operational and historical observations support
                  further investigation of the proposed explanation.
                </p>
              </div>

              <div>
                <span className="rx-mini-title">
                  COUNTER EVIDENCE
                </span>
                <p>
                  Shared market conditions prevent attribution to a
                  single operational factor.
                </p>
              </div>
            </div>
          </article>

          <article className="rx-panel rx-challenge">
            <div className="rx-section-heading compact">
              <div>
                <p>ADVERSARIAL CHALLENGE</p>
                <h2>What could make it wrong?</h2>
              </div>

              <span className="rx-challenge-badge">CHALLENGED</span>
            </div>

            <div className="rx-challenge-item">
              <span>01</span>
              <p>
                Evidence does not establish that operational
                differences caused the divergence.
              </p>
            </div>

            <div className="rx-challenge-item">
              <span>02</span>
              <p>
                Alternative market and timing effects remain
                plausible explanations.
              </p>
            </div>

            <div className="rx-challenge-item">
              <span>03</span>
              <p>
                Additional evidence is required before any causal
                conclusion.
              </p>
            </div>
          </article>
        </section>

        <section className="rx-brief">
          <div className="rx-brief-header">
            <div>
              <p>FINAL INTELLIGENCE BRIEF</p>
              <h2>Evidence before explanation.</h2>
            </div>

            <div className="rx-causal">
              <span>CAUSAL CONCLUSION</span>
              <strong>UNKNOWN</strong>
            </div>
          </div>

          <div className="rx-brief-body">
            <div className="rx-summary">
              <span className="rx-mini-title">
                EXECUTIVE SUMMARY
              </span>

              <p>
                RX identified a material peer divergence and
                completed an evidence-bounded investigation using
                canonical Sectors evidence. The available evidence
                supports a plausible operational explanation, but
                competing explanations and unresolved uncertainties
                remain. No causal relationship is established.
              </p>
            </div>

            <div className="rx-brief-columns">
              <div>
                <span className="rx-mini-title">
                  ALTERNATIVE EXPLANATIONS
                </span>
                <p>Commodity market conditions</p>
                <p>Reporting-period timing differences</p>
              </div>

              <div>
                <span className="rx-mini-title">
                  UNCERTAINTIES
                </span>
                <p>Incomplete explanatory evidence</p>
                <p>Cross-company operational differences</p>
              </div>

              <div>
                <span className="rx-mini-title">
                  UNRESOLVED
                </span>
                <p>Causal mechanism</p>
                <p>Relative contribution of each factor</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="rx-footer">
          <span>RXseven / RX Mining Divergence Investigator</span>
          <span>
            DETECT → PRIORITIZE → INVESTIGATE → EVIDENCE → INTELLIGENCE
          </span>
        </footer>
      </div>
    </main>
  );
}
