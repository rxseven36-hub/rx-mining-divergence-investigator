export interface SectorsCreditBudgetSnapshot {
  maxEstimatedCredits: number;
  reservedEstimatedCredits: number;
  remainingEstimatedCredits: number;
}

/**
 * Local safety budget.
 *
 * This is NOT the authoritative Sectors account balance.
 * It only limits how many estimated credits RX is allowed
 * to attempt within the current process/run.
 */
export class SectorsCreditBudget {
  private reservedEstimatedCredits = 0;

  constructor(
    private readonly maxEstimatedCredits: number
  ) {
    if (
      !Number.isInteger(maxEstimatedCredits) ||
      maxEstimatedCredits < 0
    ) {
      throw new Error(
        "maxEstimatedCredits must be a non-negative integer"
      );
    }
  }

  canReserve(cost: number): boolean {
    if (!Number.isInteger(cost) || cost <= 0) {
      return false;
    }

    return (
      this.reservedEstimatedCredits + cost <=
      this.maxEstimatedCredits
    );
  }

  reserve(cost: number): boolean {
    if (!this.canReserve(cost)) {
      return false;
    }

    this.reservedEstimatedCredits += cost;

    return true;
  }

  snapshot(): SectorsCreditBudgetSnapshot {
    return {
      maxEstimatedCredits: this.maxEstimatedCredits,

      reservedEstimatedCredits:
        this.reservedEstimatedCredits,

      remainingEstimatedCredits:
        this.maxEstimatedCredits -
        this.reservedEstimatedCredits,
    };
  }
}