import type { TruthClass } from "./types";

export type RXSourceProvider = "SECTORS" | "RX_COMPUTED";

export interface RXSourceEvidence {
  id: string;

  provider: RXSourceProvider;

  /**
   * Human-readable source/tool/endpoint identifier.
   *
   * Never store API keys or authorization headers here.
   */
  source: string;

  retrievedAt?: string;

  truthClass: TruthClass;

  /**
   * Optional explanation of how a computed fact was produced
   * or why evidence is classified as UNKNOWN.
   */
  note?: string;
}