"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import ScratchCard from "./ScratchCard";

export type Item = { id: string; photo: string; caption: string; at: number; video?: Blob | string };

export default function ScratchGame({ items, onClose }: { items: Item[]; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const s = items[i];
  const last = i === items.length - 1;
  const next = () => { setI(i + 1); setDone(false); };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-auto bg-[radial-gradient(120%_80%_at_50%_0%,#21133f,#080b1a)] p-4" role="dialog" aria-modal aria-label="Scratch and reveal">
      <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-full bg-white/15 p-2.5"><X /></button>
      <AnimatePresence mode="wait">
        {s ? (
          <motion.div key={s.id} initial={{ opacity: 0, y: 40, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, x: -90, rotate: 5 }} transition={{ duration: 0.5 }} className="w-full max-w-sm">
            <p className="mb-3 text-center text-sm text-white/60" role="status">Photo {i + 1} of {items.length}</p>
            <div className="bg-white p-3 pb-4 shadow-[0_14px_40px_rgba(0,0,0,.5)]">
              <ScratchCard photo={s.photo} video={s.video} alt={s.caption || "Our photo"} revealed={done} onReveal={() => setDone(true)} />
              <div className="flex min-h-20 items-center justify-center px-2 pt-3 text-center">
                {done ? (
                  <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="font-hand text-2xl leading-7 text-stone-800">{s.caption || "❤️"}</motion.p>
                ) : <p className="font-hand text-xl text-stone-400">Scratch to reveal ✨</p>}
              </div>
            </div>
            <div className="mt-5 flex justify-center">
              {done ? (
                <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }} onClick={next}
                  className="rounded-full bg-gradient-to-r from-lavender to-pink px-7 py-3 font-semibold text-navy">{last ? "Finish" : "Next photo"}</motion.button>
              ) : <button onClick={() => setDone(true)} className="text-sm text-white/50 underline underline-offset-4">Reveal for me</button>}
            </div>
          </motion.div>
        ) : (
          <motion.div key="end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md text-center">
            <p className="text-6xl" aria-hidden>🌸</p>
            <h2 className="mt-4 font-serif text-5xl">That's all of us, for now</h2>
            <p className="mt-3 font-hand text-3xl text-pink">Mana story lo inka chala beautiful chapters rayalsi unnayi.</p>
            <div className="mt-8 flex justify-center gap-3">
              <button onClick={() => { setI(0); setDone(false); }} className="rounded-full bg-gradient-to-r from-lavender to-pink px-6 py-2.5 font-semibold text-navy">Play again</button>
              <button onClick={onClose} className="rounded-full bg-white/10 px-6 py-2.5">Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
