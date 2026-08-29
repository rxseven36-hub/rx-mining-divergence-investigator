export const RX_COMMODITIES = [
  "COAL",
  "GOLD",
  "NICKEL",
  "COPPER",
] as const;

export type RXCommodity = (typeof RX_COMMODITIES)[number];

export function isRXCommodity(value: string): value is RXCommodity {
  return RX_COMMODITIES.includes(value as RXCommodity);
}