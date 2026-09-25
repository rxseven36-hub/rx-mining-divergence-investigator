"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { timelineSnapshots, type TimelineEvent } from "@/lib/rxmdi/timeline-snapshots";
import styles from "@/app/today/today.module.css";

const STORAGE_KEY = "rxmdi.watchlist.v1";
const COMPANIES = ["BUMI", "ADMR", "BYAN", "ITMG", "GEMS"] as const;
type WatchEvent = TimelineEvent & { symbol: string };

function fmtDate(value: unknown, locale: string) {
  if (!value) return "Collected snapshot";
  const raw = String(value);
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

function eventTypeLabel(event: TimelineEvent) {
  if (event.scope === "market-context") return "MARKET CONTEXT";
  if (event.type === "filing") return "FILING";
  if (event.type === "corporate") return "CORPORATE";
  if (event.type === "suspension") return "SUSPENSION";
  return "COMPANY NEWS";
}

function normalize(value: unknown) {
  if (!Array.isArray(value)) return [...COMPANIES];
  const allowed = new Set<string>(COMPANIES);
  return [...new Set(value.filter((item): item is string => typeof item === "string" && allowed.has(item)))];
}

export function TodayWatchlist() {
  const locale = "en-GB";
  const [watched, setWatched] = useState<string[]>([...COMPANIES]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // Browser storage is an external system; hydrate the persisted preference after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored !== null) setWatched(normalize(JSON.parse(stored)));
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWatched([...COMPANIES]);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(watched)); } catch {}
  }, [ready, watched]);

  const latest = useMemo(() => {
    const rows: WatchEvent[] = [];
    for (const symbol of watched) {
      const timeline = timelineSnapshots[symbol];
      if (!timeline) continue;
      const event = [...timeline.events].sort((a, b) => b.sortDate.localeCompare(a.sortDate))[0];
      if (event) rows.push({ ...event, symbol });
    }
    return rows.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  }, [watched]);

  function toggle(symbol: string) {
    setWatched((current) => current.includes(symbol) ? current.filter((item) => item !== symbol) : [...current, symbol]);
  }

  return (
    <section className={`${styles.panel} ${styles.watchlistPanel}`}>
      <div className={styles.watchlistHead}>
        <div>
          <span className={styles.watchlistKicker}>MY WATCHLIST</span>
          <h2>Follow collected changes that matter to you.</h2>
          <p>Choose companies to keep their latest admitted timeline event in one place. Your selection stays in this browser.</p>
        </div>
        <div className={styles.watchlistState}>
          <span>WATCHING</span>
          <strong>{watched.length} / {COMPANIES.length}</strong>
          <small>LOCAL PREFERENCE</small>
        </div>
      </div>

      <div className={styles.watchlistChips} aria-label="Watchlist companies">
        {COMPANIES.map((symbol) => {
          const active = watched.includes(symbol);
          return <button key={symbol} type="button" className={active ? styles.watchlistChipActive : styles.watchlistChip} aria-pressed={active} onClick={() => toggle(symbol)}>
            {symbol}<span>{active ? "WATCHING" : "ADD"}</span>
          </button>;
        })}
      </div>

      <div className={styles.watchlistDivider} />
      <div className={styles.watchlistSectionHead}>
        <div><span>LATEST COLLECTED CHANGES</span><strong>Evidence-backed timeline records</strong></div>
        <small>Event inclusion comes from existing RX MDI timeline records, not an AI impact score.</small>
      </div>

      {latest.length ? (
        <div className={styles.watchlistEvents}>
          {latest.map((event) => (
            <article key={`${event.symbol}-${event.id}`} className={styles.watchlistEvent}>
              <div className={styles.watchlistEventTop}>
                <Link href={`/companies/${event.symbol}`}>{event.symbol}</Link>
                <span>{fmtDate(event.date, locale)}</span>
                <b>{eventTypeLabel(event)}</b>
              </div>
              <Link href={`/news/${event.id}`} className={styles.watchlistEventTitle}>{event.title}</Link>
              <p>{event.summary}</p>
              <div className={styles.watchlistEventFoot}><span>{event.source}</span><Link href={`/news/${event.id}`}>Open Event &gt;</Link></div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.watchlistEmpty}>
          <strong>No companies selected.</strong>
          <p>Add a company above to surface its latest collected timeline event.</p>
        </div>
      )}

      <small className={styles.watchlistGuardrail}>
        Latest collected does not mean continuously live. RX MDI preserves the source, date and event type already admitted to each company timeline and does not infer that an event caused market, operational or financial movement.
      </small>
    </section>
  );
}

