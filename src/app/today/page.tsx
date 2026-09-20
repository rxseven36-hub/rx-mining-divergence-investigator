import Link from "next/link";
import { MobileNav } from "@/components/rxmdi/MobileNav";
import { ProductHeader } from "@/components/rxmdi/ProductHeader";
import rawSnapshot from "@/lib/rxmdi-today-snapshot.json";
import rawEvents from "@/lib/rxmdi-event-intelligence.json";
import {
  timelineSnapshots,
  type TimelineEvent,
} from "@/lib/rxmdi/timeline-snapshots";
import styles from "./today.module.css";

type MarketRow = {
  ticker: string;
  date: string | null;
  close: number | null;
  move: number | null;
  volume: number | null;
  broker: boolean;
  foreign: boolean;
};

type NewsRow = {
  timestamp: string | null;
  title: string;
  publisher: string;
  url: string | null;
};

type TodaySnapshot = {
  dataThrough: string;
  markets: MarketRow[];
  news: NewsRow[];
  counts: {
    news: number;
    filings: number;
    corporateActions: number;
    suspensions: number;
  };
};

type EventNews = {
  id: string;
  sourceUrl: string;
  publisher: string;
};

type EventCluster = {
  id: string;
  date: string;
  headline: string;
  dimensions: string[];
  newsIds: string[];
  publishers: string[];
  sourceCount: number;
};

type EventIntelligence = {
  counts: {
    news: number;
    filings: number;
    agm: number;
    suspensions: number;
  };
  clusters: EventCluster[];
  records: {
    news: EventNews[];
  };
};

type CompanyFeedEvent = TimelineEvent & {
  symbol: string;
};

const snapshot = rawSnapshot as TodaySnapshot;
const events = rawEvents as EventIntelligence;
const leadEvent = events.clusters[0] ?? null;

const companyFeed: CompanyFeedEvent[] = Object.values(timelineSnapshots)
  .flatMap((company) =>
    company.events.map((event) => ({
      ...event,
      symbol: company.symbol,
    })),
  )
  .sort((a, b) => b.sortDate.localeCompare(a.sortDate));

const companySymbols = Object.keys(timelineSnapshots);

const representativeCompanyFeed: CompanyFeedEvent[] = companySymbols
  .map((symbol) => companyFeed.find((event) => event.symbol === symbol))
  .filter((event): event is CompanyFeedEvent => Boolean(event));

const representativeIds = new Set(
  representativeCompanyFeed.map((event) => `${event.symbol}:${event.id}`),
);

const latestCompanyFeed: CompanyFeedEvent[] = [
  ...representativeCompanyFeed,
  ...companyFeed.filter(
    (event) => !representativeIds.has(`${event.symbol}:${event.id}`),
  ),
].slice(0, 12);

const totalCollectedNews = Object.values(timelineSnapshots).reduce(
  (total, company) => total + company.newsCount,
  0,
);

const productionSalesWatch = [
  {
    symbol: "BUMI",
    production: 74.7,
    sales: 75.8,
    gap: 1.1,
    relationship: "SALES > PRODUCTION",
  },
  {
    symbol: "ADMR",
    production: 6.63,
    sales: 5.62,
    gap: -1.01,
    relationship: "PRODUCTION > SALES",
  },
  {
    symbol: "BYAN",
    production: 50.5,
    sales: 56.2,
    gap: 5.7,
    relationship: "SALES > PRODUCTION",
  },
  {
    symbol: "ITMG",
    production: 20.2,
    sales: 24.0,
    gap: 3.8,
    relationship: "SALES > PRODUCTION",
  },
  {
    symbol: "GEMS",
    production: 50.69,
    sales: 51.86,
    gap: 1.17,
    relationship: "SALES > PRODUCTION",
  },
] as const;

