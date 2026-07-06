import type { BracketMatch, ResultsData } from "../types";
import { ROUND_LABELS } from "../types";
import type { Round } from "../types";
import { getMatchStatus } from "../scoring";
import { getActualParticipants } from "../bracketLogic";
import { MatchCard } from "./MatchCard";

interface Props {
  matches: BracketMatch[];
  results: ResultsData | null;
  showResults: boolean;
  onPick: (matchId: string, team: string) => void;
}

const ROUND_ORDER: Round[] = ["r32", "r16", "qf", "sf", "final"];

// Subtle accent colour per round (left border strip)
const ROUND_ACCENTS: Record<Round, string> = {
  r32:   "from-slate-500/20",
  r16:   "from-blue-500/20",
  qf:    "from-violet-500/20",
  sf:    "from-amber-500/20",
  final: "from-yellow-400/30",
};

export function BracketGrid({ matches, results, showResults, onPick }: Props) {
  return (
    <div className="flex flex-col gap-0">
      {/* Sticky header row — one cell per round, all same height */}
      <div className="flex gap-3 sticky top-0 z-10 pb-2">
        {ROUND_ORDER.map((round) => {
          const isFinalRound = round === "final";
          return (
            <div
              key={`hdr-${round}`}
              className={`min-w-[176px] ${isFinalRound ? "min-w-[190px]" : ""} bg-gradient-to-r ${ROUND_ACCENTS[round]} to-transparent rounded-sm border-b border-white/8`}
            >
              <h3 className="text-[11px] font-bold uppercase tracking-widest gradient-text text-center py-2 px-1">
                {ROUND_LABELS[round]}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Cards row */}
      <div className="flex gap-3 overflow-x-auto pb-4 items-start">
        {ROUND_ORDER.map((round) => {
          const roundMatches = matches.filter((m) =>
            round === "final" ? m.id === "final" : m.id.startsWith(`${round}_`)
          );
          const isFinalRound = round === "final";

          return (
            <div
              key={round}
              className={`flex flex-col gap-2 min-w-[176px] ${isFinalRound ? "min-w-[190px]" : ""}`}
            >
              {roundMatches.map((match) => {
                const status = getMatchStatus(match, showResults ? results : null);
                const actualWinner = results?.matches[match.id]?.winner ?? null;
                const [actualHome, actualAway] =
                  results && showResults
                    ? getActualParticipants(match.id, results)
                    : [null, null];
                return (
                  <MatchCard
                    key={match.id}
                    match={match}
                    status={status}
                    actualWinner={showResults ? actualWinner : null}
                    actualHome={actualHome}
                    actualAway={actualAway}
                    onPick={onPick}
                    showResults={showResults}
                    isFinal={isFinalRound}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
