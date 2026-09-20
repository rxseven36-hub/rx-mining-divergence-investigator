"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { CompanyFootprintView } from "./CompanyFootprintView";
import {
  isMappedSite,
  loadMiningSites,
} from "./mining-map-data";

import type {
  MiningSiteRecord,
  MiningTicker,
} from "./mining-map.types";

export function CompanyFootprintSection({
  ticker,
}: {
  ticker: MiningTicker;
}) {
  const [sites, setSites] = useState<MiningSiteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    loadMiningSites()
      .then((records) => {
        if (!active) {
          return;
        }

        setSites(
          records.filter(
            (site) =>
              site.ticker === ticker &&
              isMappedSite(site),
          ),
        );
      })
      .catch(() => {
        if (active) {
          setSites([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [ticker]);

  if (loading) {
    return null;
  }

  if (sites.length === 0) {
    return null;
  }

  return (
    <section
      style={{
        margin: "14px 0",
      }}
    >
      <CompanyFootprintView
        ticker={ticker}
        sites={sites}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "-4px",
        }}
      >
        <Link
          href={`/explore?view=map&company=${ticker}`}
          style={{
            color: "#72d5ff",
            fontSize: "12px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Open Full Mining Map →
        </Link>
      </div>
    </section>
  );
}