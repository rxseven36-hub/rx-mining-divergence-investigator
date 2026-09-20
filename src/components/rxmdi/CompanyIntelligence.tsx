/* eslint-disable @typescript-eslint/no-explicit-any */
import { CompanyFootprintSection } from "@/components/rxmdi/map/CompanyFootprintSection";
import Link from "next/link";
import { ProductHeader } from "@/components/rxmdi/ProductHeader";
import { MobileNav } from "@/components/rxmdi/MobileNav";
import { ProductionSalesVisual } from "@/components/rxmdi/ProductionSalesVisual";
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

          <article>
            <header>
              <span>SALES MARKETS · 2024</span>
              <h3>Where sales are exposed</h3>
            </header>

            <div className={s.list}>
              {c.salesMarkets.length ? (
                c.salesMarkets.map(
                  (x: any, i: number) => (
                    <p key={i}>
                      <strong>{x.name}</strong>

                      <span>
                        {x.percentage_of_sales_volume !=
                        null
                          ? `${n(
                              x.percentage_of_sales_volume,
                            )}% sales volume`
                          : x.revenue_usd != null
                            ? `${usd(
                                x.revenue_usd,
                              )} revenue`
                            : x.volume != null
                              ? `${n(x.volume)} ${
                                  x.unit || ""
                                }`
                              : "—"}
                      </span>
                    </p>
                  ),
                )
              ) : (
                <p>
                  <strong>
                    No collected destination detail
                  </strong>
                  <span>—</span>
                </p>
              )}
            </div>
          </article>

          <article>
            <header>
              <span>OWNERSHIP STRUCTURE</span>
              <h3>
                {c.ownership.subsidiaries.length}{" "}
                collected subsidiaries
              </h3>
            </header>

            <details>
              <summary>
                Show all{" "}
                {c.ownership.subsidiaries.length}
              </summary>

              <div className={s.list}>
                {c.ownership.subsidiaries.map(
                  (x: any, i: number) => (
                    <p key={i}>
                      <strong>{x.name}</strong>
                      <span>
                        {x.percentage_ownership != null
                          ? `${n(
                              x.percentage_ownership,
                            )}%`
                          : ""}
                      </span>
                    </p>
                  ),
                )}
              </div>
            </details>
          </article>

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
