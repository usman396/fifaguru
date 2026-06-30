import { useMemo } from "react";

const COLORS = [
  "#22c55e", "#3b82f6", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#facc15",
];

interface Piece {
  id: number;
  color: string;
  left: string;
  delay: string;
  duration: string;
  width: string;
  height: string;
  borderRadius: string;
}

// Generate once — stable across re-renders
function generatePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    left: `${(i / count) * 100 + (Math.sin(i * 2.1) * 5)}%`,
    delay: `${(i * 0.07) % 2.5}s`,
    duration: `${2.2 + (i % 5) * 0.4}s`,
    width: `${6 + (i % 4) * 3}px`,
    height: `${8 + (i % 3) * 4}px`,
    borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0",
  }));
}

export function Confetti({ active }: { active: boolean }) {
  const pieces = useMemo(() => generatePieces(80), []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0"
          style={{
            left: p.left,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            borderRadius: p.borderRadius,
            animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
