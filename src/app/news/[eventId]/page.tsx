import Link from "next/link";
import { notFound } from "next/navigation";
import { MobileNav } from "@/components/rxmdi/MobileNav";
import { ProductHeader } from "@/components/rxmdi/ProductHeader";
import rawEvents from "@/lib/rxmdi-event-intelligence.json";
import {
  timelineSnapshots,
  type TimelineEvent,
} from "@/lib/rxmdi/timeline-snapshots";
import styles from "./news.module.css";

type NewsRecord = {
  id: string;
  type?: string;
  timestamp?: string;
  date?: string;
  title: string;
  summary?: string;
  sourceUrl?: string;
  publisher: string;
  symbols?: string[];
};

type EventCluster = {
  id: string;
  kind?: string;
  date: string;
  symbol?: string;
  headline: string;
  description?: string;
  dimensions: string[];
  newsIds: string[];
  publishers: string[];
  sourceCount: number;
  evidenceRule?: string;
};

type EventData = {
  company?: {
    name?: string;
    symbol?: string;
  };
  clusters: EventCluster[];
  records: {
    news: NewsRecord[];
  };
};

type TimelineMatch = {
  symbol: string;
  event: TimelineEvent;
};

const data = rawEvents as EventData;

function fmtDate(value: string | undefined) {
  if (!value) return "Collected record";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function label(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function findTimelineEvent(eventId: string): TimelineMatch | null {
  for (const snapshot of Object.values(timelineSnapshots)) {
    const event = snapshot.events.find((item) => item.id === eventId);

    if (event) {
      return {
        symbol: snapshot.symbol,
        event,
      };
    }
  }

  return null;
}

function timelineTypeLabel(event: TimelineEvent) {
  if (event.scope === "market-context") return "MARKET CONTEXT";
  if (event.type === "filing") return "FILING";
  if (event.type === "corporate") return "CORPORATE";
  if (event.type === "suspension") return "SUSPENSION";

  return "COMPANY NEWS";
}

export default async function NewsEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const timelineMatch = findTimelineEvent(eventId);

  if (timelineMatch) {
    const { symbol, event } = timelineMatch;

    return (
      <main className="rxn-app">
        <ProductHeader />

        <section className={styles.page}>
          <div className={styles.backRow}>
            <Link href="/today">Back to Today</Link>
            <span>NEWS INTELLIGENCE</span>
          </div>

          <header className={styles.hero}>
            <div className={styles.heroMain}>
              <div className={styles.meta}>
                <span>{fmtDate(event.date)}</span>
                <span>{symbol}.JK</span>
                <strong>{timelineTypeLabel(event)}</strong>
              </div>

              <h1>{event.title}</h1>
              <p>{event.summary}</p>
            </div>

            <aside className={styles.evidenceCard}>
              <span>COLLECTED SOURCE</span>
              <strong>{symbol}</strong>
              <b>{event.source}</b>
              <small>
                RX MDI preserves the collected event as context and does
                not infer unsupported causality.
              </small>
            </aside>
          </header>

          <section className={styles.grid}>
            <article className={styles.panel}>
              <span className={styles.kicker}>WHAT HAPPENED</span>
              <h2>Collected development for {symbol}.</h2>
              <p>{event.summary}</p>

              <div className={styles.dimensions}>
                <span>{timelineTypeLabel(event)}</span>
              </div>
            </article>

            <article className={styles.panel}>
              <span className={styles.kicker}>INTELLIGENCE CONTEXT</span>
              <h2>What this record supports.</h2>

              <p>
                This collected record is associated with {symbol}. RX MDI
                distinguishes company-specific developments from broader
                market context so contextual reporting is not silently
                converted into a causal claim.
              </p>

              <div className={styles.rule}>
                <span>EVIDENCE RULE</span>
                <strong>
                  Evidence before certainty; context is not proof of causality.
                </strong>
              </div>
            </article>
          </section>

          <section className={styles.sources}>
            <div className={styles.sectionHead}>
              <div>
                <span>SOURCE &amp; PROVENANCE</span>
                <h2>Trace the collected intelligence record.</h2>
              </div>

              <strong>1 COLLECTED RECORD</strong>
            </div>

            <div className={styles.sourceList}>
              <article className={styles.sourceRow}>
                <div className={styles.sourceMeta}>
                  <span>{fmtDate(event.date)}</span>
                  <strong>{event.source}</strong>
                </div>

                <div className={styles.sourceBody}>
                  <h3>{event.title}</h3>
                  <p>{event.summary}</p>
                </div>

                <div className={styles.sourceAction}>
                  <span>Collected Sectors intelligence snapshot</span>
                </div>
              </article>
            </div>
          </section>

          <section className={styles.guardrail}>
            <strong>RX MDI TRUST RULE</strong>
            <p>
              A collected report can provide company or market context.
              It does not, by itself, prove that the reported event caused
              a market movement or operating outcome.
            </p>
          </section>

          <div className={styles.actions}>
            <Link href={`/companies/${symbol}`}>
              Open {symbol} Intelligence
            </Link>

            <Link href="/insights">Open Insights</Link>

            <Link href={`/investigations?symbol=${symbol}`}>
              Investigate {symbol}
            </Link>
          </div>
        </section>

        <MobileNav />
      </main>
    );
  }

  const event = data.clusters.find((item) => item.id === eventId);

  if (!event) notFound();

  const sources = data.records.news
    .filter((item) => event.newsIds.includes(item.id))
    .sort((a, b) =>
      String(b.timestamp ?? b.date ?? "").localeCompare(
        String(a.timestamp ?? a.date ?? ""),
      ),
    );

  const publisherCount = new Set(
    sources.map((item) => item.publisher).filter(Boolean),
  ).size;

  const trustLabel =
    publisherCount >= 2
      ? "CORROBORATED"
      : sources.length === 1
        ? "REPORTED"
        : "EVIDENCE LIMITED";

  const symbol =
    event.symbol?.replace(/\.JK$/i, "") ||
    data.company?.symbol?.replace(/\.JK$/i, "") ||
    "BUMI";

  return (
    <main className="rxn-app">
      <ProductHeader />

      <section className={styles.page}>
        <div className={styles.backRow}>
          <Link href="/today">Back to Today</Link>
          <span>EVENT INTELLIGENCE</span>
        </div>

        <header className={styles.hero}>
          <div className={styles.heroMain}>
            <div className={styles.meta}>
              <span>{fmtDate(event.date)}</span>
              <span>{symbol}.JK</span>
              <strong>{trustLabel}</strong>
            </div>

            <h1>{event.headline}</h1>

            <p>
              {event.description ??
                "RX MDI groups collected reports that describe the same company event and keeps the supporting sources traceable."}
            </p>
          </div>

          <aside className={styles.evidenceCard}>
            <span>EVIDENCE STATE</span>
            <strong>{event.sourceCount} REPORTS</strong>
            <b>{publisherCount} publishers</b>
            <small>Grouped as one event, not duplicate headlines.</small>
          </aside>
        </header>

        <section className={styles.grid}>
          <article className={styles.panel}>
            <span className={styles.kicker}>WHAT HAPPENED</span>
            <h2>One event, multiple collected reports.</h2>

            <p>
              {event.description ??
                "Multiple collected reports describe this company event. RX MDI groups those reports into one intelligence record."}
            </p>

            <div className={styles.dimensions}>
              {event.dimensions.map((dimension) => (
                <span key={dimension}>{label(dimension)}</span>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <span className={styles.kicker}>INTELLIGENCE CONTEXT</span>
            <h2>What the collected evidence supports.</h2>

            <p>
              The event is connected to{" "}
              {event.dimensions.map(label).join(", ")} dimensions in the
              collected RX MDI event record. These labels organize context;
              they do not establish market causality.
            </p>

            <div className={styles.rule}>
              <span>EVIDENCE RULE</span>
              <strong>
                {event.evidenceRule ??
                  "Evidence before certainty; no unsupported causal inference."}
              </strong>
            </div>
          </article>
        </section>

        <section className={styles.sources}>
          <div className={styles.sectionHead}>
            <div>
              <span>SOURCES &amp; EVIDENCE</span>
              <h2>Trace the event back to collected reporting.</h2>
            </div>

            <strong>{sources.length} SOURCE RECORDS</strong>
          </div>

          <div className={styles.sourceList}>
            {sources.map((source) => (
              <article className={styles.sourceRow} key={source.id}>
                <div className={styles.sourceMeta}>
                  <span>{fmtDate(source.timestamp ?? source.date)}</span>
                  <strong>{source.publisher}</strong>
                </div>

                <div className={styles.sourceBody}>
                  <h3>{source.title}</h3>
                  {source.summary ? <p>{source.summary}</p> : null}
                </div>

                <div className={styles.sourceAction}>
                  {source.sourceUrl ? (
                    <a
                      href={source.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Read Original Source
                    </a>
                  ) : (
                    <span>Source URL unavailable</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.guardrail}>
          <strong>RX MDI TRUST RULE</strong>
          <p>
            Multiple reports can corroborate that an event was reported.
            They do not, by themselves, prove that the event caused a market
            movement or operating outcome.
          </p>
        </section>

        <div className={styles.actions}>
          <Link href={`/companies/${symbol}`}>
            Open {symbol} Intelligence
          </Link>

          <Link href="/insights">Open Insights</Link>

          <Link href={`/investigations?symbol=${symbol}`}>
            Investigate {symbol}
          </Link>
        </div>
      </section>

      <MobileNav />
    </main>
  );
}