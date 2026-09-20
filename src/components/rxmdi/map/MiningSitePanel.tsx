"use client";

import {
  formatAreaHa,
  formatCalorificValue,
  formatDate,
  formatMt,
} from "./mining-map-data";

import type {
  MiningSiteRecord,
  MiningTicker,
} from "./mining-map.types";

import styles from "./MiningMap.module.css";

interface MiningSitePanelProps {
  site: MiningSiteRecord | null;
}

interface ListedGroupInfo {
  ticker: MiningTicker;
  company: string;
}

const LISTED_GROUPS: Record<
  MiningTicker,
  ListedGroupInfo
> = {
  ADMR: {
    ticker: "ADMR",
    company: "PT Adaro Minerals Indonesia Tbk",
  },

  BUMI: {
    ticker: "BUMI",
    company: "PT Bumi Resources Tbk",
  },

  BYAN: {
    ticker: "BYAN",
    company: "PT Bayan Resources Tbk",
  },

  ITMG: {
    ticker: "ITMG",
    company: "PT Indo Tambangraya Megah Tbk",
  },

  GEMS: {
    ticker: "GEMS",
    company: "PT Golden Energy Mines Tbk",
  },
};

const COMPANY_VISUALS: Record<
  MiningTicker,
  string
> = {
  ADMR: "/images/mining/gambar tambang 1.jpg",
  BUMI: "/images/mining/gambar tambang 2.webp",
  BYAN: "/images/mining/gambar tambang 3.jpg",
  ITMG: "/images/mining/gambar tambang 4.jpg",
  GEMS: "/images/mining/gamabar tambang 5.jpg",
};
export function MiningSitePanel({
  site,
}: MiningSitePanelProps) {
  if (!site) {
    return (
      <section className={styles.sitePanelEmpty}>
        <span className={styles.eyebrow}>
          SITE INTELLIGENCE
        </span>

        <h3>Select a mining site</h3>

        <p>
          Choose a company or mining site to open its
          verified location, operator context, resources,
          reserves and available intelligence.
        </p>
      </section>
    );
  }

  const rr = site.intelligence.resources_reserves;
  const primaryLicense = site.licenses[0] ?? null;

  const listedGroup =
    LISTED_GROUPS[site.ticker];

  const location = [
    site.location.city,
    site.location.province,
  ]
    .filter(Boolean)
    .join(", ");

  const hasCoordinates =
    site.location.latitude !== null &&
    site.location.longitude !== null;

  return (
    <section className={styles.sitePanel}>
      <div className={styles.siteHero}>
        <div>
          <span className={styles.siteTicker}>
            {site.ticker}
          </span>

          <span className={styles.eyebrow}>
            SITE INTELLIGENCE
          </span>
        </div>

        <span
          className={
            site.map_ready
              ? styles.mappedBadge
              : styles.unmappedBadge
          }
        >
          {site.map_ready
            ? "MAPPED"
            : "NO COORDINATES"}
        </span>
      </div>

      <h3 className={styles.siteTitle}>
        {site.site.name}
      </h3>

      <p className={styles.siteLocation}>
        {location || "Location unavailable"}
      </p>

      <div className={styles.visualIdentity}>
        <div
          className={styles.visualPlaceholder}
          style={{
            backgroundImage: `
              linear-gradient(
                180deg,
                rgba(4, 14, 21, 0.02) 10%,
                rgba(4, 14, 21, 0.18) 48%,
                rgba(4, 14, 21, 0.92) 100%
              ),
              url("${COMPANY_VISUALS[site.ticker]}")
            `,
          }}
        >
          <span>{site.ticker}</span>

          <strong>
            {site.site.name}
          </strong>
        </div>

        <div className={styles.visualIdentityText}>
          <span>Operator</span>

          <strong>
            {site.operator.name ??
              "Not available"}
          </strong>

          <span>Listed Group</span>

          <strong>
            {listedGroup.ticker}
          </strong>

          <small>
            {listedGroup.company}
          </small>

          <em>
            RX MDI ecosystem mapping — not a claim
            that every operator relationship is a
            direct legal holding relationship.
          </em>
        </div>
      </div>

      <div className={styles.identityGrid}>
        <div>
          <span>Commodity</span>
          <strong>
            {site.commodity ?? "Not available"}
          </strong>
        </div>

        <div>
          <span>Location</span>
          <strong>
            {location || "Not available"}
          </strong>
        </div>

        <div>
          <span>Coordinates</span>
          <strong>
            {hasCoordinates
              ? `${site.location.latitude?.toFixed(
                  6,
                )}, ${site.location.longitude?.toFixed(
                  6,
                )}`
              : "Not available"}
          </strong>
        </div>

        <div>
          <span>Map status</span>
          <strong>
            {site.map_ready
              ? "Verified coordinate available"
              : "Coordinate unavailable"}
          </strong>
        </div>
      </div>

      <div className={styles.intelligenceBlock}>
        <div className={styles.blockHeading}>
          <h4>Resources & Reserves</h4>

          <span
            className={
              site.coverage.resources_reserves
                ? styles.readyBadge
                : styles.missingBadge
            }
          >
            {site.coverage.resources_reserves
              ? "AVAILABLE"
              : "DATA GAP"}
          </span>
        </div>

        <div className={styles.metricGrid}>
          <div>
            <span>Total resources</span>
            <strong>
              {formatMt(rr?.total_resources_Mt)}
            </strong>
          </div>

          <div>
            <span>Total reserves</span>
            <strong>
              {formatMt(rr?.total_reserves_Mt)}
            </strong>
          </div>

          <div>
            <span>Measured resources</span>
            <strong>
              {formatMt(rr?.measured_resources_Mt)}
            </strong>
          </div>

          <div>
            <span>Proven reserves</span>
            <strong>
              {formatMt(rr?.proven_reserves_Mt)}
            </strong>
          </div>
        </div>

        <div className={styles.qualityRow}>
          <span>Coal quality</span>

          <strong>
            {formatCalorificValue(
              rr?.calorific_value_kcal,
            )}
          </strong>
        </div>

        {rr?.measurement_year ? (
          <small className={styles.measurementNote}>
            Measurement year: {rr.measurement_year}
          </small>
        ) : null}
      </div>

      <div className={styles.intelligenceBlock}>
        <div className={styles.blockHeading}>
          <h4>Operations</h4>
        </div>

        <div className={styles.metricGrid}>
          <div>
            <span>Production</span>

            <strong>
              {site.intelligence.production.available
                ? `${site.intelligence.production.volume ?? "—"} ${
                    site.intelligence.production.unit ?? ""
                  }`
                : "Not available"}
            </strong>
          </div>

          <div>
            <span>Strip ratio</span>

            <strong>
              {site.intelligence.strip_ratio.available
                ? site.intelligence.strip_ratio.value
                : "Not available"}
            </strong>
          </div>
        </div>
      </div>

      <div className={styles.intelligenceBlock}>
        <div className={styles.blockHeading}>
          <h4>License context</h4>

          <span
            className={
              site.coverage.license
                ? styles.readyBadge
                : styles.missingBadge
            }
          >
            {site.coverage.license
              ? "AVAILABLE"
              : "DATA GAP"}
          </span>
        </div>

        {primaryLicense ? (
          <div className={styles.licenseGrid}>
            <div>
              <span>Type</span>
              <strong>
                {primaryLicense.license_type ??
                  "Not available"}
              </strong>
            </div>

            <div>
              <span>License number</span>
              <strong>
                {primaryLicense.license_number ??
                  "Not available"}
              </strong>
            </div>

            <div>
              <span>WIUP</span>
              <strong>
                {primaryLicense.wiup_code ??
                  "Not available"}
              </strong>
            </div>

            <div>
              <span>Area</span>
              <strong>
                {formatAreaHa(
                  primaryLicense.licensed_area_ha,
                )}
              </strong>
            </div>

            <div>
              <span>Activity</span>
              <strong>
                {primaryLicense.activity ??
                  "Not available"}
              </strong>
            </div>

            <div>
              <span>Expiry</span>
              <strong>
                {formatDate(
                  primaryLicense.expiry_date,
                )}
              </strong>
            </div>
          </div>
        ) : (
          <p className={styles.dataGap}>
            Operator-level license context is
            not available.
          </p>
        )}

        {site.licenses.length > 1 ? (
          <small className={styles.measurementNote}>
            Operator has {site.licenses.length} license
            records. RX MDI does not assume one license
            equals one mining site.
          </small>
        ) : null}
      </div>

      <div className={styles.evidenceNote}>
        RX MDI only displays site-level operational
        values when site-level evidence exists.
        Company production is never distributed
        among mines without supporting evidence.
      </div>
    </section>
  );
}

