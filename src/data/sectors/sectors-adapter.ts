/**
 * SectorsAdapter boundary.
 *
 * Runtime direction:
 * REST-FIRST, MCP-READY.
 *
 * Actual API calls are intentionally NOT implemented in Sprint 001.
 */

export interface SectorsAdapter {
  healthCheck(): Promise<boolean>;
}
