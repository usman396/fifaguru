import { useEffect, useRef } from "react";
import type { BracketMatch } from "../types";
import type { MatchStatus } from "../scoring";
import { TEAMS } from "../data";

interface Props {
  match: BracketMatch;
  status: MatchStatus;
  actualWinner?: string | null;
  /** Actual home team derived from results (null = not yet known) */
  actualHome?: string | null;
  /** Actual away team derived from results (null = not yet known) */
  actualAway?: string | null;
  onPick: (matchId: string, team: string) => void;
  showResults: boolean;
  isFinal?: boolean;
}

export function MatchCard({ match, status, actualWinner, actualHome, actualAway, onPick, showResults, isFinal }: Props) {
  // When results are shown, display the real teams derived from the bracket tree.
  // Fall back to predicted teams if actual participants aren't known yet.
  const displayHome = showResults && actualHome != null ? actualHome : match.home;
  const displayAway = showResults && actualAway != null ? actualAway : match.away;
  const teams = [displayHome, displayAway].filter(Boolean) as string[];
  const canPick = teams.length === 2;
  const awaitingPick = canPick && !match.predictedWinner;

  // Ghost pick: user predicted a team that didn't actually make it to this match.
  // Only relevant when we know the actual teams and the user made a pick.
  const pickedIsInMatch = teams.includes(match.predictedWinner ?? "");
  const ghostPick =
    showResults && match.predictedWinner && teams.length > 0 && !pickedIsInMatch
      ? match.predictedWinner
      : null;
  const cardRef = useRef<HTMLDivElement>(null);

  // Shake animation when wrong pick is revealed
  useEffect(() => {
    if (!showResults || status !== "wrong") return;
    const el = cardRef.current;
    if (!el) return;
    el.classList.add("card-shake");
    const t = setTimeout(() => el.classList.remove("card-shake"), 500);
    return () => clearTimeout(t);
  }, [showResults, status]);

  // Card container style
  let containerExtra = "";
  if (showResults) {
    if (status === "correct") containerExtra = "border-green-500/60 bg-green-950/50 card-correct-glow";
    else if (status === "wrong") containerExtra = "border-red-500/50 bg-red-950/40";
    else if (status === "pending") containerExtra = "border-yellow-600/40 bg-yellow-950/30";
    else containerExtra = "border-white/8 bg-white/4";
  } else if (awaitingPick) {
    containerExtra = "border-blue-500/30 bg-white/4 card-pulse-glow";
  } else if (match.predictedWinner) {
    containerExtra = "border-yellow-500/25 bg-white/5";
  } else {
    containerExtra = "border-white/8 bg-white/4";
  }

  const isChampion = isFinal && !!match.predictedWinner;

  return (
    <div
      ref={cardRef}
      className={`rounded-xl border backdrop-blur-md overflow-hidden text-sm transition-all duration-400 ${containerExtra} ${isChampion ? "card-celebrate" : ""}`}
    >
      {teams.length === 0 && (
        <div className="px-3 py-3 text-slate-600 italic text-xs text-center">TBD</div>
      )}

      {teams.map((code) => {
        const team = TEAMS[code];
        const isPicked = match.predictedWinner === code;
        // Only dim the non-picked team when the pick is actually one of the displayed teams.
        // If the pick is a ghost (not in match), both teams stay fully visible.
        const isLoser = pickedIsInMatch && !!(match.predictedWinner && !isPicked);
        const isActualWinner = showResults && actualWinner === code;

        // Badge content & colour
        let badgeContent = "★";
        let badgeClass = "bg-yellow-500 text-black";
        if (showResults && isPicked) {
          if (status === "correct") { badgeContent = "✓"; badgeClass = "bg-green-500 text-white"; }
          else if (status === "wrong") { badgeContent = "✗"; badgeClass = "bg-red-500 text-white"; }
          else { badgeContent = "★"; badgeClass = "bg-yellow-500/80 text-black"; }
        }

        return (
          <button
            key={code}                   /* key change triggers slide-in remount */
            disabled={!canPick}
            onClick={() => canPick && onPick(match.id, code)}
            className={[
              "team-slide-in",
              "w-full flex items-center gap-2.5 px-3 py-2.5 text-left relative overflow-hidden",
              "transition-all duration-300",
              canPick && !isLoser ? "cursor-pointer hover:bg-white/10 active:scale-[0.98]" : "cursor-default",
              isPicked ? "winner-shimmer-row" : "",
              isLoser ? "opacity-30 grayscale" : "",
            ].join(" ")}
          >
            {/* Flag image — works cross-browser, no emoji rendering issues */}
            <span className={`shrink-0 transition-all duration-300 ${isPicked ? "drop-shadow-[0_0_6px_rgba(250,204,21,0.7)]" : ""}`}>
              {team ? (
                <img
                  src={`https://flagcdn.com/w20/${team.alpha2}.png`}
                  srcSet={`https://flagcdn.com/w40/${team.alpha2}.png 2x`}
                  width={isPicked ? 22 : 20}
                  height={isPicked ? 16 : 15}
                  alt={team.name}
                  className="rounded-sm object-cover transition-all duration-300"
                  style={{ imageRendering: "auto" }}
                />
              ) : (
                <span className="text-slate-500 text-sm">?</span>
              )}
            </span>

            {/* Name */}
            <span
              className={`flex-1 truncate transition-all duration-300 ${
                isPicked
                  ? "font-bold text-white"
                  : isLoser
                  ? "text-slate-500"
                  : "font-medium text-slate-200"
              }`}
            >
              {team?.name ?? code}
            </span>

            {/* Badges */}
            <div className="flex items-center gap-1 shrink-0">
              {isPicked && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-bold transition-all duration-200 ${badgeClass}`}
                >
                  {badgeContent}
                </span>
              )}
              {/* Actual winner indicator when not our pick */}
              {isActualWinner && !isPicked && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-green-700/80 text-white font-bold">
                  ✓
                </span>
              )}
            </div>

            {/* Awaiting-pick subtle dot */}
            {awaitingPick && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400/50" />
            )}
          </button>
        );
      })}

      {/* Ghost pick footer — shown when the user's predicted team didn't make it to this match */}
      {ghostPick && (() => {
        const ghostTeam = TEAMS[ghostPick];
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-t border-white/8 bg-black/20">
            <span className="text-[10px] text-slate-500 shrink-0">Your pick:</span>
            {ghostTeam && (
              <img
                src={`https://flagcdn.com/w20/${ghostTeam.alpha2}.png`}
                srcSet={`https://flagcdn.com/w40/${ghostTeam.alpha2}.png 2x`}
                width={14}
                height={10}
                alt={ghostTeam.name}
                className="rounded-sm opacity-40 shrink-0"
              />
            )}
            <span className="text-[10px] text-slate-500 truncate line-through">
              {ghostTeam?.name ?? ghostPick}
            </span>
            <span className="ml-auto text-xs font-bold text-red-400 shrink-0">✗</span>
          </div>
        );
      })()}
    </div>
  );
}

