"use client";

import Link from "next/link";
import { MobileNav } from "@/components/rxmdi/MobileNav";
import { ProductHeader } from "@/components/rxmdi/ProductHeader";
import type { CompanyProfile } from "@/lib/rxmdi-company-profiles";

export function CompanyProfilePage({ company }: { company: CompanyProfile }) {
  return (
    <main className="rxn-app">
      <ProductHeader />

      <div className="rxcp-page">
        <Link className="rxcp-back" href="/companies">
          Back
        </Link>

        <section className="rxcp-hero">
          <div className="rxcp-brand">
            <div className="rxcp-logo-wrap">
              <img src={company.logo} alt={`${company.shortName} logo`} />
            </div>

            <div>
              <span className="rxcp-kicker">{company.category}</span>
              <h1>{company.ticker}</h1>
              <h2>{company.name}</h2>
              <p>{company.listing}</p>
            </div>
          </div>

          <div className="rxcp-state">
            <span>COMPANY INTELLIGENCE</span>
            <strong>PROFILE READY</strong>
          </div>
        </section>

        <section className="rxcp-layout">
          <div className="rxcp-main">
            <article className="rxcp-panel rxcp-overview">
              <div className="rxcp-section-head">
                <span>OVERVIEW</span>
                <strong>Company context</strong>
              </div>
              <p>{company.summary}</p>
            </article>

            <article className="rxcp-panel">
              <div className="rxcp-section-head">
                <span>BUSINESS</span>
                <strong>What the company does</strong>
              </div>

              <div className="rxcp-business-grid">
                {company.business.map((item) => (
                  <div key={item} className="rxcp-business-item">
                    <i />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rxcp-panel">
              <div className="rxcp-section-head">
                <span>INTELLIGENCE PATH</span>
                <strong>Go deeper when verified data is available</strong>
              </div>

              <div className="rxcp-path">
                <span>Company</span>
                <span>Performance</span>
                <span>Peers</span>
                <span>Divergence</span>
                <span>Investigation</span>
                <span>Evidence</span>
              </div>

              <p className="rxcp-muted">
                Financial, production, valuation, license, reserves, products,
                news, and divergence metrics will only appear when the RX MDI
                data pipeline has verified evidence for this company.
              </p>
            </article>
          </div>

          <aside className="rxcp-side">
            <article className="rxcp-panel">
              <div className="rxcp-section-head">
                <span>VERIFIED PROFILE</span>
                <strong>Known identity</strong>
              </div>

              <div className="rxcp-facts">
                {company.verifiedFacts.map((fact) => (
                  <div key={fact.label}>
                    <span>{fact.label}</span>
                    <strong>{fact.value}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="rxcp-panel rxcp-source">
              <div className="rxcp-section-head">
                <span>PROVENANCE</span>
                <strong>Public source</strong>
              </div>

              <p>{company.sourceLabel}</p>
              <a href={company.sourceUrl} target="_blank" rel="noreferrer">
                Open official source
              </a>
            </article>

            <Link href="/investigations" className="rxcp-investigate">
              <span>RX MDI</span>
              <strong>Open Investigator</strong>
              <small>
                Investigation availability depends on verified live coverage.
              </small>
            </Link>
          </aside>
        </section>
      </div>

      <MobileNav />
    </main>
  );
}
