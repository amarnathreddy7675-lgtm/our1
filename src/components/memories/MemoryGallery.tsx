"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Pencil, Trash2, Plus, X, ChevronLeft, ChevronRight, Search, MapPin, Play } from "lucide-react";
import { useStore, uid, fmtDate, readMedia } from "@/lib/store";
import BlobVideo from "@/components/shared/BlobVideo";

type Memory = { id: string; photo: string; caption: string; date: string; location: string; fav: boolean; rot: number; video?: Blob | string };

function Polaroid({ m, onOpen, onFav, onEdit, onDel }: { m: Memory; onOpen: () => void; onFav: () => void; onEdit: () => void; onDel: () => void }) {
  const ctl = "rounded-full bg-white/90 p-1.5 text-stone-700 shadow hover:text-pink-600";
  return (
    <motion.figure layout initial={{ opacity: 0, y: 20, rotate: m.rot }} animate={{ opacity: 1, y: 0, rotate: m.rot }}
      whileHover={{ rotate: 0, scale: 1.05, zIndex: 5 }}
      className="group relative bg-white p-2.5 shadow-[0_8px_22px_rgba(60,40,20,.28)] hover:shadow-[0_16px_34px_rgba(60,40,20,.38)]">
      <button onClick={onOpen} aria-label={`Open photo: ${m.caption || "memory"}`} className="relative block w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={m.photo} alt={m.caption} loading="lazy" className="aspect-square w-full object-cover" />
        {m.video && <span aria-hidden className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white"><Play size={22} /></span>}
      </button>
      <div className="absolute right-4 top-4 flex gap-1.5 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100">
        <button className={ctl} onClick={onFav} aria-label="Favorite"><Heart size={16} className={m.fav ? "fill-pink-500 text-pink-500" : ""} /></button>
        <button className={ctl} onClick={onEdit} aria-label="Edit"><Pencil size={16} /></button>
        <button className={ctl} onClick={onDel} aria-label="Delete"><Trash2 size={16} /></button>
      </div>
      <figcaption className="min-h-[4.5rem] px-1 pb-2 pt-3">
        <p className="font-hand text-xl leading-6 text-stone-800">{m.caption}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 font-sans text-xs text-stone-500">
          {m.date && <span>{fmtDate(m.date)}</span>}
          {m.location && <span className="inline-flex items-center gap-0.5"><MapPin size={11} />{m.location}</span>}
        </p>
      </figcaption>
    </motion.figure>
  );
}

function MemoryForm({ initial, onClose, onSave }: { initial: Memory | null; onClose: () => void; onSave: (m: Memory) => Promise<void> }) {
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState(initial?.caption ?? "");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState(initial?.location ?? "");
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const field = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (initial) { await onSave({ ...initial, caption, date, location }); return onClose(); }
    if (!files.length) return setMsg("Choose at least one photo.");
    setBusy(true);
    try {
      for (let i = 0; i < files.length; i++) {
        setMsg(`Saving ${i + 1} of ${files.length}...`);
        await onSave({ id: uid(), ...(await readMedia(files[i])), caption, date, location, fav: false, rot: Math.round((Math.random() * 8 - 4) * 10) / 10 });
      }
      onClose();
    } catch (err) { setMsg(err instanceof Error ? err.message : "Could not save. Try fewer photos."); setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal>
      <form onSubmit={submit} className="max-h-[90dvh] w-full max-w-md space-y-3 overflow-auto rounded-2xl bg-[#fbf6ea] p-6 text-stone-800">
        <h2 className="font-serif text-3xl">{initial ? "Edit memory" : "Add memory"}</h2>
        {!initial && <input type="file" accept="image/*,video/*" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} className={field} aria-label="Photos" />}
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} placeholder="Ee moment entha special oo cheppalenu Laddu ❤️" className={`${field} font-hand text-xl`} aria-label="Caption" />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} aria-label="Date" />
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (optional)" className={field} aria-label="Location" />
        {msg && <p role="status" className="text-sm text-stone-600">{msg}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2">Cancel</button>
          <button disabled={busy} className="rounded-full bg-purple px-5 py-2 text-white disabled:opacity-60">Save memory</button>
        </div>
      </form>
    </div>
  );
}

