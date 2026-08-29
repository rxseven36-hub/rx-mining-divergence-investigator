import {
  SectorsClientError,
} from "./sectors-errors";

import {
  SectorsCreditBudget,
} from "./credit-budget";

import {
  InMemorySectorsRequestLedger,
} from "./request-ledger";

export type SectorsFetch = (
  input: string | URL,
  init?: RequestInit
) => Promise<Response>;

export interface SectorsHttpClientOptions {
  apiKey: string;

  baseUrl?: string;

  fetchImpl?: SectorsFetch;

  creditBudget?: SectorsCreditBudget;

  ledger?: InMemorySectorsRequestLedger;
}

export interface SectorsJsonRequest {
  path: string;

  /**
   * Every API request must answer a concrete
   * investigation or reconnaissance question.
   */
  purpose: string;

  /**
   * Estimated request cost based on known endpoint cost.
   *
   * This is a LOCAL guard only.
   * It is not the authoritative Sectors billing balance.
   */
  estimatedCredits: number;
}

export class SectorsHttpClient {
  private readonly apiKey: string;

  private readonly baseUrl: string;

  private readonly fetchImpl: SectorsFetch;

  readonly creditBudget:
    SectorsCreditBudget;

  readonly ledger:
    InMemorySectorsRequestLedger;

  constructor(
    options: SectorsHttpClientOptions
  ) {
    this.apiKey = options.apiKey.trim();

    if (!this.apiKey) {
      throw new SectorsClientError({
        code: "MISSING_API_KEY",
        message:
          "SECTORS API key is required",
      });
    }

    this.baseUrl =
      options.baseUrl ??
      "https://api.sectors.app";

    this.fetchImpl =
      options.fetchImpl ??
      globalThis.fetch.bind(globalThis);

    this.creditBudget =
      options.creditBudget ??
      new SectorsCreditBudget(1);

    this.ledger =
      options.ledger ??
      new InMemorySectorsRequestLedger();
  }

  async requestJson<T>(
    request: SectorsJsonRequest
  ): Promise<T> {
    this.validateRequest(request);

    const ledgerInput = {
      path: request.path,
      purpose: request.purpose,
      estimatedCredits:
        request.estimatedCredits,
    };

    if (
      !this.creditBudget.reserve(
        request.estimatedCredits
      )
    ) {
      this.ledger.blocked(ledgerInput);

      throw new SectorsClientError({
        code: "CREDIT_BUDGET_EXCEEDED",
        message:
          "Local Sectors estimated credit budget exceeded",
      });
    }

    const ledgerId =
      this.ledger.begin(ledgerInput);

    let response: Response;

    try {
      response = await this.fetchImpl(
        `${this.baseUrl}${request.path}`,
        {
          method: "GET",

          headers: {
            Accept: "application/json",

            /**
             * Sectors REST API v2 uses the raw API key
             * in Authorization.
             *
             * DO NOT prefix REST requests with Bearer.
             */
            Authorization: this.apiKey,
          },
        }
      );
    } catch {
      this.ledger.complete(
        ledgerId,
        "FAILED"
      );

      throw new SectorsClientError({
        code: "NETWORK_ERROR",
        message:
          "Sectors request failed before receiving an HTTP response",
      });
    }

    if (!response.ok) {
      this.ledger.complete(
        ledgerId,
        "FAILED",
        response.status
      );

      throw new SectorsClientError({
        code: "HTTP_ERROR",

        message:
          `Sectors returned HTTP ${response.status}`,

        status: response.status,

        retryAfter:
          response.headers.get(
            "retry-after"
          ) ?? undefined,
      });
    }

    let payload: unknown;

    try {
      payload = await response.json();
    } catch {
      this.ledger.complete(
        ledgerId,
        "FAILED",
        response.status
      );

      throw new SectorsClientError({
        code: "INVALID_JSON",
        message:
          "Sectors returned an invalid JSON response",
        status: response.status,
      });
    }

    this.ledger.complete(
      ledgerId,
      "SUCCESS",
      response.status
    );

    return payload as T;
  }

  private validateRequest(
    request: SectorsJsonRequest
  ): void {
    if (!request.path.startsWith("/v2/")) {
      throw new SectorsClientError({
        code: "INVALID_REQUEST",
        message:
          "Only Sectors REST API v2 paths are allowed",
      });
    }

    if (!request.purpose.trim()) {
      throw new SectorsClientError({
        code: "INVALID_REQUEST",
        message:
          "Every Sectors request requires a purpose",
      });
    }

    if (
      !Number.isInteger(
        request.estimatedCredits
      ) ||
      request.estimatedCredits <= 0
    ) {
      throw new SectorsClientError({
        code: "INVALID_REQUEST",
        message:
          "estimatedCredits must be a positive integer",
      });
    }
  }
}