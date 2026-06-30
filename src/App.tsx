import { useEffect, useState, useCallback, useRef } from "react";
import type { BracketMatch, ResultsData } from "./types";
import {
  buildEmptyBracket,
  propagatePicks,
  encodeState,
  decodeState,
  applyDecodedState,
} from "./bracketLogic";
import { calculateScore } from "./scoring";
import { BracketGrid } from "./components/BracketGrid";
import { ScoreCard } from "./components/ScoreCard";
import { Confetti } from "./components/Confetti";
import { TEAMS } from "./data";

function App() {
  const [matches, setMatches] = useState<BracketMatch[]>(() => {
    const base = buildEmptyBracket();
    const hash = window.location.hash.slice(1);
    if (hash) {
      const picks = decodeState(hash);
      return applyDecodedState(base, picks);
    }
    return base;
  });

  const [results, setResults] = useState<ResultsData | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resultsError, setResultsError] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch actual results
  useEffect(() => {
    fetch("/results.json")
      .then((r) => r.json())
      .then((data: ResultsData) => {
        if (Object.keys(data.matches).length > 0) setResults(data);
      })
      .catch(() => setResultsError(true));
  }, []);

  // Sync URL hash
  useEffect(() => {
    const encoded = encodeState(matches);
    window.history.replaceState(null, "", encoded ? `#${encoded}` : window.location.pathname);
  }, [matches]);

  const handlePick = useCallback((matchId: string, team: string) => {
    setMatches((prev) => {
      const updated = prev.map((m) =>
        m.id === matchId ? { ...m, predictedWinner: team } : m
      );
      return propagatePicks(updated);
    });
    // Fire confetti if final match is being picked
    if (matchId === "final") {
      if (confettiTimer.current) clearTimeout(confettiTimer.current);
      setShowConfetti(true);
      confettiTimer.current = setTimeout(() => setShowConfetti(false), 5000);
    }
  }, []);

  const [showShareModal, setShowShareModal] = useState(false);

  const handleReset = () => {
    setMatches(buildEmptyBracket());
    setShowResults(false);
    setShowConfetti(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback — show modal with the URL
    }
    setShowShareModal(true);
    setTimeout(() => setShowShareModal(false), 8000);
  };

  const hasResults = results !== null && Object.keys(results.matches).length > 0;
  const score = hasResults && showResults ? calculateScore(matches, results) : null;
  const pickedCount = matches.filter((m) => m.predictedWinner !== null).length;
  const finalMatch = matches.find((m) => m.id === "final");
  const champion = finalMatch?.predictedWinner ?? null;
  const championTeam = champion ? TEAMS[champion] : null;

  return (
    <div className="aurora-bg min-h-screen text-white flex flex-col">
      <Confetti active={showConfetti} />

      {/* Champion banner */}
      {champion && championTeam && (
        <div className="relative overflow-hidden bg-gradient-to-r from-yellow-900/60 via-yellow-700/40 to-yellow-900/60 border-b border-yellow-500/30 px-4 py-2 flex items-center justify-center gap-3 text-sm">
          <img src={`https://flagcdn.com/w20/${championTeam.alpha2}.png`} srcSet={`https://flagcdn.com/w40/${championTeam.alpha2}.png 2x`} width={20} height={15} alt={championTeam.name} className="rounded-sm" />
          <span className="font-bold text-yellow-300">
            Your Champion: {championTeam.name}
          </span>
          <img src={`https://flagcdn.com/w20/${championTeam.alpha2}.png`} srcSet={`https://flagcdn.com/w40/${championTeam.alpha2}.png 2x`} width={20} height={15} alt={championTeam.name} className="rounded-sm" />
          {/* Shimmer overlay */}
          <div className="absolute inset-0 winner-shimmer-row pointer-events-none" />
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/8 bg-black/20 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-full px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-black tracking-tight">
              ⚽ <span className="gradient-text">FIFAGuru</span>
            </h1>
            <p className="text-xs text-slate-500">WC 2026 · Knockout Predictor</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 tabular-nums">
              {pickedCount}/31 picks
            </span>

            {hasResults ? (
              <button
                onClick={() => setShowResults((v) => !v)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  showResults
                    ? "bg-green-600 hover:bg-green-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                    : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                }`}
              >
                {showResults ? "✓ Results ON" : "Check Results"}
              </button>
            ) : (
              <span className="text-xs text-slate-600 italic">
                {resultsError ? "Results unavailable" : "Results pending…"}
              </span>
            )}

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200 hover:shadow-[0_0_12px_rgba(59,130,246,0.4)]"
            >
              {copied ? "✓ Copied!" : "Share"}
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-white/8 hover:bg-white/14 text-white transition-all duration-200 border border-white/8"
            >
              Reset
            </button>
          </div>
        </div>

        {hasResults && showResults && results && (
          <div className="px-4 pb-2 text-xs text-slate-600">
            Results as of {new Date(results.updatedAt).toLocaleString()}
          </div>
        )}
      </header>

      {/* Results legend */}
      {showResults && (
        <div className="px-4 py-2 flex gap-5 text-xs border-b border-white/5 bg-black/10 backdrop-blur-sm flex-wrap">
          <span className="flex items-center gap-1.5 text-green-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" /> Correct pick
          </span>
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> Wrong pick
          </span>
          <span className="flex items-center gap-1.5 text-yellow-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500 inline-block" /> Awaiting result
          </span>
        </div>
      )}

      {/* Main bracket */}
      <main className="flex-1 flex gap-4 p-4 overflow-x-auto">
        <div className="flex-1 min-w-0 overflow-x-auto">
          <BracketGrid
            matches={matches}
            results={results}
            showResults={showResults}
            onPick={handlePick}
          />
        </div>

        {showResults && score && (
          <aside className="w-56 shrink-0">
            <ScoreCard score={score} />
          </aside>
        )}
      </main>

      <footer className="text-center text-xs text-slate-700 py-3 border-t border-white/5">
        WC 2026 · Pick · Share · Validate
      </footer>

      {/* Share modal / toast */}
      {showShareModal && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(520px,calc(100vw-2rem))]">
          <div className="rounded-xl border border-white/15 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <span>🔗</span>
                <span>{copied ? "✓ Copied to clipboard!" : "Your shareable prediction link"}</span>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-500 hover:text-slate-300 text-lg leading-none"
              >×</button>
            </div>

            {/* URL display */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono truncate select-all cursor-text">
                {window.location.href}
              </div>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href).catch(() => {});
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
                className="shrink-0 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                {copied ? "✓" : "Copy"}
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Anyone who opens this link will see your exact bracket predictions — no account needed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
