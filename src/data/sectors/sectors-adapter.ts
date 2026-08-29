import {
  SectorsHttpClient,
  type SectorsJsonRequest,
} from "./sectors-http-client";

export interface SectorsAdapter {
  requestJson<T>(
    request: SectorsJsonRequest
  ): Promise<T>;
}

/**
 * Official REST boundary for RX.
 *
 * Intelligence, investigation, and presentation
 * layers must not call Sectors directly.
 */
export class RestSectorsAdapter
  implements SectorsAdapter
{
  constructor(
    private readonly client:
      SectorsHttpClient
  ) {}

  requestJson<T>(
    request: SectorsJsonRequest
  ): Promise<T> {
    return this.client.requestJson<T>(
      request
    );
  }
}