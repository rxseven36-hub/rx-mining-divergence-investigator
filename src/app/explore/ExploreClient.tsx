"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./explore.module.css";
import { IndonesiaMiningMap } from "@/components/rxmdi/map/IndonesiaMiningMap";

type ExploreView = "discovery" | "map";

type ExploreClientProps = {
  initialView: ExploreView;
};

type DimensionKey =
  | "operations"
  | "financials"
  | "resources"
  | "products"
  | "markets"
  | "geography";

type Discovery = {
  id: string;
  dimension: DimensionKey;
  eyebrow: string;
  title: string;
  description: string;
  metric: string;
  detail: string;
  companies: string[];
  href?: string;
};

const dimensions: Array<{ key: DimensionKey; label: string; description: string }> = [
  { key: "operations", label: "Operations", description: "Production, sales and mining efficiency" },
  { key: "financials", label: "Financials", description: "Revenue, costs, assets and profitability" },
  { key: "resources", label: "Resources", description: "Reserves, resources and mine life context" },
  { key: "products", label: "Products", description: "Coal type, calorific value and product quality" },
  { key: "markets", label: "Markets", description: "Sales destinations and market exposure" },
  { key: "geography", label: "Geography", description: "Where companies operate and sell" },
];

const discoveries: Discovery[] = [
  {
    id: "peer-compare",
    dimension: "financials",
    eyebrow: "PEER COMPARISON",
    title: "Compare reported company observations",
    description: "Place supported companies side by side across operations, reported financials and collected market context.",
    metric: "3 companies",
    detail: "BUMI · BYAN · ITMG",
    companies: ["BUMI", "BYAN", "ITMG"],
    href: "/compare?companies=BUMI,BYAN,ITMG",
  },
  {
    id: "high-production",
    dimension: "operations",
    eyebrow: "PRODUCTION",
    title: "High-volume coal producers",
    description: "Discover companies with large reported FY2024 production volumes.",
    metric: "> 50 Mt",
    detail: "Screen by reported production",
    companies: ["BUMI", "BYAN", "GEMS"],
    href: "/insights",
  },
  {
    id: "sales-production",
    dimension: "operations",
    eyebrow: "PRODUCTION vs SALES",
    title: "Sales above production",
    description: "Find reported company-year records where sales volume exceeds production volume.",
    metric: "Sales > Production",
    detail: "Potential divergence signal",
    companies: ["BUMI"],
    href: "/investigations?symbol=BUMI&path=production-sales",
  },
  {
    id: "strip-ratio",
    dimension: "operations",
    eyebrow: "MINING EFFICIENCY",
    title: "Strip ratio comparison",
    description: "Compare overburden intensity across companies with verified performance data.",
    metric: "Cross-company",
    detail: "FY2024 operational comparison",
    companies: ["ADMR", "BUMI", "BYAN", "GEMS", "ITMG"],
    href: "/insights",
  },
  {
    id: "financials",
    dimension: "financials",
    eyebrow: "FINANCIALS",
    title: "Compare mining economics",
    description: "Explore assets, revenue, cost of revenue and net profit on a common FY2024 basis.",
    metric: "5 companies",
    detail: "Comparable financial dataset",
    companies: ["ADMR", "BUMI", "BYAN", "GEMS", "ITMG"],
    href: "/insights",
  },
  {
    id: "reserves",
    dimension: "resources",
    eyebrow: "RESERVES & RESOURCES",
    title: "Resource depth",
    description: "Discover companies by reported reserves and resources, then compare reserve-to-resource context.",
    metric: "FY2024",
    detail: "Reported mining inventory",
    companies: ["ADMR", "BUMI", "BYAN", "GEMS", "ITMG"],
    href: "/insights",
  },
  {
    id: "product-quality",
    dimension: "products",
    eyebrow: "PRODUCT QUALITY",
    title: "Coal quality spectrum",
    description: "Explore products by calorific value, moisture, ash and sulphur where reported.",
    metric: "kcal/kg",
    detail: "Product-level discovery",
    companies: ["ADMR", "BUMI", "BYAN", "GEMS", "ITMG"],
    href: "/companies",
  },
  {
    id: "sales-destinations",
    dimension: "markets",
    eyebrow: "SALES DESTINATION",
    title: "Where the coal goes",
    description: "Compare reported destination markets and sales volumes across available companies.",
    metric: "4 companies",
    detail: "Country-level sales volume",
    companies: ["BUMI", "BYAN", "GEMS", "ITMG"],
    href: "/companies",
  },
  {
    id: "market-core",
    dimension: "markets",
    eyebrow: "MARKET ACTIVITY",
    title: "Market-observable miners",
    description: "Discover companies with collected daily price, broker and foreign-flow datasets.",
    metric: "3 companies",
    detail: "Market-core dataset available",
    companies: ["BUMI", "BYAN", "ITMG"],
    href: "/today",
  },
  {
    id: "operations-map",
    dimension: "geography",
    eyebrow: "OPERATING FOOTPRINT",
    title: "Mining operations by location",
    description: "Explore companies through reported province, district, key operations and mining sites.",
    metric: "5 companies",
    detail: "Company-detail dataset",
    companies: ["ADMR", "BUMI", "BYAN", "GEMS", "ITMG"],
    href: "/explore?view=map",
  },
  {
    id: "destination-map",
    dimension: "geography",
    eyebrow: "SALES FOOTPRINT",
    title: "Reported sales destinations",
    description: "Discover geographic sales exposure from reported destination observations without inferring domestic or export classification.",
    metric: "Country-level",
    detail: "Reported destination coverage · 4 companies",
    companies: ["BUMI", "BYAN", "GEMS", "ITMG"],
    href: "/explore?view=map",
  },
];

