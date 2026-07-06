import type { BracketMatch, Round, ResultsData } from "./types";
import { ROUNDS } from "./types";
import { R32_MATCHUPS } from "./data";

// Total matches per round
const MATCH_COUNTS: Record<Round, number> = {
  r32: 16,
  r16: 8,
  qf: 4,
  sf: 2,
  final: 1,
};

export function buildEmptyBracket(): BracketMatch[] {
  const matches: BracketMatch[] = [];
  for (const round of ROUNDS) {
    const count = MATCH_COUNTS[round];
    for (let i = 0; i < count; i++) {
      const id = round === "final" ? "final" : `${round}_${i}`;
      const home =
        round === "r32" ? R32_MATCHUPS[i][0] : null;
      const away =
        round === "r32" ? R32_MATCHUPS[i][1] : null;
      matches.push({ id, home, away, predictedWinner: null });
    }
  }
  return matches;
}

// Propagate winners through the bracket after a pick
export function propagatePicks(matches: BracketMatch[]): BracketMatch[] {
  const updated = matches.map((m) => ({ ...m }));

  const byId = (id: string) => updated.find((m) => m.id === id)!;

  // r32 winners → r16 slots
  for (let i = 0; i < 8; i++) {
    const a = byId(`r32_${i * 2}`);
    const b = byId(`r32_${i * 2 + 1}`);
    const target = byId(`r16_${i}`);
    const newHome = a.predictedWinner ?? null;
    const newAway = b.predictedWinner ?? null;
    if (target.home !== newHome || target.away !== newAway) {
      target.home = newHome;
      target.away = newAway;
      // Clear dependent picks if team changed
      if (
        target.predictedWinner &&
        target.predictedWinner !== newHome &&
        target.predictedWinner !== newAway
      ) {
        target.predictedWinner = null;
      }
    }
  }

  // r16 winners → qf slots
  for (let i = 0; i < 4; i++) {
    const a = byId(`r16_${i * 2}`);
    const b = byId(`r16_${i * 2 + 1}`);
    const target = byId(`qf_${i}`);
    const newHome = a.predictedWinner ?? null;
    const newAway = b.predictedWinner ?? null;
    if (target.home !== newHome || target.away !== newAway) {
      target.home = newHome;
      target.away = newAway;
      if (
        target.predictedWinner &&
        target.predictedWinner !== newHome &&
        target.predictedWinner !== newAway
      ) {
        target.predictedWinner = null;
      }
    }
  }

  // qf winners → sf slots
  for (let i = 0; i < 2; i++) {
    const a = byId(`qf_${i * 2}`);
    const b = byId(`qf_${i * 2 + 1}`);
    const target = byId(`sf_${i}`);
    const newHome = a.predictedWinner ?? null;
    const newAway = b.predictedWinner ?? null;
    if (target.home !== newHome || target.away !== newAway) {
      target.home = newHome;
      target.away = newAway;
      if (
        target.predictedWinner &&
        target.predictedWinner !== newHome &&
        target.predictedWinner !== newAway
      ) {
        target.predictedWinner = null;
      }
    }
  }

  // sf winners → final
  const sf0 = byId("sf_0");
  const sf1 = byId("sf_1");
  const fin = byId("final");
  const newHome = sf0.predictedWinner ?? null;
  const newAway = sf1.predictedWinner ?? null;
  if (fin.home !== newHome || fin.away !== newAway) {
    fin.home = newHome;
    fin.away = newAway;
    if (
      fin.predictedWinner &&
      fin.predictedWinner !== newHome &&
      fin.predictedWinner !== newAway
    ) {
      fin.predictedWinner = null;
    }
  }

  return updated;
}

// --- URL encoding ---
// Encode only predictedWinner for each match in order
// Format: base64url of comma-separated winners (empty string if null)
export function encodeState(matches: BracketMatch[]): string {
  const picks = matches
    .filter((m) => m.predictedWinner !== null)
    .map((m) => `${m.id}:${m.predictedWinner}`)
    .join(",");
  return btoa(picks).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function decodeState(encoded: string): Record<string, string> {
  try {
    // Restore base64url → standard base64, then re-add stripped padding
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const pad = (4 - (b64.length % 4)) % 4; // 0, 1, or 2 — never 3 for valid input
    const raw = atob(b64 + "=".repeat(pad));
    const result: Record<string, string> = {};
    for (const entry of raw.split(",")) {
      const colon = entry.indexOf(":");
      if (colon === -1) continue;
      const id = entry.slice(0, colon);
      const winner = entry.slice(colon + 1);
      if (id && winner) result[id] = winner;
    }
    return result;
  } catch {
    return {};
  }
}

export function applyDecodedState(
  matches: BracketMatch[],
  picks: Record<string, string>
): BracketMatch[] {
  let updated: BracketMatch[] = matches.map((m) => ({
    ...m,
    predictedWinner: picks[m.id] ?? null,
  }));
  // Re-propagate to fill in team slots for later rounds
  updated = propagatePicks(updated);
  return updated;
}

/**
 * Derive the actual teams that play in a given match slot by tracing
 * the bracket tree through results.json.
 *
 * - r32: always fixed from R32_MATCHUPS
 * - r16_N: winner of r32_(2N) vs winner of r32_(2N+1)
 * - qf_N:  winner of r16_(2N) vs winner of r16_(2N+1)
 * - sf_N:  winner of qf_(2N)  vs winner of qf_(2N+1)
 * - final: winner of sf_0     vs winner of sf_1
 *
 * Returns [null, null] if the feeder results are not yet available.
 */
export function getActualParticipants(
  matchId: string,
  results: ResultsData
): [string | null, string | null] {
  if (matchId.startsWith("r32_")) {
    const idx = parseInt(matchId.split("_")[1]);
    return [R32_MATCHUPS[idx][0], R32_MATCHUPS[idx][1]];
  }

  let homeFeeder: string;
  let awayFeeder: string;

  if (matchId.startsWith("r16_")) {
    const i = parseInt(matchId.split("_")[1]);
    homeFeeder = `r32_${i * 2}`;
    awayFeeder = `r32_${i * 2 + 1}`;
  } else if (matchId.startsWith("qf_")) {
    const i = parseInt(matchId.split("_")[1]);
    homeFeeder = `r16_${i * 2}`;
    awayFeeder = `r16_${i * 2 + 1}`;
  } else if (matchId.startsWith("sf_")) {
    const i = parseInt(matchId.split("_")[1]);
    homeFeeder = `qf_${i * 2}`;
    awayFeeder = `qf_${i * 2 + 1}`;
  } else if (matchId === "final") {
    homeFeeder = "sf_0";
    awayFeeder = "sf_1";
  } else {
    return [null, null];
  }

  const home = results.matches[homeFeeder]?.winner ?? null;
  const away = results.matches[awayFeeder]?.winner ?? null;
  return [home, away];
}
