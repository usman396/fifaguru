export type TeamCode = string; // ISO 3-letter code, e.g. "BRA"

export interface Team {
  code: TeamCode;
  name: string;
  flag: string; // kept for fallback
  alpha2: string; // ISO 3166-1 alpha-2 for flagcdn.com
}

export interface MatchResult {
  winner: TeamCode;
  score?: string; // e.g. "2-1" or "3-2 (aet)" or "4-3 (pens)"
}

// A match slot in the bracket: two teams + optional chosen winner
export interface BracketMatch {
  id: string; // e.g. "r32_0", "r16_3", "qf_1", "sf_0", "final"
  home: TeamCode | null; // null = TBD
  away: TeamCode | null;
  predictedWinner: TeamCode | null;
}

export type Round = "r32" | "r16" | "qf" | "sf" | "final";

export const ROUNDS: Round[] = ["r32", "r16", "qf", "sf", "final"];

export const ROUND_LABELS: Record<Round, string> = {
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter-Finals",
  sf: "Semi-Finals",
  final: "Final",
};

export const ROUND_POINTS: Record<Round, number> = {
  r32: 1,
  r16: 2,
  qf: 4,
  sf: 8,
  final: 16,
};

// Actual results stored in public/results.json
export interface ResultsData {
  updatedAt: string;
  matches: Record<string, MatchResult>; // keyed by match id
}

export interface ScoreBreakdown {
  round: Round;
  correct: number;
  total: number;
  points: number;
  maxPoints: number;
}

export interface ScoreSummary {
  totalPoints: number;
  maxPossiblePoints: number;
  breakdown: ScoreBreakdown[];
}