export function ExploreClient({ initialView }: ExploreClientProps) {
  const [view, setView] = useState<ExploreView>(initialView);

  const [dimension, setDimension] =
    useState<DimensionKey>("operations");

  const [query, setQuery] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return (
      new URLSearchParams(window.location.search)
        .get("symbol")
        ?.toUpperCase() ?? ""
    );
  });
  function changeView(nextView: ExploreView) {
    setView(nextView);

    const url = new URL(window.location.href);

    if (nextView === "map") {
      url.searchParams.set("view", "map");
    } else {
      url.searchParams.delete("view");
    }

    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return discoveries.filter((item) => {
      if (item.dimension !== dimension) return false;
      if (!q) return true;

      return [
        item.eyebrow,
        item.title,
        item.description,
        item.metric,
        item.detail,
        ...item.companies,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [dimension, query]);

  const activeDimension = dimensions.find((item) => item.key === dimension)!;

  return (
    <>
      <nav className={styles.viewTabs} aria-label="Explore views">
        <button
          type="button"
          className={view === "discovery" ? styles.activeViewTab : undefined}
          onClick={() => changeView("discovery")}
        >
          Discovery
        </button>

        <button
          type="button"
          className={view === "map" ? styles.activeViewTab : undefined}
          onClick={() => changeView("map")}
        >
          Map
        </button>
      </nav>

      {view === "map" ? (
        <section className={styles.mapView}>
          <div id="explore-mining-map" style={{ scrollMarginTop: "88px" }}>
          <IndonesiaMiningMap />
          </div>
        </section>
      ) : (
        <>
      <section className={styles.dimensionGrid}>
        {dimensions.map((item) => (
          <button
            key={item.key}
            type="button"
            className={dimension === item.key ? styles.activeDimension : undefined}
            onClick={() => {
              setDimension(item.key);
              setQuery("");
            }}
          >
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </button>
        ))}
      </section>

      <section className={styles.workspace}>
        <div className={styles.workspaceHead}>
          <div>
            <span>DISCOVER BY</span>
            <h2>{activeDimension.label}</h2>
            <p>{activeDimension.description}</p>
          </div>

          <div className={styles.searchWrap}>
            <span aria-hidden="true">&#128269;</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${activeDimension.label.toLowerCase()}...`}
              aria-label={`Search ${activeDimension.label}`}
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")}>
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className={styles.resultBar}>
          <span>DISCOVERY PATHS</span>
          <strong>{filtered.length}</strong>
          <p>Only paths supported by collected RX MDI datasets are shown.</p>
        </div>

        {filtered.length ? (
          <section className={styles.discoveryGrid}>
            {filtered.map((item) => {
              const content = (
                <>
                  <div className={styles.cardTop}>
                    <span>{item.eyebrow}</span>
                    <strong>{item.metric}</strong>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className={styles.companyRow}>
                    {item.companies.map((company) => {
                      const companyHref =
                        item.id === "operations-map"
                          ? `/explore?view=map&company=${company}`
                          : item.id === "destination-map"
                            ? `/companies/${company}`
                            : null;

                      return companyHref ? (
                        <Link
                          key={company}
                          href={companyHref}
                          className={styles.companyChip}
                        >
                          {company}
                        </Link>
                      ) : (
                        <span key={company}>{company}</span>
                      );
                    })}
                  </div>
                  <footer>
                    <span>{item.detail}</span>
                    {item.id === "operations-map" ? (
                      <Link
                        href="/explore?view=map"
                        className={styles.exploreAction}
                      >
                        Explore
                      </Link>
                    ) : item.id === "destination-map" ? (
                      <Link
                        href="/companies"
                        className={styles.exploreAction}
                      >
                        Open Companies
                      </Link>
                    ) : item.href ? (
                      <Link
                        href={item.href}
                        className={styles.exploreAction}
                      >
                        Explore
                      </Link>
                    ) : (
                      <b>Explore</b>
                    )}
                  </footer>
                </>
              );

              return (
                <article key={item.id} className={styles.discoveryCard}>
                  {content}
                </article>
              );
            })}
          </section>
        ) : (
          <section className={styles.empty}>
            <strong>No discovery path matched.</strong>
            <p>Try another keyword or choose another mining dimension.</p>
          </section>
        )}
      </section>

      <section className={styles.doctrine}>
        <span>RX MDI DISCOVERY MODEL</span>
        <strong>Company data belongs in Companies. Cross-company discovery belongs here.</strong>
        <p>
          Explore helps users find relationships and comparable mining characteristics before
          moving into deeper company intelligence or investigation.
        </p>
      </section>
        </>
      )}
    </>
  );
}



