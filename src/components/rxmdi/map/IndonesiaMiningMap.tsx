"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as maplibregl from "maplibre-gl";

import type {
  Map as MapLibreMap,
  Marker,
} from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

import {
  isMappedSite,
  loadMiningSites,
  MINING_COMPANIES,
  sortSites,
} from "./mining-map-data";

import type {
  MiningMapStatus,
  MiningSiteRecord,
  MiningTicker,
} from "./mining-map.types";

import { MiningSitePanel } from "./MiningSitePanel";

import styles from "./MiningMap.module.css";

import { useSearchParams } from "next/navigation";

type CompanyFilter = "ALL" | MiningTicker;

const INDONESIA_BOUNDS = new maplibregl.LngLatBounds(
  [94.5, -11.5],
  [141.5, 6.5],
);

const COMPANY_COLORS: Record<MiningTicker, string> = {
  ADMR: "#54c8ff",
  BUMI: "#ffb84a",
  BYAN: "#a987ff",
  ITMG: "#51ddb0",
  GEMS: "#ff6f87",
};

const BASE_STYLE = {
  version: 8 as const,

  sources: {
    osm: {
      type: "raster" as const,
      tiles: [
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: "OpenStreetMap contributors",
    },
  },

  layers: [
    {
      id: "rxmdi-natural-map",
      type: "raster" as const,
      source: "osm",

      paint: {
        "raster-opacity": 1,
        "raster-brightness-min": 0,
        "raster-brightness-max": 1,
        "raster-saturation": 0,
        "raster-contrast": 0,
      },
    },
  ],
};


export function IndonesiaMiningMap() {
  const searchParams = useSearchParams();

  const requestedCompany = searchParams
    .get("company")
    ?.toUpperCase();

  const requestedTicker: MiningTicker | null =
    requestedCompany &&
    MINING_COMPANIES.includes(
      requestedCompany as MiningTicker,
    )
      ? (requestedCompany as MiningTicker)
      : null;
    const mapSectionRef = useRef<HTMLElement | null>(null);
  const siteIntelligenceRef = useRef<HTMLElement | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(
      null,
  );

  const mapRef = useRef<MapLibreMap | null>(null);

  const markersRef = useRef<Marker[]>([]);
  const activeHoverPopupRef =
    useRef<maplibregl.Popup | null>(null);

  const [status, setStatus] =
    useState<MiningMapStatus>("idle");

  const [mapReady, setMapReady] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [sites, setSites] = useState<
    MiningSiteRecord[]
  >([]);

  const [companyFilter, setCompanyFilter] =
    useState<CompanyFilter>(
      () => requestedTicker ?? "ALL",
    );

  const [selectedSite, setSelectedSite] =
    useState<MiningSiteRecord | null>(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  const mappedSites = useMemo(
    () => sites.filter(isMappedSite),
    [sites],
  );

  const visibleMappedSites = useMemo(() => {
    if (companyFilter === "ALL") {
      return mappedSites;
    }

    return mappedSites.filter(
      (site) => site.ticker === companyFilter,
    );
  }, [companyFilter, mappedSites]);

  const companySites = useMemo(() => {
    if (companyFilter === "ALL") {
      return [];
    }

    return sortSites(
      sites.filter(
        (site) => site.ticker === companyFilter,
      ),
    );
  }, [companyFilter, sites]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return sortSites(
      sites.filter((site) => {
        const haystack = [
          site.ticker,
          site.site.name,
          site.operator.name ?? "",
          site.location.city ?? "",
          site.location.province ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      }),
    ).slice(0, 8);
  }, [searchQuery, sites]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setStatus("loading");

        const siteData = await loadMiningSites();

        if (cancelled) {
          return;
        }

        setSites(siteData);
        setStatus("ready");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setStatus("error");

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load mining map data.",
        );
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

 useEffect(() => {
  if (!mapReady || !requestedTicker) {
    return;
  }

  focusNationalView();
}, [mapReady, requestedTicker]);
  useEffect(() => {
    if (
      status !== "ready" ||
      !mapContainerRef.current ||
      mapRef.current
    ) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: BASE_STYLE,
      center: [118, -2],
      zoom: 3,
      minZoom: 2.5,
      maxZoom: 19,
      attributionControl: {},
      renderWorldCopies: false,
    });

    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
      }),
      "top-right",
    );

    map.on("load", () => {
      map.fitBounds(INDONESIA_BOUNDS, {
        padding: 12,
        maxZoom: 4.25,
        duration: 0,
      });

      setMapReady(true);
    });

    return () => {
      markersRef.current.forEach(
        (marker) => marker.remove(),
      );

      markersRef.current = [];

      map.remove();
      mapRef.current = null;
    };
  }, [status]);

  function focusNationalView() {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    map.flyTo({
      center: [118, -2],
      zoom: 4.0,
      duration: 700,
      essential: true,
    });
  }
  function focusCompany(
    ticker: MiningTicker,
  ) {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const companyMapped = mappedSites.filter(
      (site) => site.ticker === ticker,
    );

    if (companyMapped.length === 0) {
      return;
    }

    if (companyMapped.length === 1) {
      const only = companyMapped[0];

      if (
        only.location.longitude !== null &&
        only.location.latitude !== null
      ) {
        map.flyTo({
          center: [
            only.location.longitude,
            only.location.latitude,
          ],
          zoom: 10.8,
          duration: 900,
          essential: true,
        });
      }

      return;
    }

    const bounds = new maplibregl.LngLatBounds();

    companyMapped.forEach((site) => {
      if (
        site.location.longitude !== null &&
        site.location.latitude !== null
      ) {
        bounds.extend([
          site.location.longitude,
          site.location.latitude,
        ]);
      }
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, {
        padding: 54,
        maxZoom: 6.4,
        duration: 800,
      });
    }
  }

  function selectSite(
    site: MiningSiteRecord,
  ) {
    setCompanyFilter(site.ticker);
    setSelectedSite(site);
    setSearchQuery("");

    const map = mapRef.current;

    if (
      !map ||
      site.location.longitude === null ||
      site.location.latitude === null
    ) {
      return;
    }

    map.flyTo({
      center: [
        site.location.longitude,
        site.location.latitude,
      ],
      zoom: 10.8,
      duration: 1350,
      essential: true,
    });
  }

  function handleCompanyFilter(
    filter: CompanyFilter,
  ) {
    setCompanyFilter(filter);
    setSelectedSite(null);
    setSearchQuery("");

    focusNationalView();
  }

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady) {
      return;
    }

    markersRef.current.forEach(
      (marker) => marker.remove(),
    );

    markersRef.current = [];
    for (const site of visibleMappedSites) {
      if (
        site.location.longitude === null ||
        site.location.latitude === null
      ) {
        continue;
      }

      const isSelected =
        selectedSite?.ticker === site.ticker &&
        selectedSite.site.slug === site.site.slug;

      let marker: Marker;

      if (isSelected) {
        marker = new maplibregl.Marker({
          color: COMPANY_COLORS[site.ticker],
          scale: 1.08,
          anchor: "bottom",
        })
          .setLngLat([
            site.location.longitude,
            site.location.latitude,
          ])
          .addTo(map);

        marker
          .getElement()
          .classList.add(styles.nativeMarkerSelected);
      } else {
        const dot = document.createElement("button");

        dot.type = "button";
        dot.className = styles.mapSiteDot;

        dot.style.setProperty(
          "--rx-site-color",
          COMPANY_COLORS[site.ticker],
        );

        dot.setAttribute(
          "aria-label",
          `${site.ticker} ${site.site.name}`,
        );

        dot.title =
          `${site.ticker} / ${site.site.name}`;

        marker = new maplibregl.Marker({
          element: dot,
          anchor: "center",
        })
          .setLngLat([
            site.location.longitude,
            site.location.latitude,
          ])
          .addTo(map);
      }

      const markerElement = marker.getElement();

      markerElement.title = "";

      markerElement.setAttribute(
        "aria-label",
        `${site.ticker} ${site.site.name}`,
      );

      markerElement.style.cursor = "pointer";
      const tooltipContent = document.createElement("div");
      tooltipContent.className = styles.siteHoverContent;

      const tooltipTicker = document.createElement("span");
      tooltipTicker.className = styles.siteHoverTicker;
      tooltipTicker.textContent = site.ticker;

      const tooltipName = document.createElement("strong");
      tooltipName.textContent = site.site.name;

      const tooltipOperator = document.createElement("span");
      tooltipOperator.className = styles.siteHoverOperator;
      tooltipOperator.textContent =
        site.operator.name ?? "Operator not available";

      const tooltipLocation = document.createElement("small");
      tooltipLocation.textContent = [
        site.location.city,
        site.location.province,
      ]
        .filter(Boolean)
        .join(", ");

      tooltipContent.append(
        tooltipTicker,
        tooltipName,
        tooltipOperator,
        tooltipLocation,
      );



      markerElement.addEventListener("mouseenter", () => {
        if (
          site.location.longitude === null ||
          site.location.latitude === null
        ) {
          return;
        }

        activeHoverPopupRef.current?.remove();
        activeHoverPopupRef.current = null;

        const lngLat: [number, number] = [
          site.location.longitude,
          site.location.latitude,
        ];

        const point = map.project(lngLat);

        const mapWidth =
          map.getContainer().clientWidth;

        const mapHeight =
          map.getContainer().clientHeight;

        let anchor:
          | "top"
          | "bottom"
          | "left"
          | "right" = "bottom";

        /*
        * Near top:
        * popup goes BELOW marker.
        */
        if (point.y < 220) {
          anchor = "top";
        }
        /*
        * Near bottom:
        * popup goes ABOVE marker.
        */
        else if (point.y > mapHeight - 220) {
          anchor = "bottom";
        }
        /*
        * Near left:
        * popup goes RIGHT of marker.
        */
        else if (point.x < 180) {
          anchor = "left";
        }
        /*
        * Near right:
        * popup goes LEFT of marker.
        */
        else if (point.x > mapWidth - 180) {
          anchor = "right";
        }

        activeHoverPopupRef.current = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          anchor,
          offset: 24,
          maxWidth: "290px",
        })
          .setDOMContent(tooltipContent)
          .setLngLat(lngLat)
          .addTo(map);

        /*
        * Force RX MDI popup appearance directly.
        * This avoids CSS-module/global selector conflicts.
        */
        const popupElement =
          activeHoverPopupRef.current.getElement();

        const popupContent =
          popupElement.querySelector<HTMLElement>(
            ".maplibregl-popup-content",
          );

        if (popupContent) {
          popupContent.style.minWidth = "220px";
          popupContent.style.maxWidth = "290px";
          popupContent.style.padding = "0";
          popupContent.style.border =
            "1px solid #315161";
          popupContent.style.borderRadius = "12px";
          popupContent.style.background =
            "#07141c";
          popupContent.style.boxShadow =
            "0 16px 38px rgba(0, 0, 0, 0.6)";
          popupContent.style.overflow = "hidden";
        }
      });

      markerElement.addEventListener("mouseleave", () => {
        activeHoverPopupRef.current?.remove();
        activeHoverPopupRef.current = null;
      });

            markerElement.addEventListener(
              "pointerdown",
              (event) => {
                event.stopPropagation();
              },
            );

            markerElement.addEventListener(
              "click",
              (event) => {
                event.preventDefault();
                event.stopPropagation();

                const isMobile =
                  window.matchMedia("(max-width: 760px)").matches;

                const isSameSite =
                  selectedSite?.ticker === site.ticker &&
                  selectedSite.site.slug === site.site.slug;

                if (isMobile && isSameSite) {
                  setSelectedSite(null);
                  activeHoverPopupRef.current?.remove();
                  activeHoverPopupRef.current = null;
                  return;
                }

                selectSite(site);
              },
            );

            markersRef.current.push(marker);
          }

          return () => {
            markersRef.current.forEach(
              (marker) => marker.remove(),
            );

            markersRef.current = [];
          };
        }, [
          mapReady,
          selectedSite,
          visibleMappedSites,
        ]);

  const knownCount = sites.length;
  const mappedCount = mappedSites.length;

  return (
    <section ref={mapSectionRef} className={styles.shell}>
      <div className={styles.workspace}>
        <div className={styles.mapArea}>
          {status === "loading" ? (
            <div className={styles.state}>
              Loading verified mining sites...
            </div>
          ) : null}

          {status === "error" ? (
            <div className={styles.stateError}>
              <strong>
                Mining map unavailable
              </strong>

              <span>{errorMessage}</span>
            </div>
          ) : null}

          <div
            ref={mapContainerRef}
            className={styles.map}
            aria-label="Indonesia mining map"
          />

          <div className={styles.filters}>
            <button
              type="button"
              className={
                companyFilter === "ALL"
                  ? styles.filterActive
                  : styles.filter
              }
              onClick={() =>
                handleCompanyFilter("ALL")
              }
            >
              ALL / {mappedCount}
            </button>

            {MINING_COMPANIES.map((ticker) => {
              const count = mappedSites.filter(
                (site) => site.ticker === ticker,
              ).length;

              return (
                <button
                  type="button"
                  key={ticker}
                  className={
                    companyFilter === ticker
                      ? styles.filterActive
                      : styles.filter
                  }
                  onClick={() =>
                    handleCompanyFilter(ticker)
                  }
                >
                  <i
                    className={styles.filterDot}
                    style={{
                      background:
                        COMPANY_COLORS[ticker],
                    }}
                  />

                  {ticker} / {count}
                </button>
              );
            })}

            {companyFilter !== "ALL" ? (
              <label className={styles.topSiteSelect}>
                <span>SITE</span>

                <select
                  value={
                    selectedSite?.ticker === companyFilter
                      ? selectedSite.site.slug
                      : ""
                  }
                  onChange={(event) => {
                    const site = companySites.find(
                      (item) =>
                        item.site.slug === event.target.value,
                    );

                    if (site) {
                      selectSite(site);
                    }
                  }}
                >
                  <option value="">Choose mining site...</option>

                  {companySites.map((site) => (
                    <option
                      key={site.site.slug}
                      value={site.site.slug}
                    >
                      {site.site.name}
                      {isMappedSite(site)
                        ? ""
                        : " / no coordinates"}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <span className={styles.visibleCount}>
              {visibleMappedSites.length} mapped sites visible
            </span>
          </div>


          <div className={styles.mapSearch}>
            <span className={styles.searchIcon}>
              SEARCH
            </span>

            <input
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value,
                )
              }
              placeholder="Search site or operator..."
              aria-label="Search mining site or operator"
            />

            {searchResults.length > 0 ? (
              <div
                className={styles.searchResults}
              >
                {searchResults.map((site) => (
                  <button
                    type="button"
                    key={`${site.ticker}-${site.site.slug}`}
                    onClick={() =>
                      selectSite(site)
                    }
                  >
                    <div>
                      <strong>
                        {site.site.name}
                      </strong>

                      <span>
                        {site.operator.name ??
                          "Unknown operator"}
                      </span>
                    </div>

                    <em>{site.ticker}</em>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {selectedSite &&
          selectedSite.location.longitude !== null &&
          selectedSite.location.latitude !== null ? (
            <div className={styles.selectedMapCard}>
              <div className={styles.selectedMapCardTop}>
                <span
                  className={styles.selectedMapDot}
                  style={{
                    background:
                      COMPANY_COLORS[selectedSite.ticker],
                  }}
                />

                <strong>
                  {selectedSite.site.name}
                </strong>

                <em>{selectedSite.ticker}</em>
              </div>

              <span>
                {selectedSite.operator.name ??
                  "Operator not available"}
              </span>

              <small>
                {[
                  selectedSite.location.city,
                  selectedSite.location.province,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </small>

              <button
                type="button"
                onClick={() => {
                  if (
                    window.matchMedia("(max-width: 760px)").matches
                  ) {
                    siteIntelligenceRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                    return;
                  }

                  selectSite(selectedSite);
                }}
              >
                <span className={styles.mobileCloseLabel}>
                  Open Site Intelligence
                </span>
                <span className={styles.desktopFocusLabel}>
                  Focus on this site
                </span>
              </button>
            </div>
          ) : null}

          <div className={styles.mapLegend}>
            <span>
              <b>*</b> verified mapped mine
            </span>

            <span>
              Pin locations use available source coordinates.
              RX MDI never creates fake coordinates for
              unmapped sites.
            </span>
          </div>
        </div>

        {selectedSite ? (
          <aside ref={siteIntelligenceRef} className={styles.sidebar}>
            <MiningSitePanel
              site={selectedSite}
            />
          </aside>
        ) : null}
      </div>
     </section>
  );
}
