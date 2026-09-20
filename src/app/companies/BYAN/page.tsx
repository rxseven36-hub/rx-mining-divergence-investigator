/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { ProductHeader } from "@/components/rxmdi/ProductHeader";
import { MobileNav } from "@/components/rxmdi/MobileNav";
import { CompanyFootprintSection } from "@/components/rxmdi/map/CompanyFootprintSection";
import { ProductionSalesVisual } from "@/components/rxmdi/ProductionSalesVisual";
import d from "@/lib/rxmdi-byan-intelligence.json";
import s from "./byan.module.css";

const n = (v: any, x = 2) =>
  v !== null &&
  v !== undefined &&
  Number.isFinite(Number(v))
    ? new Intl.NumberFormat("en-US", {
        maximumFractionDigits: x,
      }).format(Number(v))
    : "—";

const usd = (v: any) => {
  if (v === null || v === undefined) return "—";

  const x = Number(v);

  return !Number.isFinite(x)
    ? "—"
    : Math.abs(x) >= 1e9
      ? `US$${(x / 1e9).toFixed(2)}B`
      : Math.abs(x) >= 1e6
        ? `US$${(x / 1e6).toFixed(1)}M`
        : `US$${n(x)}`;
};

const idrb = (v: any) =>
  v != null && Number.isFinite(Number(v))
    ? `Rp${(Number(v) / 1e9).toFixed(2)}B`
    : "—";

const V = (v: any) => v ?? "Not available";

const rv = (x: any) =>
  x?.max != null
    ? x.min !== x.max
      ? `${n(x.min, 0)}–${n(x.max, 0)}`
      : n(x.max, 0)
    : "—";

