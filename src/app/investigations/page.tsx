import Link from "next/link";

import {
  Suspense,
} from "react";

import ProductionSalesInvestigator from "./ProductionSalesInvestigator";
import SiteLicenseInvestigator from "./SiteLicenseInvestigator";
import ObStripInvestigator from "./ObStripInvestigator";
import ResourcesReservesInvestigator from "./ResourcesReservesInvestigator";
import MarketInvestigator from "./MarketInvestigator";
import CommodityInvestigator from "./CommodityInvestigator";
import ProductQualityInvestigator from "./ProductQualityInvestigator";
import SalesDestinationInvestigator from "./SalesDestinationInvestigator";
import FinancialInvestigator from "./FinancialInvestigator";

import {
  isInvestigationPath,
  type RXInvestigationPath,
} from "../../investigation/investigation-path";

interface InvestigationsPageProps {
  searchParams: Promise<{
    symbol?: string | string[];
    path?: string | string[];
  }>;
}

interface RXFutureInvestigationPath {
  path: string;
  label: string;
  description: string;
}

const READY_PATHS = [
  {
    path: "production-sales",
    label: "Production / Sales",
    description:
      "Investigate the observed relationship between production and sales using the existing deterministic divergence engine and admitted evidence.",
  },

  {
    path: "site-license",
    label: "Site / License",
    description:
      "Investigate mining-site, license, and contract context using admitted operational evidence.",
  },

  {
    path: "ob-strip",
    label: "OB / Strip Ratio",
    description:
      "Investigate admitted overburden-removal and strip-ratio observations using a dedicated deterministic evidence path.",
  },

  {
    path: "resources-reserves",
    label: "Resources / Reserves",
    description:
      "Investigate admitted geological resources and reserves while preserving geological measurement-year semantics.",
  },

  {
    path: "market",
    label: "Market",
    description:
      "Investigate admitted daily closing-price, trading-volume, and market-capitalization evidence across a controlled market period.",
  },

  {
    path: "commodity-context",
    label: "Commodity Context",
    description:
      "Investigate admitted Coal, Gold, Nickel, or Copper price movement as standalone commodity context without manufacturing company causality.",
  },

  {
    path: "product-quality",
    label: "Product Quality",
    description:
      "Investigate admitted mining product-quality evidence while preserving product identity, source min/max ranges, and ARB/ADB basis.",
  },

  {
    path: "sales-destination",
    label: "Sales Destination",
    description:
      "Investigate admitted provider-reported sales-destination evidence without inventing geography classification, missing percentages, concentration scores, or causality.",
  },

  {
    path: "financial",
    label: "Financial",
    description:
      "Inspect admitted provider-supplied financial evidence through the integrated deterministic investigation railway.",
  },
] as const;

const FUTURE_PATHS:
  RXFutureInvestigationPath[] = [







  {
    path: "news-event",
    label: "News / Event",
    description:
      "News and events can strengthen investigation context. RX MDI does not treat them as causal evidence without an admissible investigation path.",
  },
];

function firstValue(
  value:
    string |
    string[] |
    undefined,
): string | null {
  if (
    typeof value === "string"
  ) {
    return value;
  }

  if (
    Array.isArray(value) &&
    typeof value[0] ===
      "string"
  ) {
    return value[0];
  }

  return null;
}

function normalizeSymbol(
  value: string,
): string {
  const normalized =
    value
      .trim()
      .toUpperCase();

  return normalized.length > 0
    ? normalized
    : "BUMI";
}