function fmtDate(value: unknown) {
  if (!value) return "Collected snapshot";

  const raw = String(value);
  const d = new Date(raw);

  if (Number.isNaN(d.getTime())) {
    return raw;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function fmtNumber(value: unknown) {
  const n = Number(value);

  return Number.isFinite(n)
    ? new Intl.NumberFormat("en-US").format(n)
    : "—";
}

function fmtMove(value: unknown) {
  const n = Number(value);

  return Number.isFinite(n)
    ? `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`
    : "—";
}

function labelDimension(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function eventTypeLabel(event: TimelineEvent) {
  if (event.scope === "market-context") return "MARKET CONTEXT";

  if (event.type === "filing") return "FILING";
  if (event.type === "corporate") return "CORPORATE";
  if (event.type === "suspension") return "SUSPENSION";

  return "COMPANY NEWS";
}

export default function TodayPage() {
  const leadSources = leadEvent
    ? events.records.news.filter(
        (news) =>
          leadEvent.newsIds.includes(news.id) &&
          news.sourceUrl,
      )
    : [];

  void leadSources;

  return (
    <main className="rxn-app">
      <ProductHeader />

      <section className={styles.page}>
        <header className={styles.hero}>
          <div>
            <span className={styles.kicker}>TODAY</span>
            <h1>
              What matters in Indonesian mining,
              <br />
              <em>in one working view.</em>
            </h1>

            <p>
              A fast orientation layer connecting market activity,
              verified developments, company context, and intelligence
              signals without inventing unavailable data.
            </p>
          </div>

          <div className={styles.snapshot}>
            <span>DATA STATE</span>
            <strong>COLLECTED SNAPSHOT</strong>
            <small>Through {fmtDate(snapshot.dataThrough)}</small>
          </div>
        </header>

        <section className={styles.topGrid}>
          <article className={`${styles.panel} ${styles.marketPanel}`}>
            <div className={styles.panelHead}>
              <div>
                <span>MARKET PULSE</span>
                <h2>Latest collected market activity</h2>
              </div>

              <strong>{snapshot.markets.length} COMPANIES</strong>
            </div>

            <div className={styles.marketList}>
              {snapshot.markets.map((row) => (
                <Link
                  key={row.ticker}
                  href={`/companies/${row.ticker}`}
                  className={styles.marketRow}
                >
                  <div>
                    <strong>{row.ticker}</strong>
                    <span>{fmtDate(row.date)}</span>
                  </div>

                  <div className={styles.marketNumbers}>
                    <div>
                      <span>CLOSE</span>
                      <strong>{fmtNumber(row.close)}</strong>
                    </div>

                    <div>
                      <span>MOVE</span>
                      <strong>{fmtMove(row.move)}</strong>
                    </div>

                    <div>
                      <span>VOLUME</span>
                      <strong>{fmtNumber(row.volume)}</strong>
                    </div>
                  </div>

                  <div className={styles.marketMeta}>
                    <span>DAILY</span>
                    {row.broker ? <span>BROKER</span> : null}
                    {row.foreign ? <span>FOREIGN</span> : null}
                  </div>
                </Link>
              ))}
            </div>

            <div className={styles.panelFoot}>
              Latest records inside the collected market-core snapshots.
            </div>
          </article>

          <article className={`${styles.panel} ${styles.timelinePanel}`}>
            <div className={styles.panelHead}>
              <div>
                <span>NEWS &amp; EVENTS</span>
                <h2>Latest company developments</h2>
              </div>

              <div className={styles.companyCoverage}>
                <span>COMPANY COVERAGE</span>
                <strong>5 / 5</strong>
                <small>BUMI | ADMR | BYAN | ITMG | GEMS</small>
              </div>
            </div>

            <div className={styles.newsList}>
              {latestCompanyFeed.map((event) => (
                <div
                  className={styles.newsItem}
                  key={`${event.symbol}-${event.id}`}
                >
                  <span>
                    {event.symbol} | {fmtDate(event.date)} |{" "}
                    {eventTypeLabel(event)}
                  </span>

                  <Link
                    href={`/news/${event.id}`}
                    className={styles.newsHeadline}
                  >
                    {event.title}
                  </Link>

                  <small>{event.source}</small>
                </div>
              ))}
            </div>

            <div className={styles.eventCounts}>
              <div>
                <span>COMPANIES</span>
                <strong>{Object.keys(timelineSnapshots).length}</strong>
              </div>

              <div>
                <span>COLLECTED NEWS</span>
                <strong>{totalCollectedNews}</strong>
              </div>

              <div>
                <span>VISIBLE EVENTS</span>
                <strong>{companyFeed.length}</strong>
              </div>

              <div>
                <span>BUMI EVENT CLUSTERS</span>
                <strong>{events.clusters.length}</strong>
              </div>
            </div>

            {leadEvent ? (
              <div className={styles.eventLead}>
                <div className={styles.eventLeadTop}>
                  <span>{fmtDate(leadEvent.date)}</span>
                  <strong>CORROBORATED BUMI EVENT</strong>
                </div>

                <h3>{leadEvent.headline}</h3>

                <div className={styles.eventEvidence}>
                  <strong>{leadEvent.sourceCount} reports</strong>
                  <span>{leadEvent.publishers.length} publishers</span>
                </div>

                <div className={styles.eventDimensions}>
                  {leadEvent.dimensions.map((dimension) => (
                    <span key={dimension}>
                      {labelDimension(dimension)}
                    </span>
                  ))}
                </div>

                <div className={styles.eventPublishers}>
                  {leadEvent.publishers.join(" | ")}
                </div>

                <Link
                  href={`/news/${leadEvent.id}`}
                  className={styles.eventSource}
                >
                  Open Event Intelligence
                </Link>

                <small className={styles.eventRule}>
                  Grouped from explicit same-event coverage. Market
                  context is not treated as proof of causality.
                </small>
              </div>
            ) : null}

            <Link href="/companies" className={styles.action}>
              Open Company Intelligence
            </Link>
          </article>
        </section>

        <section className={styles.middleGrid}>
          <article className={`${styles.panel} ${styles.signalPanel}`}>
            <div className={styles.signalTop}>
              <div>
                <div className={styles.signalTag}>PRODUCTION VS SALES WATCH</div>
                <h2>Five companies. Five operational relationships.</h2>
              </div>

              <div className={styles.signalCoverage}>
                <span>FY2024 COVERAGE</span>
                <strong>5 / 5</strong>
              </div>
            </div>

            <p>
              Compare reported FY2024 production and sales across the five
              competition-grade companies. The gap is an observed numerical
              relationship, not a causal conclusion.
            </p>

            <div className={styles.companySignalGrid}>
              {productionSalesWatch.map((company) => {
                const maxValue = Math.max(company.production, company.sales);
                const productionWidth =
                  maxValue > 0 ? (company.production / maxValue) * 100 : 0;
                const salesWidth =
                  maxValue > 0 ? (company.sales / maxValue) * 100 : 0;

                return (
                  <Link
                    key={company.symbol}
                    href={`/investigations?symbol=${company.symbol}&path=production-sales`}
                    className={styles.companySignalCard}
                  >
                    <div className={styles.companySignalHead}>
                      <strong>{company.symbol}</strong>
                      <span>{company.relationship}</span>
                    </div>

                    <div className={styles.signalMetric}>
                      <div>
                        <span>PRODUCTION</span>
                        <strong>{company.production} Mt</strong>
                      </div>

                      <div className={styles.signalTrack}>
                        <i style={{ width: `${productionWidth}%` }} />
                      </div>
                    </div>

                    <div className={styles.signalMetric}>
                      <div>
                        <span>SALES</span>
                        <strong>{company.sales} Mt</strong>
                      </div>

                      <div
                        className={`${styles.signalTrack} ${styles.salesTrack}`}
                      >
                        <i style={{ width: `${salesWidth}%` }} />
                      </div>
                    </div>

                    <div className={styles.companySignalFoot}>
                      <span>
                        OBSERVED GAP
                        <strong>
                          {company.gap > 0 ? "+" : ""}
                          {company.gap} Mt
                        </strong>
                      </span>

                      <b>Investigate {company.symbol} &gt;</b>
                    </div>
                  </Link>
                );
              })}
            </div>

            <small className={styles.signalGuardrail}>
              Production and sales can differ for multiple operational,
              inventory, timing, product-mix, or reporting reasons. RX MDI
              treats the relationship as an investigation entry point rather
              than proof of cause.
            </small>
          </article>

          <article className={`${styles.panel} ${styles.contextPanel}`}>
            <div className={styles.panelHead}>
              <div>
                <span>TODAY IN CONTEXT</span>
                <h2>From event to understanding</h2>
              </div>

              <strong>RX MDI</strong>
            </div>

            <div className={styles.contextSteps}>
              <div>
                <span>01</span>
                <strong>See what happened</strong>
                <p>Market movement, news, filings and events.</p>
              </div>

              <div>
                <span>02</span>
                <strong>Open the company</strong>
                <p>Put the event beside operations and financial context.</p>
              </div>

              <div>
                <span>03</span>
                <strong>Follow the signal</strong>
                <p>Move meaningful patterns into Insights or Investigator.</p>
              </div>
            </div>

            <Link href="/insights" className={styles.action}>
              Open Insights
            </Link>
          </article>
        </section>

        <section className={styles.path}>
          <div>
            <span>RX MDI INTELLIGENCE PATH</span>
            <strong>
              Today <b>&gt;</b> Company Context <b>&gt;</b> Insights{" "}
              <b>&gt;</b> Investigation <b>&gt;</b> Evidence
            </strong>
          </div>

          <div className={styles.pathActions}>
            <Link href="/companies">Companies</Link>
            <Link href="/insights">Insights</Link>
            <Link href="/investigations">Investigator</Link>
          </div>
        </section>

        <p className={styles.disclaimer}>
          TODAY reflects collected verified snapshots, not a continuously
          streaming live market/news feed.
        </p>
      </section>

      <MobileNav />
    </main>
  );
}