export default function MemoryGallery() {
  const { items, ready, save, remove } = useStore<Memory>("memories");
  const [q, setQ] = useState(""); const [year, setYear] = useState("all"); const [favOnly, setFavOnly] = useState(false);
  const [form, setForm] = useState<Memory | "new" | null>(null); const [view, setView] = useState<number | null>(null);

  const years = useMemo(() => [...new Set(items.map((i) => i.date.slice(0, 4)).filter(Boolean))].sort().reverse(), [items]);
  const list = useMemo(() => items
    .filter((i) => (year === "all" || i.date.startsWith(year)) && (!favOnly || i.fav) &&
      `${i.caption} ${i.location}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.date || "").localeCompare(a.date || "")), [items, q, year, favOnly]);

  useEffect(() => {
    if (view === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setView(null);
      if (e.key === "ArrowRight") setView((v) => (v === null ? v : Math.min(list.length - 1, v + 1)));
      if (e.key === "ArrowLeft") setView((v) => (v === null ? v : Math.max(0, v - 1)));
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [view, list.length]);

  const del = (m: Memory) => { if (confirm("Delete this memory?")) remove(m.id); };
  const cur = view !== null ? list[view] : null;

  return (
    <section className="rounded-3xl bg-[linear-gradient(135deg,#f1e7d3,#e8dcc4)] p-4 text-stone-800 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-4xl">Memories</h1>
        <button onClick={() => setForm("new")} className="inline-flex items-center gap-2 rounded-full bg-purple px-5 py-2.5 text-white shadow">
          <Plus size={18} /> Add memory
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <label className="relative min-w-48 flex-1">
          <Search size={16} className="absolute left-3 top-3 text-stone-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search captions or places" aria-label="Search memories"
            className="w-full rounded-full border border-stone-300 bg-white/80 py-2 pl-9 pr-3" />
        </label>
        <select value={year} onChange={(e) => setYear(e.target.value)} aria-label="Filter by year" className="rounded-full border border-stone-300 bg-white/80 px-4 py-2">
          <option value="all">All years</option>{years.map((y) => <option key={y}>{y}</option>)}
        </select>
        <button onClick={() => setFavOnly(!favOnly)} aria-pressed={favOnly}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 ${favOnly ? "border-pink-400 bg-pink-100" : "border-stone-300 bg-white/80"}`}>
          <Heart size={16} className={favOnly ? "fill-pink-500 text-pink-500" : ""} /> Favorites
        </button>
      </div>

      {!ready ? <p className="mt-10 text-center text-stone-500">Loading...</p>
        : list.length === 0 ? (
          <p className="mt-12 text-center font-hand text-2xl text-stone-600">
            {items.length ? "No memories match. Try another search." : "No memories yet. Tap “Add memory” to pin your first Polaroid."}
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((m, i) => (
              <Polaroid key={m.id} m={m} onOpen={() => setView(i)} onEdit={() => setForm(m)} onDel={() => del(m)}
                onFav={() => save({ ...m, fav: !m.fav })} />
            ))}
          </div>
        )}

      <AnimatePresence>
        {cur && (
          <motion.div key="viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4" role="dialog" aria-modal onClick={() => setView(null)}>
            <button aria-label="Close" className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white" onClick={() => setView(null)}><X /></button>
            {view! > 0 && <button aria-label="Previous" className="absolute left-3 rounded-full bg-white/15 p-2 text-white" onClick={(e) => { e.stopPropagation(); setView(view! - 1); }}><ChevronLeft /></button>}
            {view! < list.length - 1 && <button aria-label="Next" className="absolute right-3 rounded-full bg-white/15 p-2 text-white" onClick={(e) => { e.stopPropagation(); setView(view! + 1); }}><ChevronRight /></button>}
            <div onClick={(e) => e.stopPropagation()} className="max-h-[92dvh] max-w-[min(92vw,640px)] bg-white p-3 pb-5 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {cur.video ? <BlobVideo key={cur.id} blob={cur.video} className="max-h-[68dvh] w-full" /> : <img src={cur.photo} alt={cur.caption} className="max-h-[68dvh] w-full object-contain" />}
              <p className="mt-4 px-2 font-hand text-2xl text-stone-800">{cur.caption}</p>
              <p className="px-2 text-sm text-stone-500">{[fmtDate(cur.date), cur.location].filter(Boolean).join(" · ")}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {form && <MemoryForm initial={form === "new" ? null : form} onClose={() => setForm(null)} onSave={save} />}
    </section>
  );
}
