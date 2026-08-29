export type SectorsRequestStatus =
  | "PLANNED"
  | "SUCCESS"
  | "FAILED"
  | "BLOCKED";

export interface SectorsRequestLedgerEntry {
  id: string;

  method: "GET";

  path: string;

  purpose: string;

  estimatedCredits: number;

  status: SectorsRequestStatus;

  httpStatus?: number;
}

export interface BeginLedgerEntryInput {
  path: string;
  purpose: string;
  estimatedCredits: number;
}

export class InMemorySectorsRequestLedger {
  private sequence = 0;

  private readonly entries:
    SectorsRequestLedgerEntry[] = [];

  begin(
    input: BeginLedgerEntryInput
  ): string {
    const id = `sectors-request-${++this.sequence}`;

    this.entries.push({
      id,
      method: "GET",
      path: input.path,
      purpose: input.purpose,
      estimatedCredits: input.estimatedCredits,
      status: "PLANNED",
    });

    return id;
  }

  complete(
    id: string,
    status: "SUCCESS" | "FAILED",
    httpStatus?: number
  ): void {
    const entry = this.entries.find(
      (candidate) => candidate.id === id
    );

    if (!entry) {
      throw new Error(
        `Unknown request ledger entry: ${id}`
      );
    }

    entry.status = status;
    entry.httpStatus = httpStatus;
  }

  blocked(
    input: BeginLedgerEntryInput
  ): string {
    const id = `sectors-request-${++this.sequence}`;

    this.entries.push({
      id,
      method: "GET",
      path: input.path,
      purpose: input.purpose,
      estimatedCredits: input.estimatedCredits,
      status: "BLOCKED",
    });

    return id;
  }

  snapshot(): SectorsRequestLedgerEntry[] {
    return this.entries.map((entry) => ({
      ...entry,
    }));
  }
}