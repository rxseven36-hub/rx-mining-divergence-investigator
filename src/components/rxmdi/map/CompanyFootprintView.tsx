import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";

import type {
  MiningSiteRecord,
  MiningTicker,
} from "./mining-map.types";

import "maplibre-gl/dist/maplibre-gl.css";

const COMPANY_COLORS: Record<MiningTicker, string> = {
  ADMR: "#54c8ff",
  BUMI: "#ffb84a",
  BYAN: "#a987ff",
  ITMG: "#51ddb0",
  GEMS: "#ff6f87",
};

export function CompanyFootprintView({
  ticker,
  sites,
}: {
  ticker: MiningTicker;
  sites: MiningSiteRecord[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const companySites = sites.filter(
      (site) =>
        site.ticker === ticker &&
        site.location.longitude !== null &&
        site.location.latitude !== null,
    );

    if (companySites.length === 0) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,

      style: {
        version: 8,

        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },

        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },

      center: [116.5, -2.5],
      zoom: 4,
      minZoom: 3,
      maxZoom: 12,
      attributionControl: {},
      renderWorldCopies: false,
      interactive: false,
    });

    mapRef.current = map;

    const bounds = new maplibregl.LngLatBounds();
    const markers: maplibregl.Marker[] = [];
    const popups: maplibregl.Popup[] = [];

    companySites.forEach((site) => {
      const lng = site.location.longitude;
      const lat = site.location.latitude;

      if (lng === null || lat === null) {
        return;
      }

      const dot = document.createElement("div");

      dot.style.width = "12px";
      dot.style.height = "12px";
      dot.style.border =
        "2px solid rgba(255,255,255,.96)";
      dot.style.borderRadius = "999px";
      dot.style.background =
        COMPANY_COLORS[ticker] ?? "#58c7ff";
      dot.style.boxShadow =
        "0 1px 4px rgba(0,0,0,.78)";
      dot.style.cursor = "default";
      dot.style.pointerEvents = "auto";

      dot.setAttribute(
        "aria-label",
        `${ticker} ${site.site.name}`,
      );

      const popupContent = document.createElement("div");

      popupContent.style.minWidth = "180px";
      popupContent.style.padding = "10px 12px";
      popupContent.style.background = "#07141c";
      popupContent.style.color = "#dcebf2";
      popupContent.style.fontSize = "11px";
      popupContent.style.lineHeight = "1.45";

      const tickerLabel = document.createElement("span");

      tickerLabel.textContent = ticker;
      tickerLabel.style.display = "block";
      tickerLabel.style.marginBottom = "4px";
      tickerLabel.style.color = COMPANY_COLORS[ticker];
      tickerLabel.style.fontSize = "9px";
      tickerLabel.style.fontWeight = "800";
      tickerLabel.style.letterSpacing = "0.12em";

      const siteName = document.createElement("strong");

      siteName.textContent = site.site.name;
      siteName.style.display = "block";
      siteName.style.color = "#ffffff";
      siteName.style.fontSize = "12px";
      siteName.style.lineHeight = "1.35";

      popupContent.appendChild(tickerLabel);
      popupContent.appendChild(siteName);

      if (site.operator?.name) {
        const operator = document.createElement("span");

        operator.textContent = site.operator.name;
        operator.style.display = "block";
        operator.style.marginTop = "5px";
        operator.style.color = "#b7c9d2";
        operator.style.fontSize = "10px";

        popupContent.appendChild(operator);
      }

      const locationParts = [
        site.location.city,
        site.location.province,
      ].filter(Boolean);

      if (locationParts.length > 0) {
        const location = document.createElement("span");

        location.textContent = locationParts.join(", ");
        location.style.display = "block";
        location.style.marginTop = "3px";
        location.style.color = "#7893a0";
        location.style.fontSize = "9px";

        popupContent.appendChild(location);
      }

      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12,
        className: "rxmdi-footprint-popup",
      }).setDOMContent(popupContent);

      const marker = new maplibregl.Marker({
        element: dot,
        anchor: "center",
      })
        .setLngLat([lng, lat])
        .addTo(map);

      dot.addEventListener("mouseenter", () => {
        popup
          .setLngLat([lng, lat])
          .addTo(map);
      });

      dot.addEventListener("mouseleave", () => {
        popup.remove();
      });

      markers.push(marker);
      popups.push(popup);

      bounds.extend([lng, lat]);
    });

    map.once("load", () => {
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: 54,
          maxZoom: 6.4,
          duration: 0,
        });
      }
    });

    return () => {
      popups.forEach((popup) => popup.remove());
      markers.forEach((marker) => marker.remove());

      map.remove();
      mapRef.current = null;
    };
  }, [sites, ticker]);

  const count = sites.filter(
    (site) =>
      site.ticker === ticker &&
      site.location.longitude !== null &&
      site.location.latitude !== null,
  ).length;

  if (count === 0) {
    return null;
  }

  return (
    <div
      style={{
        margin: "0 0 14px",
        overflow: "hidden",
        border:
          "1px solid rgba(79,196,255,.14)",
        borderRadius: "12px",
        background: "#07141c",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          padding: "11px 13px",
          borderBottom:
            "1px solid rgba(79,196,255,.10)",
        }}
      >
        <div>
          <strong
            style={{
              display: "block",
              color: "#eef8fc",
              fontSize: "13px",
            }}
          >
            {ticker} Company Footprint
          </strong>

          <span
            style={{
              color: "#6f8c9b",
              fontSize: "11px",
            }}
          >
            All mapped sites in one view
          </span>
        </div>

        <span
          style={{
            color: COMPANY_COLORS[ticker],
            fontSize: "11px",
            fontWeight: 800,
          }}
        >
          {count} sites
        </span>
      </div>

      <div
        ref={containerRef}
        aria-label={`${ticker} company footprint map`}
        style={{
          width: "100%",
          height: "220px",
        }}
      />
    </div>
  );
}