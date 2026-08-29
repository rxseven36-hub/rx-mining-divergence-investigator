import type { RXCommodity } from "@/types/commodity";

const COMMODITY_MAP: Record<string, RXCommodity> = {
  coal: "COAL",
  gold: "GOLD",
  nickel: "NICKEL",
  copper: "COPPER",
};

export function normalizeCommodity(
  raw: string | null | undefined
): RXCommodity | null {
  if (!raw) {
    return null;
  }

  return COMMODITY_MAP[raw.trim().toLowerCase()] ?? null;
}