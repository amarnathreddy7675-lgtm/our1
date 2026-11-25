"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Pencil, Trash2, Plus, X, PenLine } from "lucide-react";
import { useStore, uid, fmtDate } from "@/lib/store";

type Letter = { id: string; title: string; body: string; date: string; fav: boolean; draft: boolean };
const LAST = "last-letter";
const SAMPLE = `Hey Laddu... ❤️

Nuvvu naa life loki vachaka chala moments special ayyayi.

Manam matladukunna conversations, chinna chinna fights, silly jokes, navvukunna moments... ivanni naaku chala precious.

Ee website mana memories kosam create chesanu.

Mana story lo inka chala beautiful chapters rayalsi unnayi.

With love,
Nee Amarnath ❤️`;
const today = () => new Date().toISOString().slice(0, 10);
const paper = { backgroundImage: "repeating-linear-gradient(transparent, transparent 35px, rgba(167,139,250,.28) 36px)", lineHeight: "36px" };

function Editor({ initial, onClose, onSave }: { initial: Letter | null; onClose: () => void; onSave: (l: Letter) => Promise<void> }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [date, setDate] = useState(initial?.date ?? today());
  const [draft, setDraft] = useState(initial?.draft ?? false);
  const field = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal>
      <form className="max-h-[92dvh] w-full max-w-lg space-y-3 overflow-auto rounded-2xl bg-[#fbf6ea] p-6 text-stone-800"
        onSubmit={async (e) => { e.preventDefault(); if (!body.trim()) return; await onSave({ id: initial?.id ?? uid(), title: title || "Untitled letter", body, date, fav: initial?.fav ?? false, draft }); onClose(); }}>
        <h2 className="font-serif text-3xl">{initial ? "Edit letter" : "Write a letter"}</h2>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" aria-label="Title" className={field} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" className={field} />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={9} placeholder="Hey Laddu..." aria-label="Letter" style={paper} className="w-full rounded-lg bg-white px-3 font-hand text-2xl" />
        <label className="flex items-center gap-2"><input type="checkbox" checked={draft} onChange={(e) => setDraft(e.target.checked)} /> Save as draft</label>
        <div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2">Cancel</button>
          <button className="rounded-full bg-purple px-5 py-2 text-white">Save letter</button></div>
      </form>
    </div>
  );
}

function Reader({ l, onClose }: { l: Letter; onClose: () => void }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal>
      <button aria-label="Close" className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white"><X /></button>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-lg" style={{ perspective: 900 }}>
        <div className="relative h-14 rounded-t-xl bg-[#d9c9a8]">
          <motion.div initial={{ rotateX: 0 }} animate={{ rotateX: 180 }} transition={{ duration: 0.7 }}
            style={{ transformOrigin: "top", clipPath: "polygon(0 0,100% 0,50% 100%)" }} className="absolute inset-x-0 top-0 h-14 bg-[#cdbb97]" />
        </div>
        <motion.article initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55, duration: 0.6 }}
          className="-mt-2 max-h-[70dvh] overflow-auto rounded-b-xl bg-[#fbf6ea] p-7 text-stone-800 shadow-2xl">
          <p className="whitespace-pre-wrap font-hand text-2xl" style={paper}>{l.body}</p>
          <p className="mt-4 text-sm text-stone-500">{fmtDate(l.date)}</p>
        </motion.article>
      </div>
    </motion.div>
  );
}

export default function LetterGallery() {
  const { items, ready, save, remove } = useStore<Letter>("letters");
  const [form, setForm] = useState<Letter | "new" | null>(null);
  const [read, setRead] = useState<Letter | null>(null);
  const [last, setLast] = useState(""); const [saved, setSaved] = useState("");

  useEffect(() => {
    if (!ready) return;
    setLast(items.find((i) => i.id === LAST)?.body ?? "");
    try {
      if (!localStorage.getItem("ou-seeded")) {
        localStorage.setItem("ou-seeded", "1");
        if (!items.length) save({ id: uid(), title: "Hey Laddu", body: SAMPLE, date: "2025-11-27", fav: false, draft: false });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const letters = items.filter((i) => i.id !== LAST).sort((a, b) => b.date.localeCompare(a.date));
  const saveLast = async () => { await save({ id: LAST, title: "The Last Letter", body: last, date: today(), fav: false, draft: false }); setSaved("Saved " + new Date().toLocaleTimeString()); };

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-4xl">Love Letters</h1>
        <button onClick={() => setForm("new")} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-lavender to-pink px-5 py-2.5 font-semibold text-navy">
          <Plus size={18} /> Write a letter
        </button>
      </header>

      <section aria-labelledby="last" className="rounded-3xl bg-[#fbf6ea] p-6 text-stone-800 shadow-[0_0_40px_rgba(167,139,250,.25)]">
        <h2 id="last" className="flex items-center gap-2 font-serif text-3xl"><PenLine size={22} /> The Last Letter</h2>
        <p className="mb-3 text-sm text-stone-500">The final page of our universe. Write it in your own words, and come back to add more anytime.</p>
        <textarea value={last} onChange={(e) => { setLast(e.target.value); setSaved(""); }} rows={10} aria-label="The last letter"
          placeholder="Laddu..." style={paper} className="w-full rounded-lg bg-white px-4 font-hand text-2xl" />
        <div className="mt-3 flex items-center justify-end gap-4">
          <span role="status" className="text-sm text-stone-500">{saved}</span>
          <button onClick={saveLast} className="rounded-full bg-purple px-6 py-2.5 text-white">Save letter</button>
        </div>
      </section>

      {!ready ? null : letters.length === 0 ? (
        <p className="text-center font-hand text-2xl text-white/70">No letters yet. Write the first one.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {letters.map((l) => (
            <motion.div key={l.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} className="group relative">
              <button onClick={() => setRead(l)} aria-label={`Open letter: ${l.title}`} className="relative block h-44 w-full overflow-hidden rounded-xl bg-[#e6d8bb] shadow-xl">
                <span className="absolute inset-x-0 top-0 h-28 bg-[#d6c5a1]" style={{ clipPath: "polygon(0 0,100% 0,50% 100%)" }} />
                <span className="absolute left-1/2 top-[84px] -translate-x-1/2 text-3xl drop-shadow">❤️</span>
                <span className="absolute inset-x-4 bottom-3 text-left font-hand text-2xl text-stone-800">{l.title}</span>
              </button>
              <p className="mt-2 text-sm text-white/60">{fmtDate(l.date)}{l.draft && " · Draft"}</p>
              <div className="absolute right-2 top-2 flex gap-1.5">
                {[["Favorite", <Heart key="h" size={15} className={l.fav ? "fill-pink-500 text-pink-500" : ""} />, () => save({ ...l, fav: !l.fav })],
                  ["Edit", <Pencil key="p" size={15} />, () => setForm(l)],
                  ["Delete", <Trash2 key="t" size={15} />, () => confirm("Delete this letter?") && remove(l.id)]].map(([label, icon, fn]) => (
                  <button key={label as string} aria-label={label as string} onClick={fn as () => void} className="rounded-full bg-white/90 p-1.5 text-stone-700">{icon as React.ReactNode}</button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>{read && <Reader l={read} onClose={() => setRead(null)} />}</AnimatePresence>
      {form && <Editor initial={form === "new" ? null : form} onClose={() => setForm(null)} onSave={save} />}
    </div>
  );
}
