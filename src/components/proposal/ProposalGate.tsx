"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import Stars from "@/components/shared/Stars";

type Stage = "ask" | "yes" | "declined";

export default function ProposalGate() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("ask");
  const [off, setOff] = useState({ x: 0, y: 0 });
  const noRef = useRef<HTMLButtonElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);

  const escape = () => {
    const no = noRef.current, yes = yesRef.current;
    if (!no || !yes) return;
    const r = no.getBoundingClientRect(), y = yes.getBoundingClientRect(), m = 16;
    for (let i = 0; i < 25; i++) {
      const left = m + Math.random() * (window.innerWidth - r.width - 2 * m);
      const top = m + Math.random() * (window.innerHeight - r.height - 2 * m);
      const hitsYes = left < y.right + 24 && left + r.width > y.left - 24 && top < y.bottom + 24 && top + r.height > y.top - 24;
      if (!hitsYes) { setOff((o) => ({ x: o.x + left - r.left, y: o.y + top - r.top })); return; }
    }
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6 text-center">
      <Stars count={90} />
      <AnimatePresence mode="wait">
        {stage !== "yes" ? (
          <motion.section key="ask" exit={{ opacity: 0, scale: 0.96 }} className="max-w-xl">
            <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 2.4 }}
              className="mx-auto mb-6 w-fit text-pink drop-shadow-[0_0_24px_rgba(243,166,200,.8)]">
              <Heart size={56} fill="currentColor" aria-hidden />
            </motion.div>
            <h1 className="font-serif text-5xl sm:text-6xl">Hey Laddu... ❤️</h1>
            <p className="mt-3 text-white/70">One little question before entering our universe...</p>
            <h2 className="mt-8 font-serif text-4xl text-lavender sm:text-5xl">Will You Marry Me? 💍</h2>
            <p className="mt-4 font-hand text-2xl text-pink">Naatho nee life lo inka chala beautiful memories create cheskuntava?</p>
            <div className="mt-10 flex items-center justify-center gap-6">
              <button ref={yesRef} onClick={() => setStage("yes")}
                className="rounded-full bg-gradient-to-r from-lavender to-pink px-8 py-3 font-semibold text-navy shadow-[0_0_30px_rgba(167,139,250,.5)]">
                YES ❤️
              </button>
              <motion.button ref={noRef} animate={off} transition={{ type: "spring", stiffness: 260, damping: 20 }}
                onPointerEnter={escape} onTouchStart={(e) => { e.preventDefault(); escape(); }}
                tabIndex={-1} aria-hidden
                className="glass rounded-full px-8 py-3">
                NO 🙈
              </motion.button>
            </div>
            <button onClick={() => setStage("declined")} className="mt-8 text-sm text-white/50 underline underline-offset-4">
              I'd rather not answer right now
            </button>
            {stage === "declined" && (
              <p role="status" className="mt-4 text-white/70">Okay Laddu, no pressure at all. The universe will wait. 🤍</p>
            )}
          </motion.section>
        ) : (
          <motion.section key="yes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl">
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.span key={i} aria-hidden className="absolute bottom-0 text-2xl"
                style={{ left: `${(i * 37) % 100}%` }}
                initial={{ y: 0, opacity: 0 }} animate={{ y: -window.innerHeight, opacity: [0, 1, 0] }}
                transition={{ duration: 4 + (i % 4), delay: (i % 6) * 0.3, repeat: Infinity }}>
                {i % 2 ? "❤️" : "💖"}
              </motion.span>
            ))}
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring" }}
              className="mx-auto mb-6 text-7xl drop-shadow-[0_0_40px_rgba(243,166,200,.9)]">💍</motion.div>
            <h1 className="font-serif text-5xl">Yayyyy Laddu! ❤️</h1>
            <p className="mt-4 font-hand text-2xl text-pink">Mana journey lo idi oka beautiful moment ga gurthundipovali.</p>
            <button onClick={() => router.push("/overview")}
              className="mt-10 rounded-full bg-gradient-to-r from-lavender to-pink px-8 py-3 font-semibold text-navy">
              ENTER OUR UNIVERSE
            </button>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
