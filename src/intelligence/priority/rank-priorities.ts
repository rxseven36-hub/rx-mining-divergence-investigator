import type {
  RXPriorityResult,
} from "./priority-result";

/**
 * Returns only SCORABLE cases, sorted by descending
 * deterministic priority score.
 *
 * Tie-breakers are deterministic so repeated runs over
 * the same evidence produce the same queue.
 */
export function rankPriorities(
  results: RXPriorityResult[]
): RXPriorityResult[] {
  const scorable =
    results.filter(
      (
        result
      ): result is RXPriorityResult & {
        status: "SCORABLE";
        score: number;
      } =>
        result.status === "SCORABLE" &&
        result.score !== null &&
        Number.isFinite(result.score)
    );

  const sorted = [...scorable].sort(
    (a, b) => {
      const scoreDifference =
        b.score - a.score;

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      const companyDifference =
        a.companyId.localeCompare(
          b.companyId
        );

      if (companyDifference !== 0) {
        return companyDifference;
      }

      const commodityDifference =
        a.commodity.localeCompare(
          b.commodity
        );

      if (commodityDifference !== 0) {
        return commodityDifference;
      }

      return a.periodLabel.localeCompare(
        b.periodLabel
      );
    }
  );

  return sorted.map(
    (result, index) => ({
      ...result,
      rank: index + 1,
    })
  );
}