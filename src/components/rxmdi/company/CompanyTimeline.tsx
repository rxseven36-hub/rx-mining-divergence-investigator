import {
  timelineSnapshots,
  type TimelineEvent,
  type TimelineEventType,
} from "@/lib/rxmdi/timeline-snapshots";

const eventLabels: Record<TimelineEventType, string> = {
  news: "NEWS",
  filing: "FILING",
  corporate: "CORPORATE",
  suspension: "SUSPENSION",
};

function TimelineItem({
  event,
  symbol,
}: {
  event: TimelineEvent;
  symbol: string;
}) {
  return (
    <article className="rxc-timeline-item">
      <div className="rxc-timeline-date">
        <time dateTime={event.sortDate}>
          {event.date}
        </time>

        <span>{eventLabels[event.type]}</span>
      </div>

      <div className="rxc-timeline-marker" aria-hidden="true">
        <i />
      </div>

      <div className="rxc-timeline-content">
        <div className="rxc-timeline-meta">
          <span
            className={
              event.scope === "market-context"
                ? "rxc-scope-market"
                : "rxc-scope-company"
            }
          >
            {event.scope === "market-context"
              ? "MARKET CONTEXT"
              : `${symbol} SPECIFIC`}
          </span>

          <small>{event.source}</small>
        </div>

        <h3>{event.title}</h3>

        <p>{event.summary}</p>

        {event.secondaryDate ? (
          <small className="rxc-timeline-secondary">
            {event.secondaryDate}
          </small>
        ) : null}
      </div>
    </article>
  );
}

export function CompanyTimeline({
  symbol,
}: {
  symbol: string;
}) {
  const timeline = timelineSnapshots[symbol];

  if (!timeline) {
    return (
      <section id="timeline" className="rxc-section">
        <div className="rxc-section-head">
          <div>
            <span>WHAT HAPPENED?</span>
            <h2>Timeline data is not available yet.</h2>
          </div>

          <p>
            RX MDI does not invent missing events.
          </p>
        </div>
      </section>
    );
  }

  const hasOnlyNews =
    timeline.events.length > 0 &&
    timeline.events.every((event) => event.type === "news");

  return (
    <section
      id="timeline"
      className="rxc-section rxc-timeline-section"
    >
      <div className="rxc-section-head">
        <div>
          <span>WHAT HAPPENED?</span>
          <h2>
            {hasOnlyNews
              ? "Latest collected company news."
              : "One timeline. Different kinds of events."}
          </h2>
        </div>

        <p>
          {hasOnlyNews
            ? "Verified Sectors News records are shown chronologically while preserving company scope and source context."
            : "News, official filings and corporate actions are combined chronologically while keeping their source and event type visible."}
        </p>
      </div>

      <div className="rxc-timeline-summary">
        <div>
          <span>SELECTED PERIOD</span>
          <strong>
            {timeline.period.start} - {timeline.period.end}
          </strong>
        </div>

        <div>
          <span>NEWS INDEX</span>
          <strong>
            {timeline.newsCount} matching articles
          </strong>
        </div>

        <div>
          <span>SUSPENSION STATUS</span>
          <strong
            className={
              timeline.suspension.recorded
                ? "rxc-timeline-warning"
                : ""
            }
          >
            {timeline.suspension.recorded
              ? "Suspension recorded"
              : hasOnlyNews
                ? "Not collected"
                : "None recorded"}
          </strong>
        </div>
      </div>

      <div
        className="rxc-timeline-filter-view"
        aria-label="Timeline categories"
      >
        <span>ALL</span>
        <span>NEWS</span>

        {!hasOnlyNews ? (
          <>
            <span>FILINGS</span>
            <span>CORPORATE</span>
          </>
        ) : null}
      </div>

      <div className="rxc-timeline-list">
        {timeline.events.map((event) => (
          <TimelineItem
            key={event.id}
            event={event}
            symbol={timeline.symbol}
          />
        ))}
      </div>

      <div className="rxc-timeline-status">
        <span>SUSPENSION CHECK</span>

        <p>
          {timeline.suspension.text}
        </p>
      </div>

      <div className="rxc-timeline-guardrail">
        <span>EVENTS ARE CONTEXT</span>

        <p>
          Timeline proximity does not prove causality. RX MDI does not
          claim that a news item, filing or corporate event caused a
          particular stock-price movement unless the available evidence
          supports that conclusion.
        </p>
      </div>
    </section>
  );
}
