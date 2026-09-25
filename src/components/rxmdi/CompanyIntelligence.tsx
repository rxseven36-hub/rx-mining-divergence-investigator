/* eslint-disable @typescript-eslint/no-explicit-any */
import { CompanyFootprintSection } from "@/components/rxmdi/map/CompanyFootprintSection";
import Link from "next/link";
import { ProductHeader } from "@/components/rxmdi/ProductHeader";
import { MobileNav } from "@/components/rxmdi/MobileNav";
import { ProductionSalesVisual } from "@/components/rxmdi/ProductionSalesVisual";
import { BusinessMoney } from "@/components/rxmdi/BusinessMoney";
import { MarketCommodityContext } from "@/components/rxmdi/MarketCommodityContext";
import { SalesGeography } from "@/components/rxmdi/SalesGeography";
import { OwnershipStructure } from "@/components/rxmdi/OwnershipStructure";
import data from "@/lib/rxmdi-company-intelligence.json";
import s from "./CompanyIntelligence.module.css";

const n = (v: any, d = 2) =>
  v != null && Number.isFinite(Number(v))
    ? new Intl.NumberFormat("en-US", {
        maximumFractionDigits: d,
      }).format(Number(v))
    : "—";

const usd = (v: any) => {
  if (v == null) return "—";

  const x = Number(v);

  return !Number.isFinite(x)
    ? "—"
    : Math.abs(x) >= 1e9
      ? `US$${(x / 1e9).toFixed(2)}B`
      : Math.abs(x) >= 1e6
        ? `US$${(x / 1e6).toFixed(1)}M`
        : `US$${n(x)}`;
};

const kcal = (x: any) =>
  x?.max != null ? `${n(x.max, 0)} kcal` : "—";

