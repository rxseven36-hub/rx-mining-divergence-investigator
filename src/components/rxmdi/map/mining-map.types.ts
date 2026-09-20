export type MiningTicker =
  | "ADMR"
  | "BUMI"
  | "BYAN"
  | "ITMG"
  | "GEMS";

export interface MiningMapFeatureProperties {
  ticker: MiningTicker;
  site_name: string;
  site_slug: string;
  operator_name: string;
  operator_slug: string;
  commodity: string | null;
  province: string | null;
  city: string | null;
  resource_ready: boolean;
  production_ready: boolean;
  strip_ratio_ready: boolean;
  license_ready: boolean;
}

export interface MiningMapFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: MiningMapFeatureProperties;
}

export interface MiningMapFeatureCollection {
  type: "FeatureCollection";
  features: MiningMapFeature[];
}

export interface CoalQualityRange {
  min: number | null;
  max: number | null;
}

export interface ResourcesReserves {
  measurement_year?: number | null;
  probable_reserves_Mt?: number | null;
  proven_reserves_Mt?: number | null;
  total_reserves_Mt?: number | null;
  inferred_resources_Mt?: number | null;
  indicated_resources_Mt?: number | null;
  measured_resources_Mt?: number | null;
  total_resources_Mt?: number | null;

  calorific_value_kcal?:
    | number
    | CoalQualityRange
    | null;

  [key: string]: unknown;
}

export interface MiningLicense {
  company_name?: string | null;
  company_slug?: string | null;
  wiup_code?: string | null;
  license_number?: string | null;
  license_type?: string | null;
  activity?: string | null;
  commodity_type?: string | null;
  province?: string | null;
  city?: string | null;
  licensed_area_ha?: number | null;
  effective_date?: string | null;
  expiry_date?: string | null;
  cnc?: string | boolean | null;

  [key: string]: unknown;
}

export interface MiningSiteRecord {
  ticker: MiningTicker;

  site: {
    name: string;
    slug: string;
    year: number | null;
  };

  operator: {
    name: string | null;
    slug: string | null;
  };

  commodity: string | null;

  location: {
    province: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
  };

  map_ready: boolean;

  intelligence: {
    resources_reserves: ResourcesReserves | null;

    production: {
      available: boolean;
      volume: number | null;
      unit: string | null;
    };

    strip_ratio: {
      available: boolean;
      value: number | null;
    };
  };

  licenses: MiningLicense[];

  coverage: {
    map: boolean;
    resources_reserves: boolean;
    production: boolean;
    strip_ratio: boolean;
    license: boolean;
  };
}

export type MiningMapStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error";
