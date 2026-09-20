"use client";

import Link from "next/link";
import { MobileNav } from "@/components/rxmdi/MobileNav";
import { ProductHeader } from "@/components/rxmdi/ProductHeader";
import { bumiGoldenData as d } from "@/lib/rxmdi-bumi-golden";

function moneyUsd(value: number) {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  return `$${(value / 1_000_000).toFixed(0)}M`;
}

function moneyIdr(value: number) {
  return `Rp${(value / 1_000_000_000_000).toFixed(1)}T`;
}

function pct(value: number) {
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(2)}%`;
}

const maxDestination = Math.max(...d.destinations2024.map((x) => x.volume));
const maxPeer = Math.max(...d.peers2025.map((x) => x.marketCapIdr));

export function BumiGoldenCompanyPage() {
  return (
    <main className="rxn-app">
      <ProductHeader />

      <div className="rxg-page">
        <Link className="rxcp-back" href="/companies">Back</Link>

        <section className="rxg-hero">
          <div className="rxg-brand">
            <div className="rxg-logo">
              <img src={d.identity.logo} alt="Bumi Resources logo" />
            </div>
            <div>
              <span className="rxg-kicker">{d.identity.category}</span>
              <div className="rxg-title-row">
                <h1>{d.identity.ticker}</h1>
                <span className="rxg-live">SECTORS DATA</span>
              </div>
              <h2>{d.identity.name}</h2>
              <p>{d.identity.listing} · {d.identity.symbol}</p>
            </div>
          </div>

          <div className="rxg-coverage">
            <span>DATA COVERAGE</span>
            <strong>GOLDEN PROFILE</strong>
            <div>
              <i>Market ✓</i><i>Financials ✓</i><i>Operations ✓</i>
              <i>License ✓</i><i>Products ✓</i><i>Peers ✓</i>
            </div>
          </div>
        </section>

        <section className="rxg-snapshot">
          <div><span>LAST CLOSE</span><strong>Rp{d.identity.latestClose}</strong><small>{d.identity.latestCloseDate}</small></div>
          <div><span>DAILY MOVE</span><strong className={d.identity.dailyChange < 0 ? "rxg-down" : "rxg-up"}>{pct(d.identity.dailyChange)}</strong><small>latest close change</small></div>
          <div><span>MARKET CAP</span><strong>{moneyIdr(d.identity.marketCapIdr)}</strong><small>rank #{d.identity.marketCapRank}</small></div>
          <div><span>PRODUCTION 2024</span><strong>{d.operations2024.productionMt} Mt</strong><small>thermal coal</small></div>
          <div><span>SALES 2024</span><strong>{d.operations2024.salesMt} Mt</strong><small>{(d.operations2024.salesMt - d.operations2024.productionMt).toFixed(1)} Mt above production</small></div>
          <div><span>STRIP RATIO</span><strong>{d.operations2024.stripRatio}x</strong><small>{d.operations2024.overburdenMt} Mt overburden</small></div>
        </section>

        <section className="rxg-grid">
          <div className="rxg-main">
            <article className="rxg-panel">
              <header><div><span>OPERATIONS · FY2024</span><h3>Mining performance</h3></div><b>6 YEARS AVAILABLE</b></header>
              <div className="rxg-metrics four">
                <div><span>Production</span><strong>{d.operations2024.productionMt} Mt</strong></div>
                <div><span>Sales</span><strong>{d.operations2024.salesMt} Mt</strong></div>
                <div><span>Overburden</span><strong>{d.operations2024.overburdenMt} Mt</strong></div>
                <div><span>Strip ratio</span><strong>{d.operations2024.stripRatio}x</strong></div>
              </div>
              <div className="rxg-reserve">
                <div><span>TOTAL RESERVES</span><strong>{(d.operations2024.totalReservesMt / 1000).toFixed(3)} Bt</strong><small>measurement {d.operations2024.measurementYear}</small></div>
                <div><span>TOTAL RESOURCES</span><strong>{(d.operations2024.totalResourcesMt / 1000).toFixed(3)} Bt</strong><small>measurement {d.operations2024.measurementYear}</small></div>
                <div className="rxg-ratio-visual"><i style={{width: `${d.operations2024.totalReservesMt / d.operations2024.totalResourcesMt * 100}%`}} /><span>Reserves represent {(d.operations2024.totalReservesMt / d.operations2024.totalResourcesMt * 100).toFixed(1)}% of reported resources</span></div>
              </div>
            </article>

            <article className="rxg-panel">
              <header><div><span>FINANCIALS · FY2024</span><h3>Financial snapshot</h3></div><b>USD</b></header>
              <div className="rxg-metrics four">
                <div><span>Assets</span><strong>{moneyUsd(d.financials2024.assetsUsd)}</strong></div>
                <div><span>Revenue</span><strong>{moneyUsd(d.financials2024.revenueUsd)}</strong></div>
                <div><span>Cost of revenue</span><strong>{moneyUsd(d.financials2024.costOfRevenueUsd)}</strong></div>
                <div><span>Net profit</span><strong>{moneyUsd(d.financials2024.netProfitUsd)}</strong></div>
              </div>
              <div className="rxg-breakdown">
                <div><span>Coal revenue</span><strong>{moneyUsd(d.financials2024.coalRevenueUsd)}</strong><i style={{width:`${d.financials2024.coalRevenueUsd / d.financials2024.revenueUsd * 100}%`}} /></div>
                <div><span>Gold & silver revenue</span><strong>{moneyUsd(d.financials2024.goldSilverRevenueUsd)}</strong><i style={{width:`${d.financials2024.goldSilverRevenueUsd / d.financials2024.revenueUsd * 100}%`}} /></div>
              </div>
            </article>

            <article className="rxg-panel">
              <header><div><span>SALES DESTINATIONS · FY2024</span><h3>Where the coal goes</h3></div><b>Mt</b></header>
              <div className="rxg-bars">
                {d.destinations2024.map((x) => (
                  <div key={x.country}>
                    <span>{x.country}</span>
                    <div><i style={{width: `${x.volume / maxDestination * 100}%`}} /></div>
                    <strong>{x.volume.toFixed(3)}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="rxg-panel">
              <header><div><span>PRODUCT QUALITY</span><h3>Coal product range</h3></div><b>VERIFIED ATTRIBUTES</b></header>
              <div className="rxg-products">
                {d.products.map((p) => (
                  <div key={p.name}>
                    <strong>{p.name}</strong>
                    <span>{p.kcal.toLocaleString()} kcal</span>
                    <small>Moisture {p.moisture}% · Ash {p.ashAdb}% ADB · Sulphur {p.sulphurAdb}% ADB</small>
                  </div>
                ))}
              </div>
            </article>

            <article className="rxg-panel">
              <header><div><span>PEER CONTEXT · 2025</span><h3>Market-cap comparison</h3></div><b>BUMI {moneyIdr(d.identity.marketCapIdr)}</b></header>
              <div className="rxg-peer-bars">
                {d.peers2025.map((p) => (
                  <div key={p.ticker}>
                    <span><b>{p.ticker}</b><small>{p.name}</small></span>
                    <div><i style={{width: `${p.marketCapIdr / maxPeer * 100}%`}} /></div>
                    <strong>{moneyIdr(p.marketCapIdr)}</strong>
                    <em>P/E {p.pe.toFixed(1)}x</em>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <aside className="rxg-side">
            <article className="rxg-panel">
              <header><div><span>MINING LICENSE</span><h3>Verified permit</h3></div></header>
              <dl className="rxg-dl">
                <div><dt>Type</dt><dd>{d.license.type}</dd></div>
                <div><dt>Number</dt><dd>{d.license.number}</dd></div>
                <div><dt>Location</dt><dd>{d.license.location}</dd></div>
                <div><dt>Activity</dt><dd>{d.license.activity}</dd></div>
                <div><dt>Licensed area</dt><dd>{d.license.areaHa} ha</dd></div>
                <div><dt>Expiry</dt><dd>{d.license.expiryDate}</dd></div>
              </dl>
            </article>

            <article className="rxg-panel">
              <header><div><span>OWNERSHIP</span><h3>Operating interests</h3></div></header>
              <div className="rxg-subs">
                {d.subsidiaries.map((s) => (
                  <div key={s.name}><span>{s.name}</span><strong>{s.ownership}%</strong></div>
                ))}
              </div>
            </article>

            <article className="rxg-panel">
              <header><div><span>MARKET CONTEXT</span><h3>Public-market identity</h3></div></header>
              <dl className="rxg-dl">
                <div><dt>ESG score</dt><dd>{d.identity.esgScore}</dd></div>
                <div><dt>Indices</dt><dd>{d.identity.indices.join(" · ")}</dd></div>
                <div><dt>Market-cap rank</dt><dd>#{d.identity.marketCapRank}</dd></div>
              </dl>
            </article>

            <article className="rxg-panel rxg-provenance">
              <header><div><span>PROVENANCE</span><h3>Evidence status</h3></div></header>
              <p>{d.provenance.label}</p>
              <strong>Collected {d.provenance.collected}</strong>
              <small>Financial & operational year: {d.provenance.financialYear}. Peer comparison year: {d.provenance.peerYear}.</small>
            </article>

            <Link href="/investigations" className="rxg-investigate">
              <span>DIVERGENCE / INVESTIGATION</span>
              <strong>Open Investigator</strong>
              <small>Move from company context into RX MDI&apos;s evidence-first investigation layer.</small>
            </Link>
          </aside>
        </section>
      </div>

      <MobileNav />
    </main>
  );
}