function InvestigationPathSelector({
  symbol,
}: {
  symbol: string;
}) {
  return (
    <main className="rx-shell">
      <header className="rx-topbar">
        <div className="rx-brand">
          <span className="rx-brand-mark">
            RX
          </span>

          <div>
            <p className="rx-eyebrow">
              RXseven Intelligence
            </p>

            <p className="rx-brand-name">
              Mining Divergence Investigator
            </p>
          </div>
        </div>

        <div className="rx-topbar-status">
          <span className="rx-live-dot" />

          INVESTIGATION ROUTER READY
        </div>
      </header>

      <div className="rx-workspace">
        <section
          style={{
            padding:
              "22px 0 14px",
          }}
        >
          <div className="rx-kicker-row">
            <span className="rx-kicker">
              INVESTIGATION PATHS
            </span>

            <span className="rx-engine-badge">
              {symbol}
            </span>
          </div>

          <h1
            style={{
              margin:
                "10px 0 10px",
              maxWidth:
                760,
              fontSize:
                "clamp(36px, 4.5vw, 60px)",
              lineHeight:
                0.96,
              letterSpacing:
                "-0.045em",
            }}
          >
            What do you want
            {" "}
            to investigate?
          </h1>

          <p
            style={{
              maxWidth:
                760,
              margin:
                "0 0 18px",
              color:
                "#8ba9b8",
              fontSize:
                16,
              lineHeight:
                1.7,
            }}
          >
            RX does not treat every
            question as the same
            investigation. Choose the
            question first. The router
            then selects the correct
            engine and admitted evidence
            boundary.
          </p>
        </section>

        <section
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap:
              14,
            marginBottom:
              34,
          }}
        >
          {READY_PATHS.map(
            (item) => (
              <Link
                key={
                  item.path
                }
                href={
                  `/investigations?symbol=${encodeURIComponent(
                    symbol,
                  )}&path=${item.path}`
                }
                style={{
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  minHeight:
                    180,
                  padding:
                    20,
                  border:
                    "1px solid rgba(54, 225, 181, 0.34)",
                  borderRadius:
                    14,
                  background:
                    "linear-gradient(145deg, rgba(8, 36, 35, 0.86), rgba(5, 16, 22, 0.94))",
                  color:
                    "inherit",
                  textDecoration:
                    "none",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    gap:
                      12,
                    marginBottom:
                      16,
                  }}
                >
                  <span
                    style={{
                      color:
                        "#3fffc5",
                      fontSize:
                        11,
                      fontWeight:
                        900,
                      letterSpacing:
                        ".13em",
                    }}
                  >
                    READY
                  </span>
                </div>

                <h2
                  style={{
                    margin:
                      "0 0 12px",
                    fontSize:
                      25,
                  }}
                >
                  {item.label}
                </h2>

                <p
                  style={{
                    margin:
                      0,
                    color:
                      "#8ba9b8",
                    lineHeight:
                      1.6,
                  }}
                >
                  {item.description}
                </p>

                <strong
                  style={{
                    marginTop:
                      "auto",
                    paddingTop:
                      16,
                    color:
                      "#3fffc5",
                    fontSize:
                      12,
                    letterSpacing:
                      ".08em",
                  }}
                >
                  OPEN INVESTIGATION
                  {" ->"}
                </strong>
              </Link>
            ),
          )}
        </section>

        <section
          style={{
            margin:
              "0 0 40px",
          }}
        >
          <div
            style={{
              display:
                "flex",
              alignItems:
                "end",
              justifyContent:
                "space-between",
              gap:
                20,
              marginBottom:
                16,
            }}
          >
            <div>
              <span className="rx-kicker">
                EVIDENCE PATH BOUNDARY
              </span>

              <h2
                style={{
                  margin:
                    "8px 0 0",
                  fontSize:
                    28,
                }}
              >
                Context-only intelligence
              </h2>
            </div>

            <span
              style={{
                color:
                  "#6f8997",
                fontSize:
                  12,
              }}
            >
              RX WILL NOT FAKE SUPPORT
            </span>
          </div>

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(230px, 1fr))",
              gap:
                10,
            }}
          >
            {FUTURE_PATHS.map(
              (item) => (
                <article
                  key={
                    item.path
                  }
                  style={{
                    minHeight:
                      160,
                    padding:
                      18,
                    border:
                      "1px solid rgba(116, 145, 159, 0.18)",
                    borderRadius:
                      10,
                    background:
                      "rgba(6, 16, 22, 0.54)",
                    opacity:
                      0.72,
                  }}
                >
                  <span
                    style={{
                      color:
                        "#f0ad4e",
                      fontSize:
                        10,
                      fontWeight:
                        900,
                      letterSpacing:
                        ".12em",
                    }}
                  >
                    CONTEXT ONLY
                  </span>

                  <h3
                    style={{
                      margin:
                        "12px 0 8px",
                      fontSize:
                        18,
                    }}
                  >
                    {item.label}
                  </h3>

                  <p
                    style={{
                      margin:
                        0,
                      color:
                        "#7894a2",
                      fontSize:
                        13,
                      lineHeight:
                        1.55,
                    }}
                  >
                    {item.description}
                  </p>
                </article>
              ),
            )}
          </div>
        </section>

        <section
          style={{
            padding:
              "20px 22px",
            marginBottom:
              32,
            border:
              "1px solid rgba(67, 113, 132, 0.28)",
            borderRadius:
              12,
            background:
              "rgba(6, 17, 23, 0.72)",
          }}
        >
          <span className="rx-kicker">
            RX INVESTIGATION RULE
          </span>

          <p
            style={{
              margin:
                "10px 0 0",
              color:
                "#a1b7c2",
              lineHeight:
                1.65,
            }}
          >
            Context selects the
            investigation path.
            The path selects the
            evidence requirements.
            Evidence is admitted before
            analysis. Unsupported
            questions remain unsupported
            rather than being silently
            converted into another
            investigation.
          </p>
        </section>

        <footer className="rx-footer">
          <span>
            RXseven / Mining Divergence Investigator
          </span>

          <span>
            CONTEXT SELECTS | RX PROVES | CAUSALITY STAYS UNKNOWN
          </span>
        </footer>
      </div>
    </main>
  );
}

