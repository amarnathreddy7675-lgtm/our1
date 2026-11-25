"use client";
import { useEffect, useState } from "react";

export default function Stars({ count = 70 }: { count?: number }) {
  const [stars, setStars] = useState<{ x: number; y: number; s: number; d: number }[]>([]);
  useEffect(() => {
    setStars(Array.from({ length: count }, () => ({
      x: Math.random() * 100, y: Math.random() * 100, s: 1 + Math.random() * 2, d: Math.random() * 4,
    })));
  }, [count]);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {stars.map((st, i) => (
        <span key={i} className="star" style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s, animationDelay: `${st.d}s` }} />
      ))}
    </div>
  );
}
