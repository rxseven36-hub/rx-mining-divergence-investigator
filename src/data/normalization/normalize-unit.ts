import type { RXUnit } from "@/types/metrics";

const UNIT_MAP: Record<string, RXUnit> = {
  mt: {
    symbol: "Mt",
    dimension: "MASS",
  },

  wmt: {
    symbol: "wmt",
    dimension: "MASS",
  },

  dmt: {
    symbol: "dmt",
    dimension: "MASS",
  },

  tni: {
    symbol: "TNi",
    dimension: "CONTAINED_METAL",
  },

  koz: {
    symbol: "koz",
    dimension: "CONTAINED_METAL",
  },

  kton: {
    symbol: "kton",
    dimension: "MASS",
  },
};

export function normalizeUnit(raw: string | null | undefined): RXUnit {
  if (!raw) {
    return {
      symbol: "UNKNOWN",
      dimension: "UNKNOWN",
    };
  }

  const normalized = UNIT_MAP[raw.trim().toLowerCase()];

  if (!normalized) {
    return {
      symbol: raw,
      dimension: "UNKNOWN",
      raw,
    };
  }

  return {
    ...normalized,
    raw,
  };
}