function UnsupportedInvestigationPath({
  path,
  symbol,
}: {
  path: string;
  symbol: string;
}) {
  return (
    <main className="rx-shell">
      <header className="rx-topbar">
        <div className="rx-brand">
          <span className="rx-brand-mark">
            RX
          </span>

          <div>
            <p className="rx-eyebrow">
              RXseven Intelligence
            </p>

            <p className="rx-brand-name">
              Mining Divergence Investigator
            </p>
          </div>
        </div>

        <div className="rx-topbar-status">
          UNSUPPORTED PATH
        </div>
      </header>

      <div className="rx-workspace">
        <section className="rx-launch">
          <div className="rx-launch-copy">
            <div className="rx-kicker-row">
              <span className="rx-kicker">
                INVESTIGATION ROUTER
              </span>

              <span className="rx-engine-badge">
                HARD BOUNDARY
              </span>
            </div>

            <h1>
              Investigation path
              not supported.
            </h1>

            <p>
              Requested path:
              {" "}
              <strong>
                {path}
              </strong>
            </p>

            <p>
              RX will not silently
              reinterpret this request
              as Production / Sales.
              No investigation API
              request has been made.
            </p>

            <Link
              href={
                `/investigations?symbol=${encodeURIComponent(
                  symbol,
                )}`
              }
              style={{
                display:
                  "inline-block",
                marginTop:
                  20,
                padding:
                  "12px 16px",
                border:
                  "1px solid rgba(54, 225, 181, 0.4)",
                borderRadius:
                  8,
                color:
                  "#3fffc5",
                textDecoration:
                  "none",
                fontSize:
                  12,
                fontWeight:
                  900,
                letterSpacing:
                  ".08em",
              }}
            >
              CHOOSE ANOTHER PATH
            </Link>
          </div>

          <div className="rx-launch-visual">
            <div className="rx-core-mark">
              <span>RX</span>

              <small>
                ROUTER
              </small>
            </div>

            <div className="rx-launch-doctrine">
              <span>
                UNKNOWN CONTEXT.
              </span>

              <strong>
                EXECUTION BLOCKED.
              </strong>

              <small>
                NO SILENT FALLBACK
              </small>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default async function InvestigationsPage({
  searchParams,
}: InvestigationsPageProps) {
  const params =
    await searchParams;

  const requestedSymbol =
    normalizeSymbol(
      firstValue(
        params.symbol,
      ) ?? "BUMI",
    );

  const rawPath =
    firstValue(
      params.path,
    );

  /**
   * No path means:
   * ask the human which investigation
   * they actually want.
   *
   * There is intentionally no default
   * investigation engine here.
   */
  if (
    rawPath === null
  ) {
    return (
      <InvestigationPathSelector
        symbol={
          requestedSymbol
        }
      />
    );
  }

  if (
    rawPath ===
      "financial"
  ) {
    return (
      <FinancialInvestigator
        initialSymbol={
          requestedSymbol
        }
      />
    );
  }

  const resolvedPath:
    RXInvestigationPath | null =
      isInvestigationPath(
        rawPath,
      )
        ? rawPath
        : null;

  if (
    resolvedPath === null
  ) {
    return (
      <UnsupportedInvestigationPath
        path={
          rawPath
        }
        symbol={
          requestedSymbol
        }
      />
    );
  }

  if (
    resolvedPath ===
      "site-license"
  ) {
    return (
      <SiteLicenseInvestigator
        initialSymbol={
          requestedSymbol
        }
      />
    );
  }

  if (
    resolvedPath ===
      "ob-strip"
  ) {
    return (
      <ObStripInvestigator
        initialSymbol={
          requestedSymbol
        }
      />
    );
  }

  if (
    resolvedPath ===
      "resources-reserves"
  ) {
    return (
      <ResourcesReservesInvestigator
        initialSymbol={
          requestedSymbol
        }
      />
    );
  }

  if (
    resolvedPath ===
      "market"
  ) {
    return (
      <MarketInvestigator
        initialSymbol={
          requestedSymbol
        }
      />
    );
  }

  if (
    resolvedPath ===
      "commodity-context"
  ) {
    return (
      <CommodityInvestigator />
    );
  }

  if (
    resolvedPath ===
      "product-quality"
  ) {
    return (
      <ProductQualityInvestigator
        initialSymbol={
          requestedSymbol
        }
      />
    );
  }

  if (
    resolvedPath ===
      "sales-destination"
  ) {
    return (
      <SalesDestinationInvestigator
        initialSymbol={
          requestedSymbol
        }
      />
    );
  }

  return (
    <Suspense
      fallback={
        <main className="rx-shell">
          <div className="rx-workspace">
            <section className="rx-running">
              <strong>
                LOADING PRODUCTION / SALES INVESTIGATOR
              </strong>
            </section>
          </div>
        </main>
      }
    >
      <ProductionSalesInvestigator />
    </Suspense>
  );
}