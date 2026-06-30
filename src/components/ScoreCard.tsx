import { useEffect, useRef, useState } from "react";
import type { ScoreSummary } from "../types";
import { ROUND_LABELS } from "../types";

function useCountUp(target: number, duration = 700) {
  const [current, setCurrent] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    const diff = target - from;
    if (diff === 0) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(Math.round(from + diff * eased));
      if (t < 1) requestAnimationFrame(tick);
      else prev.current = target;
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return current;
}

interface Props {
  score: ScoreSummary;
}

export function ScoreCard({ score }: Props) {
  const animPts = useCountUp(score.totalPoints);
  const animMax = useCountUp(score.maxPossiblePoints);
  const pct = score.maxPossiblePoints > 0
    ? Math.round((score.totalPoints / score.maxPossiblePoints) * 100)
    : 0;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Your Score
        </span>
        <span className="text-2xl font-black text-white tabular-nums">
          {animPts}
          <span className="text-sm text-slate-400 font-normal">
            {" "}/ {animMax} pts
          </span>
        </span>
      </div>

      {/* Animated progress bar */}
      <div className="h-2 rounded-full bg-slate-700/60 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: pct > 66
              ? "linear-gradient(90deg, #22c55e, #86efac)"
              : pct > 33
              ? "linear-gradient(90deg, #f59e0b, #fde68a)"
              : "linear-gradient(90deg, #ef4444, #fca5a5)",
          }}
        />
      </div>
      <p className="text-right text-xs text-slate-500">{pct}% accuracy</p>

      {/* Per-round breakdown */}
      <table className="w-full text-xs text-slate-300">
        <thead>
          <tr className="text-slate-500 uppercase tracking-wide">
            <th className="text-left py-1">Round</th>
            <th className="text-right py-1">✓/Total</th>
            <th className="text-right py-1">Pts</th>
          </tr>
        </thead>
        <tbody>
          {score.breakdown.map((row) => (
            <tr key={row.round} className="border-t border-white/5">
              <td className="py-1.5 text-slate-400">{ROUND_LABELS[row.round]}</td>
              <td className="text-right">
                {row.maxPoints > 0 ? (
                  <span className={
                    row.correct === row.total && row.total > 0
                      ? "text-green-400 font-semibold"
                      : row.correct > 0
                      ? "text-yellow-400"
                      : "text-slate-500"
                  }>
                    {row.correct}/{row.total}
                  </span>
                ) : (
                  <span className="text-slate-600">–</span>
                )}
              </td>
              <td className="text-right font-mono">
                {row.maxPoints > 0 ? (
                  <span className={row.points > 0 ? "text-green-400 font-semibold" : "text-slate-500"}>
                    {row.points}
                  </span>
                ) : (
                  <span className="text-slate-600">–</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-slate-600 text-center pt-1">
        R32=1 · R16=2 · QF=4 · SF=8 · Final=16
      </p>
    </div>
  );
}

