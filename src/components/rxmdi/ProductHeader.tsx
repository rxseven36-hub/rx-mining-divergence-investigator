"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const navigation = [
  { label: "TODAY", href: "/today" },
  { label: "COMPANIES", href: "/companies" },
  { label: "EXPLORE", href: "/explore" },
  { label: "INSIGHTS", href: "/insights" },
] as const;

const searchTargets = [
  { label: "BUMI", detail: "PT Bumi Resources Tbk", keywords: "BUMI company coal", href: "/companies/BUMI" },
  { label: "ADMR", detail: "PT Alamtri Minerals Indonesia Tbk", keywords: "ADMR company mining", href: "/companies/ADMR" },
  { label: "BYAN", detail: "PT Bayan Resources Tbk", keywords: "BYAN company coal", href: "/companies/BYAN" },
  { label: "ITMG", detail: "PT Indo Tambangraya Megah Tbk", keywords: "ITMG company coal", href: "/companies/ITMG" },
  { label: "GEMS", detail: "PT Golden Energy Mines Tbk", keywords: "GEMS company coal", href: "/companies/GEMS" },
  { label: "Today", detail: "Current RX MDI watch surface", keywords: "today market news events watch", href: "/today" },
  { label: "Companies", detail: "Company intelligence", keywords: "companies profiles intelligence", href: "/companies" },
  { label: "Explore", detail: "Discovery and mining map", keywords: "explore discovery map geography sites", href: "/explore" },
  { label: "Insights", detail: "Cross-company intelligence", keywords: "insights signals intelligence", href: "/insights" },
  { label: "Compare", detail: "Side-by-side company comparison", keywords: "compare peer comparison", href: "/compare" },
  { label: "Investigations", detail: "Deterministic investigation paths", keywords: "investigate investigations evidence", href: "/investigations" },
  { label: "Methodology", detail: "Sources, method, data coverage and disclaimer", keywords: "methodology methods source data disclaimer", href: "/methodology" },
] as const;

export function ProductHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return searchTargets.slice(0, 6);

    return searchTargets.filter((item) =>
      `${item.label} ${item.detail} ${item.keywords}`.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }

      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (
        searchRef.current &&
        event.target instanceof Node &&
        !searchRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  function goTo(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (results.length > 0) {
      goTo(results[0].href);
    }
  }

  return (
    <header className="rxn-header">
      <Link href="/" className="rxn-brand" aria-label="RX MDI home">
        <div className="rxn-logo"><span>RX</span><strong>MDI</strong></div>
        <small>Mining intelligence</small>
      </Link>

      <nav className="rxn-nav" aria-label="Primary navigation">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? "is-active"
                : undefined
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="rxn-header-actions">
        <div className="rxn-global-search-shell" ref={searchRef}>
          <form className="rxn-global-search" role="search" onSubmit={submitSearch}>
            <span className="rxn-search-icon" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Search company, ticker, or keyword..."
              aria-label="Search RX MDI"
              aria-expanded={open}
              aria-controls="rxmdi-global-search-results"
              autoComplete="off"
            />
            <kbd>/</kbd>
          </form>

          {open ? (
            <div
              id="rxmdi-global-search-results"
              className="rxn-global-search-results"
              role="listbox"
              aria-label="RX MDI search results"
            >
              {results.length > 0 ? (
                results.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    role="option"
                    aria-selected="false"
                    onClick={() => goTo(item.href)}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.detail}</span>
                  </button>
                ))
              ) : (
                <div className="rxn-global-search-empty">
                  No RX MDI destination matched.
                </div>
              )}
            </div>
          ) : null}
        </div>

        <span className="rxn-notification" aria-hidden="true">{"\u25cf"}</span>
      </div>
    </header>
  );
}
