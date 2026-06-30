import type { BracketMatch, ResultsData, ScoreSummary, ScoreBreakdown } from "./types";
import { ROUNDS, ROUND_POINTS } from "./types";

export type MatchStatus = "correct" | "wrong" | "pending" | "future";

export function getMatchStatus(
  match: BracketMatch,
  results: ResultsData | null
): MatchStatus {
  if (!results) return "future";
  const actual = results.matches[match.id];
  if (!actual) return match.predictedWinner ? "pending" : "future";
  if (!match.predictedWinner) return "pending";
  return match.predictedWinner === actual.winner ? "correct" : "wrong";
}

export function calculateScore(
  matches: BracketMatch[],
  results: ResultsData
): ScoreSummary {
  const breakdown: ScoreBreakdown[] = [];
  let totalPoints = 0;
  let maxPossiblePoints = 0;

  for (const round of ROUNDS) {
    const roundMatches = matches.filter((m) =>
      round === "final" ? m.id === "final" : m.id.startsWith(`${round}_`)
    );
    const pts = ROUND_POINTS[round];
    let correct = 0;
    let total = roundMatches.length;
    let maxPts = 0;

    for (const match of roundMatches) {
      const actual = results.matches[match.id];
      if (actual) {
        maxPts += pts;
        if (match.predictedWinner === actual.winner) {
          correct++;
          totalPoints += pts;
        }
      }
    }

    maxPossiblePoints += maxPts;
    breakdown.push({
      round,
      correct,
      total,
      points: correct * pts,
      maxPoints: maxPts,
    });
  }

  return { totalPoints, maxPossiblePoints, breakdown };
}
