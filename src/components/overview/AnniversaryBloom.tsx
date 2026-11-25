"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Flower2, X } from "lucide-react";

const FIRST = Date.parse("2026-11-27T00:00:00+05:30"); // first anniversary, Asia/Kolkata
const COLORS = ["#a78bfa", "#f3a6c8", "#ddd6fe", "#fbcfe8", "#c4b5fd", "#f9a8d4"];
const FLOWERS = [
  { x: 12, y: 78, s: 120, d: 0.1, a: "#f3a6c8", b: "#fbcfe8" }, { x: 80, y: 80, s: 130, d: 0.3, a: "#a78bfa", b: "#ddd6fe" },
  { x: 46, y: 86, s: 150, d: 0.5, a: "#f9a8d4", b: "#c4b5fd" }, { x: 26, y: 12, s: 90, d: 0.7, a: "#a78bfa", b: "#f3a6c8" },
  { x: 74, y: 10, s: 100, d: 0.9, a: "#fbcfe8", b: "#a78bfa" }, { x: 4, y: 40, s: 80, d: 1.1, a: "#f3a6c8", b: "#ddd6fe" },
  { x: 90, y: 44, s: 85, d: 1.3, a: "#c4b5fd", b: "#f9a8d4" },
];

function Flower({ size, a, b }: { size: number; a: string; b: string }) {
  return (
    <svg viewBox="-50 -50 100 100" width={size} height={size} aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => <ellipse key={i} cx="0" cy="-26" rx="11" ry="24" fill={i % 2 ? a : b} opacity=".93" transform={`rotate(${i * 45})`} />)}
      <circle r="10" fill="#fff4c2" />
    </svg>
  );
}

type Petal = { left: number; size: number; dur: number; delay: number; drift: number; color: string };

export default function AnniversaryBloom() {
  const calm = useReducedMotion();
  const [now, setNow] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [petals, setPetals] = useState<Petal[]>([]);

  const start = () => {
    setPetals(Array.from({ length: 36 }, (_, i) => ({
      left: Math.random() * 100, size: 10 + Math.random() * 14, dur: 6 + Math.random() * 6,
      delay: Math.random() * 6, drift: 30 + Math.random() * 60, color: COLORS[i % COLORS.length],
    })));
    setOpen(true);
  };

  useEffect(() => {
    const t = Date.now(); setNow(t);
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", month: "numeric", day: "numeric" }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    const anniversaryDay = p.month === "11" && p.day === "27" && t >= FIRST;
    const preview = new URLSearchParams(window.location.search).get("bloom") === "1";
    let seen = false; try { seen = !!sessionStorage.getItem("ou-bloom"); sessionStorage.setItem("ou-bloom", "1"); } catch {}
    if (preview || (anniversaryDay && !seen)) start();
  }, []);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [open]);

  if (now === null) return null;
  const reached = now >= FIRST;
  const daysLeft = Math.ceil((FIRST - now) / 86_400_000);

  return (
    <>
      <div className="mt-4 text-center">
        {reached ? (
          <button onClick={start} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-lavender to-pink px-5 py-2 font-semibold text-navy">
            <Flower2 size={18} /> Open our bloom
          </button>
        ) : (
          <p className="text-sm text-white/60">{daysLeft} {daysLeft === 1 ? "day" : "days"} until our first anniversary 🌸</p>
        )}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal aria-label="Anniversary bloom"
            className="fixed inset-0 z-[60] overflow-hidden bg-navy/85 backdrop-blur-sm">
            {!calm && petals.map((p, i) => (
              <motion.span key={i} aria-hidden className="absolute top-0"
                style={{ left: `${p.left}%`, width: p.size, height: p.size * 1.3, background: p.color, borderRadius: "80% 0 80% 0", opacity: 0.9 }}
                animate={{ y: ["-10vh", "110vh"], x: [0, p.drift, -p.drift / 2, 0], rotate: [0, 360] }}
                transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "linear" }} />
            ))}
            {FLOWERS.map((f, i) => (
              <motion.div key={i} aria-hidden className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${f.x}%`, top: `${f.y}%` }}
                initial={{ scale: 0, rotate: -120, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 60, damping: 11, delay: calm ? 0 : f.d }}>
                <Flower size={f.s} a={f.a} b={f.b} />
              </motion.div>
            ))}
            <div className="relative flex h-full items-center justify-center px-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: calm ? 0 : 1.6, duration: 0.8 }}
                className="glass max-w-md bg-navy/60 p-8 text-center">
                <h2 className="font-serif text-4xl sm:text-5xl">Happy 1 Year, Laddu ❤️</h2>
                <p className="mt-3 text-lavender">27 November 2025 – 27 November 2026</p>
                <p className="mt-4 font-hand text-2xl text-pink">Mana story lo inka chala beautiful chapters rayalsi unnayi.</p>
              </motion.div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="absolute right-4 top-4 rounded-full bg-white/15 p-2"><X /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