export default function Page() {
  const c = d.company;
  const p = d.performance;
  const f = d.financials;
  const m = d.market;
  const l: any = c.licenses[0];

  return (
    <main className="rxn-app">
      <ProductHeader />

      <div className={s.page}>
        <Link href="/companies" className={s.back}>
          Back
        </Link>

        <section className={s.hero}>
          <div>
            <span>COMPANY INTELLIGENCE · COAL</span>
            <h1>BYAN</h1>
            <h2>{c.name}</h2>
            <p>
              Company, mining operations, financials,
              products, markets, ownership and trading
              activity in one connected view.
            </p>
          </div>

          <aside>
            <span>DATA THROUGH</span>
            <strong>{V(m.latest.date)}</strong>
            <small>Collected snapshot</small>
          </aside>
        </section>

        <section className={s.metrics}>
          <article>
            <span>LAST CLOSE</span>
            <strong>{n(m.latest.close, 0)}</strong>
            <small>{V(m.latest.date)}</small>
          </article>

          <article>
            <span>DAILY MOVE</span>
            <strong>
              {m.move != null
                ? `${m.move.toFixed(2)}%`
                : "—"}
            </strong>
            <small>vs previous close</small>
          </article>

          <article>
            <span>PRODUCTION 2024</span>
            <strong>
              {p.production != null
                ? `${n(p.production)} ${V(p.unit)}`
                : "—"}
            </strong>
            <small>{V(p.commoditySubType)}</small>
          </article>

          <article>
            <span>SALES 2024</span>
            <strong>
              {p.sales != null
                ? `${n(p.sales)} ${V(p.unit)}`
                : "—"}
            </strong>
            <small>collected performance</small>
          </article>
        </section>

        <section className={s.grid}>
          <article>
            <header>
              <span>COMPANY</span>
              <h3>What BYAN is</h3>
            </header>

            <div className={s.facts}>
              <b>
                TYPE
                <em>{V(c.type)}</em>
              </b>
              <b>
                KEY OPERATION
                <em>{V(c.keyOperation)}</em>
              </b>
              <b>
                COMMODITY
                <em>{c.commodities.join(", ")}</em>
              </b>
              <b>
                PROVINCE
                <em>{V(c.province)}</em>
              </b>
            </div>
          </article>

          <article>
            <header>
              <span>MINING & LICENSE</span>
              <h3>Operating identity</h3>
            </header>

            <div className={s.facts}>
              <b>
                LICENSE
                <em>{V(l?.license_type)}</em>
              </b>
              <b>
                ACTIVITY
                <em>{V(l?.activity)}</em>
              </b>
              <b>
                AREA
                <em>
                  {l?.licensed_area_ha
                    ? `${n(l.licensed_area_ha)} ha`
                    : "—"}
                </em>
              </b>
              <b>
                EXPIRY
                <em>{V(l?.license_expiry_date)}</em>
              </b>
            </div>
          </article>

          <article className={s.wide}>
            <header>
              <span>MINING PERFORMANCE · 2024</span>
              <h3>From rock movement to coal sales</h3>
            </header>

            <div className={s.perf}>
              <b>
                PRODUCTION
                <em>
                  {p.production != null
                    ? `${n(p.production)} Mt`
                    : "—"}
                </em>
              </b>

              <b>
                SALES
                <em>
                  {p.sales != null
                    ? `${n(p.sales)} Mt`
                    : "—"}
                </em>
              </b>

              <b>
                OVERBURDEN
                <em>
                  {p.overburden != null
                    ? `${n(p.overburden)} Mt`
                    : "—"}
                </em>
              </b>

              <b>
                STRIP RATIO
                <em>
                  {p.stripRatio != null
                    ? `${n(p.stripRatio)}x`
                    : "—"}
                </em>
              </b>

              <b>
                RESERVES
                <em>
                  {p.reserves != null
                    ? `${n(p.reserves, 0)} Mt`
                    : "—"}
                  <small>
                    Measured {V(p.measurementYear)}
                  </small>
                </em>
              </b>

              <b>
                RESOURCES
                <em>
                  {p.resources != null
                    ? `${n(p.resources, 0)} Mt`
                    : "—"}
                  <small>
                    Measured {V(p.measurementYear)}
                  </small>
                </em>
              </b>
            </div>
          </article>

          <ProductionSalesVisual
            symbol="BYAN"
            year={p.year || 2024}
            production={p.production}
            sales={p.sales}
            unit={p.unit}
          />

          <CompanyFootprintSection ticker="BYAN" />

          <article>
            <header>
              <span>FINANCIALS · {f.year}</span>
              <h3>Business scale and earnings</h3>
            </header>

            <div className={s.facts}>
              <b>
                REVENUE
                <em>{usd(f.revenue)}</em>
              </b>
              <b>
                NET PROFIT
                <em>{usd(f.netProfit)}</em>
              </b>
              <b>
                TOTAL ASSETS
                <em>{usd(f.assets)}</em>
              </b>
              <b>
                COST OF REVENUE
                <em>{usd(f.costRevenue)}</em>
              </b>
            </div>
          </article>

          <article>
            <header>
              <span>COAL PRODUCTS</span>
              <h3>What BYAN sells</h3>
            </header>

            <div className={s.list}>
              {p.products.map((x: any, i) => (
                <p key={i}>
                  <strong>{x.product_name}</strong>
                  <span>
                    {rv(x.calorific_value_kcal)} kcal
                  </span>
                </p>
              ))}
            </div>
          </article>

          <article>
            <header>
              <span>
                SALES MARKETS ·{" "}
                {(d as any).salesMarketsYear || 2024}
              </span>
              <h3>Where BYAN sales are exposed</h3>
            </header>

            <div className={s.list}>
              {d.salesMarkets.map((x: any, i) => (
                <p key={i}>
                  <strong>{x.name}</strong>
                  <span>
                    {x.percentage_of_sales_volume != null
                      ? `${n(
                          x.percentage_of_sales_volume,
                        )}% of sales volume`
                      : x.revenue_usd != null
                        ? `${usd(
                            x.revenue_usd,
                          )} revenue`
                        : "Metric unavailable"}
                  </span>
                </p>
              ))}
            </div>

            <small>
              Country rows show collected share of sales
              volume. Regional rows show collected revenue
              where available. These are different measures
              and are not summed together.
            </small>
          </article>

          <article>
            <header>
              <span>OWNERSHIP STRUCTURE</span>
              <h3>
                {d.ownership.subsidiaries.length} collected
                subsidiaries
              </h3>
            </header>

            <details>
              <summary>
                Show all{" "}
                {d.ownership.subsidiaries.length}
              </summary>

              <div className={s.subs}>
                {d.ownership.subsidiaries.map(
                  (x: any, i) => (
                    <p key={i}>
                      <strong>{x.name}</strong>
                      <span>
                        {n(x.percentage_ownership)}%
                      </span>
                    </p>
                  ),
                )}
              </div>
            </details>
          </article>

          <article>
            <header>
              <span>MARKET ACTIVITY</span>
              <h3>Who is active around BYAN</h3>
            </header>

            <div className={s.brok}>
              <div>
                <b>TOP BUYERS</b>
                {m.buyers.slice(0, 3).map((x: any) => (
                  <p key={x.broker_code}>
                    {x.broker_code}
                    <span>{idrb(x.net_idr)}</span>
                  </p>
                ))}
              </div>

              <div>
                <b>TOP SELLERS</b>
                {m.sellers.slice(0, 3).map((x: any) => (
                  <p key={x.broker_code}>
                    {x.broker_code}
                    <span>{idrb(x.net_idr)}</span>
                  </p>
                ))}
              </div>
            </div>

            <small>
              {m.brokerStart} to {m.brokerEnd}
            </small>
          </article>

          <article>
            <header>
              <span>FOREIGN FLOW</span>
              <h3>Latest collected foreign activity</h3>
            </header>

            <div className={s.big}>
              {idrb(m.foreign?.net_foreign_inflow)}
            </div>

            <p className={s.muted}>
              {V(m.foreign?.date)} · Negative means net
              outflow in the collected record.
            </p>
          </article>

          <article>
            <header>
              <span>MARKET SNAPSHOT</span>
              <h3>Price, liquidity and scale</h3>
            </header>

            <div className={s.facts}>
              <b>
                OPEN
                <em>{n(m.latest.open, 0)}</em>
              </b>

              <b>
                HIGH / LOW
                <em>
                  {n(m.latest.high, 0)} /{" "}
                  {n(m.latest.low, 0)}
                </em>
              </b>

              <b>
                VOLUME
                <em>{n(m.latest.volume, 0)}</em>
              </b>

              <b>
                MARKET CAP
                <em>
                  {m.latest.market_cap
                    ? `Rp${(
                        m.latest.market_cap / 1e12
                      ).toFixed(1)}T`
                    : "—"}
                </em>
              </b>
            </div>
          </article>
        </section>

        <section className={s.path}>
          <strong>
            Company → Operations → Financials → Markets →
            Insights → Investigation → Evidence
          </strong>

          <div>
            <Link href="/explore">Explore</Link>
            <Link href="/insights">Insights</Link>
            <Link href="/investigations">
              Investigator
            </Link>
          </div>
        </section>
      </div>

      <MobileNav />
    </main>
  );
}