export function CompanyIntelligence({
  symbol,
}: {
  symbol: "ADMR" | "GEMS" | "ITMG" | "BUMI";
}) {
  const c = (data.companies as any)[symbol];
  const p = c.performance;
  const f = c.financials;
  const m = c.market;
  const lic = c.licenses?.[0];

  return (
    <main className="rxn-app">
      <ProductHeader />

      <div className={s.page}>
        <Link className={s.back} href="/companies">
          Back
        </Link>

        <section className={s.hero}>
          <div>
            <span>
              COMPANY INTELLIGENCE ·{" "}
              {p.commodityType ||
                c.commodity?.[0] ||
                "MINING"}
            </span>

            <h1>{symbol}</h1>
            <h2>{c.name}</h2>

            <p>
              Company, mining operations, financials,
              products, markets and ownership in one
              connected view.
            </p>
          </div>

          <aside>
            <span>DATA THROUGH</span>
            <strong>{m.latest?.date || "FY2024"}</strong>
            <small>Collected snapshot</small>
          </aside>
        </section>

        <section className={s.metrics}>
          <article>
            <span>LAST CLOSE</span>
            <strong>{n(m.latest?.close, 0)}</strong>
            <small>
              {m.latest?.date || "Not collected"}
            </small>
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
                ? `${n(p.production)} ${p.unit || ""}`
                : "—"}
            </strong>
            <small>
              {p.commoditySubType ||
                "Collected performance"}
            </small>
          </article>

          <article>
            <span>SALES 2024</span>
            <strong>
              {p.sales != null
                ? `${n(p.sales)} ${p.unit || ""}`
                : "—"}
            </strong>
            <small>Collected performance</small>
          </article>
        </section>

        <section className={s.grid}>
          <article>
            <header>
              <span>COMPANY</span>
              <h3>What {symbol} is</h3>
            </header>

            <div className={s.facts}>
              <b>
                TYPE
                <em>{c.companyType || "—"}</em>
              </b>

              <b>
                KEY OPERATION
                <em>{c.keyOperation || "—"}</em>
              </b>

              <b>
                COMMODITY
                <em>
                  {c.commodity?.join(", ") || "—"}
                </em>
              </b>

              <b>
                PROVINCE
                <em>{c.province || "—"}</em>
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
                <em>{lic?.license_type || "—"}</em>
              </b>

              <b>
                ACTIVITY
                <em>{lic?.activity || "—"}</em>
              </b>

              <b>
                AREA
                <em>
                  {lic?.licensed_area_ha != null
                    ? `${n(lic.licensed_area_ha)} ha`
                    : "—"}
                </em>
              </b>

              <b>
                EXPIRY
                <em>
                  {lic?.license_expiry_date || "—"}
                </em>
              </b>
            </div>
          </article>

          <article className={s.wide}>
            <header>
              <span>
                MINING PERFORMANCE · {p.year}
              </span>
              <h3>From operations to sales</h3>
            </header>

            <div className={s.perf}>
              <b>
                PRODUCTION
                <em>
                  {p.production != null
                    ? `${n(p.production)} ${p.unit || ""}`
                    : "—"}
                </em>
              </b>

              <b>
                SALES
                <em>
                  {p.sales != null
                    ? `${n(p.sales)} ${p.unit || ""}`
                    : "—"}
                </em>
              </b>

              <b>
                OVERBURDEN
                <em>
                  {p.overburden != null
                    ? `${n(p.overburden)} ${p.unit || ""}`
                    : "—"}
                </em>
              </b>

              <b>
                STRIP RATIO
                <em>
                  {p.stripRatio != null
                    ? `${n(p.stripRatio)} x`
                    : "—"}
                </em>
              </b>

              <b>
                RESERVES
                <em>
                  {p.reserves != null
                    ? `${n(p.reserves)} Mt`
                    : "—"}

                  {p.reserves != null &&
                  p.measurementYear ? (
                    <small>
                      Measured {p.measurementYear}
                    </small>
                  ) : null}
                </em>
              </b>

              <b>
                RESOURCES
                <em>
                  {p.resources != null
                    ? `${n(p.resources)} Mt`
                    : "—"}

                  {p.resources != null &&
                  p.measurementYear ? (
                    <small>
                      Measured {p.measurementYear}
                    </small>
                  ) : null}
                </em>
              </b>
            </div>
          </article>

          <ProductionSalesVisual
            symbol={symbol}
            year={p.year || 2024}
            production={p.production}
            sales={p.sales}
            unit={p.unit}
          />

          <CompanyFootprintSection ticker={symbol} />

          <BusinessMoney
  	    year={f.year}
  	    revenue={f.revenue}
  	    netProfit={f.netProfit}
  	    assets={f.assets}
  	    costRevenue={f.costRevenue}
	  />

          <MarketCommodityContext
            symbol={symbol}
            commodity="COAL"
            market={{
              date: m.latest?.date ?? null,
              close: m.latest?.close ?? null,
              move: m.move ?? null,
              volume: m.latest?.volume ?? null,
              marketCap: m.latest?.market_cap ?? null,
            }}
          />

          <article>
            <header>
              <span>PRODUCTS</span>
              <h3>What {symbol} sells</h3>
            </header>

            <div className={s.list}>
              {p.products.length ? (
                p.products.map(
                  (x: any, i: number) => (
                    <p key={i}>
                      <strong>
                        {x.product_name || "Product"}
                      </strong>
                      <span>
                        {kcal(
                          x.calorific_value_kcal,
                        )}
                      </span>
                    </p>
                  ),
                )
              ) : (
                <p>
                  <strong>
                    No collected product detail
                  </strong>
                  <span>—</span>
                </p>
              )}
            </div>
          </article>

          <SalesGeography
            symbol={symbol}
            year={2024}
            destinations={c.salesMarkets}
          />

          <OwnershipStructure
            symbol={symbol}
            parents={c.ownership.parents}
            subsidiaries={c.ownership.subsidiaries}
          />

          <article>
            <header>
              <span>INTELLIGENCE PATH</span>
              <h3>
                Continue understanding {symbol}
              </h3>
            </header>

            <div className={s.actions}>
              <Link
                href={`/explore?symbol=${symbol}`}
              >
                Explore
              </Link>

              <Link
                href={`/insights?symbol=${symbol}`}
              >
                Insights
              </Link>

              <Link
                href={`/investigations?symbol=${symbol}`}
              >
                Investigator
              </Link>
            </div>
          </article>
        </section>
      </div>

      <MobileNav />
    </main>
  );
}
