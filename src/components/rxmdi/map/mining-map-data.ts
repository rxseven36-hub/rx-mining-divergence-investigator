import type {
  CoalQualityRange,
  MiningMapFeatureCollection,
  MiningSiteRecord,
  MiningTicker,
} from "./mining-map.types";

export const MINING_MAP_GEOJSON_URL =
  "/data/mining-map/indonesia-mining-map-v1.geojson";

export const MINING_SITES_URL =
  "/data/mining-map/indonesia-mining-sites-v1.json";

export const MINING_COMPANIES: readonly MiningTicker[] = [
  "ADMR",
  "BUMI",
  "BYAN",
  "ITMG",
  "GEMS",
] as const;

export async function loadMiningMapGeoJson(): Promise<MiningMapFeatureCollection> {
  const response = await fetch(MINING_MAP_GEOJSON_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load mining map GeoJSON: ${response.status}`,
    );
  }

  return (await response.json()) as MiningMapFeatureCollection;
}

export async function loadMiningSites(): Promise<MiningSiteRecord[]> {
  const response = await fetch(MINING_SITES_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load mining site intelligence: ${response.status}`,
    );
  }

  return (await response.json()) as MiningSiteRecord[];
}

export function findSiteRecord(
  sites: MiningSiteRecord[],
  ticker: string,
  siteSlug: string,
): MiningSiteRecord | null {
  return (
    sites.find(
      (site) =>
        site.ticker === ticker &&
        site.site.slug === siteSlug,
    ) ?? null
  );
}

export function isMappedSite(
  site: MiningSiteRecord,
): boolean {
  return (
    site.map_ready &&
    site.location.latitude !== null &&
    site.location.longitude !== null
  );
}

export function sortSites(
  sites: MiningSiteRecord[],
): MiningSiteRecord[] {
  return [...sites].sort((a, b) =>
    a.site.name.localeCompare(b.site.name),
  );
}

export function formatMt(
  value: number | null | undefined,
): string {
  if (value === null || value === undefined) {
    return "Not available";
  }

  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })} Mt`;
}

export function formatAreaHa(
  value: number | null | undefined,
): string {
  if (value === null || value === undefined) {
    return "Not available";
  }

  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })} ha`;
}

export function formatDate(
  value: string | null | undefined,
): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatCalorificValue(
  value:
    | number
    | CoalQualityRange
    | null
    | undefined,
): string {
  if (value === null || value === undefined) {
    return "Not available";
  }

  if (typeof value === "number") {
    return `${value.toLocaleString("en-US")} kcal/kg`;
  }

  const min = value.min;
  const max = value.max;

  if (min !== null && max !== null) {
    return `${min.toLocaleString("en-US")}–${max.toLocaleString(
      "en-US",
    )} kcal/kg`;
  }

  if (max !== null) {
    return `Up to ${max.toLocaleString("en-US")} kcal/kg`;
  }

  if (min !== null) {
    return `From ${min.toLocaleString("en-US")} kcal/kg`;
  }

  return "Not available";
}
