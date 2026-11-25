"use client";
import { useEffect, useState } from "react";

const START = Date.parse("2025-11-27T00:00:00+05:30"); // midnight Asia/Kolkata

export default function RelationshipCounter() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return <div className="h-28" aria-hidden />;
  const ms = Math.max(0, now - START);
  const days = Math.floor(ms / 86_400_000);
  const rest = [Math.floor(ms / 3_600_000) % 24, Math.floor(ms / 60_000) % 60, Math.floor(ms / 1000) % 60];
  return (
    <div className="text-center">
      <p className="font-serif text-7xl text-pink drop-shadow-[0_0_20px_rgba(243,166,200,.5)]">{days}</p>
      <p className="text-white/70">days together</p>
      <p className="mt-2 font-hand text-2xl text-lavender" aria-hidden>
        {rest.map((n) => String(n).padStart(2, "0")).join(" : ")}
      </p>
    </div>
  );
}
