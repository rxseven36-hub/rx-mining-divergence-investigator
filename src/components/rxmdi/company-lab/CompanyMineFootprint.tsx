"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

import * as maplibregl from "maplibre-gl";
import type {
  Map as MapLibreMap,
  Marker,
} from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

import {
  isMappedSite,
  loadMiningSites,
} from "../map/mining-map-data";

import styles from "./CompanyLab.module.css";

const BUMI_COLOR = "#ffb84a";

const MINI_MAP_STYLE = {
  version: 8 as const,

  sources: {
    osm: {
      type: "raster" as const,
      tiles: [
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: "© OpenStreetMap contributors",
    },
  },

  layers: [
    {
      id: "rxmdi-company-footprint-map",
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

export default function CompanyMineFootprint() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MINI_MAP_STYLE,
      center: [116.5, -2.5],
      zoom: 4,
      minZoom: 3,
      maxZoom: 12,
      attributionControl: {},
      renderWorldCopies: false,
      interactive: false,
    });

    mapRef.current = map;

    let cancelled = false;

    async function loadBumiFootprint() {
      try {
        const sites = await loadMiningSites();

        if (cancelled) {
          return;
        }

        const bumiSites = sites.filter(
          (site) =>
            site.ticker === "BUMI" &&
            isMappedSite(site),
        );

        if (bumiSites.length === 0) {
          return;
        }

        const bounds =
          new maplibregl.LngLatBounds();

        for (const site of bumiSites) {
          if (
            site.location.longitude === null ||
            site.location.latitude === null
          ) {
            continue;
          }

          const dot = document.createElement("div");

          dot.className = styles.companyFootprintDot;

          dot.title = "";

          dot.style.setProperty(
            "--rx-footprint-color",
            BUMI_COLOR,
          );

          dot.setAttribute(
            "aria-label",
            `BUMI ${site.site.name}`,
          );

          const visualDot = document.createElement("span");
          visualDot.className =
            styles.companyFootprintDotVisual;

          dot.appendChild(visualDot);

          const marker = new maplibregl.Marker({
            element: dot,
            anchor: "center",
          })
            .setLngLat([
              site.location.longitude,
              site.location.latitude,
            ])
            .addTo(map);

          let hoverPopup: maplibregl.Popup | null = null;

          dot.addEventListener("mouseenter", () => {
            if (
              site.location.longitude === null ||
              site.location.latitude === null
            ) {
              return;
            }

            hoverPopup?.remove();

            const lngLat: [number, number] = [
              site.location.longitude,
              site.location.latitude,
            ];

            const point = map.project(lngLat);
            const mapWidth = map.getContainer().clientWidth;
            const mapHeight = map.getContainer().clientHeight;

            let anchor:
              | "top"
              | "bottom"
              | "left"
              | "right" = "bottom";

            if (point.y < 150) {
              anchor = "top";
            } else if (point.y > mapHeight - 150) {
              anchor = "bottom";
            } else if (point.x < 170) {
              anchor = "left";
            } else if (point.x > mapWidth - 170) {
              anchor = "right";
            }

            const content = document.createElement("div");
            content.className =
              styles.companyFootprintPopupContent;

            const ticker = document.createElement("span");
            ticker.className =
              styles.companyFootprintPopupTicker;
            ticker.textContent = "BUMI";

            const title = document.createElement("strong");
            title.textContent = site.site.name;

            const operator = document.createElement("span");
            operator.className =
              styles.companyFootprintPopupOperator;
            operator.textContent =
              site.operator.name ?? "Operator not available";

            const location = document.createElement("small");
            location.textContent = [
              site.location.city,
              site.location.province,
            ]
              .filter(Boolean)
              .join(", ");

            content.append(
              ticker,
              title,
              operator,
              location,
            );

            hoverPopup = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              anchor,
              offset: 22,
              maxWidth: "280px",
            })
              .setDOMContent(content)
              .setLngLat(lngLat)
              .addTo(map);

            const popupContent =
              hoverPopup
                .getElement()
                .querySelector<HTMLElement>(
                  ".maplibregl-popup-content",
                );

            if (popupContent) {
              popupContent.style.minWidth = "210px";
              popupContent.style.maxWidth = "280px";
              popupContent.style.padding = "0";
              popupContent.style.border =
                "1px solid #315161";
              popupContent.style.borderRadius = "12px";
              popupContent.style.background = "#07141c";
              popupContent.style.boxShadow =
                "0 16px 38px rgba(0,0,0,0.60)";
              popupContent.style.overflow = "hidden";
            }
          });

          dot.addEventListener("mouseleave", () => {
            hoverPopup?.remove();
            hoverPopup = null;
          });
          markersRef.current.push(marker);

          bounds.extend([
            site.location.longitude,
            site.location.latitude,
          ]);
        }

        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, {
            padding: 54,
            maxZoom: 6.4,
            duration: 0,
          });
        }
      } catch (error) {
        console.error(
          "Unable to load BUMI mine footprint:",
          error,
        );
      }
    }

    map.on("load", () => {
      void loadBumiFootprint();
    });

    return () => {
      cancelled = true;

      markersRef.current.forEach(
        (marker) => marker.remove(),
      );

      markersRef.current = [];

      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <section className={styles.footprintSection}>
      <div className={styles.footprintHeader}>
        <div>
          <span className={styles.footprintEyebrow}>
            MINE FOOTPRINT
          </span>

          <h2>Where are BUMI&apos;s mines?</h2>

          <p>
            See the geographic footprint of BUMI&apos;s
            validated mining sites before opening the full
            site intelligence map.
          </p>
        </div>

        <div className={styles.footprintStat}>
          <strong>10</strong>
          <span>VALIDATED SITES</span>
        </div>
      </div>

      <div className={styles.footprintMapShell}>
        <div
          ref={containerRef}
          className={styles.footprintMap}
          aria-label="BUMI mining site footprint"
        />

        <div className={styles.footprintBadge}>
          <span
            className={styles.footprintBadgeDot}
          />
          BUMI SITES ONLY
        </div>
      </div>

      <div className={styles.footprintFooter}>
        <div>
          <strong>Geographic context</strong>
          <span>
            Only verified BUMI site coordinates are shown.
          </span>
        </div>

        <Link
          href="/explore?view=map&company=BUMI"
          className={styles.footprintButton}
        >
          Open Full Mining Map →
        </Link>
      </div>
    </section>
  );
}