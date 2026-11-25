"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { useStore, uid, fmtDate, shrink } from "@/lib/store";

type Ev = { id: string; title: string; date: string; description: string; location: string; photo: string };

function EventForm({ initial, onClose, onSave }: { initial: Ev | null; onClose: () => void; onSave: (e: Ev) => Promise<void> }) {
  const [f, setF] = useState<Ev>(initial ?? { id: uid(), title: "", date: new Date().toISOString().slice(0, 10), description: "", location: "", photo: "" });
  const [msg, setMsg] = useState("");
  const field = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2";
  const set = (k: keyof Ev, v: string) => setF((p) => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal>
      <form className="max-h-[92dvh] w-full max-w-md space-y-3 overflow-auto rounded-2xl bg-[#fbf6ea] p-6 text-stone-800"
        onSubmit={async (e) => { e.preventDefault(); if (!f.title.trim()) return setMsg("Add a title."); await onSave(f); onClose(); }}>
        <h2 className="font-serif text-3xl">{initial ? "Edit milestone" : "Add milestone"}</h2>
        <input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Title" aria-label="Title" className={field} />
        <input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} aria-label="Date" className={field} />
        <input value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Location (optional)" aria-label="Location" className={field} />
        <textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="Aa roju manam..." aria-label="Description" className={`${field} font-hand text-xl`} />
        <input type="file" accept="image/*" aria-label="Photo" className={field}
          onChange={async (e) => { const file = e.target.files?.[0]; if (file) try { set("photo", await shrink(file)); } catch { setMsg("Could not read that photo."); } }} />
        {msg && <p role="status" className="text-sm text-red-700">{msg}</p>}
        <div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2">Cancel</button>
          <button className="rounded-full bg-purple px-5 py-2 text-white">Save milestone</button></div>
      </form>
    </div>
  );
}

export default function Timeline() {
  const { items, ready, save, remove } = useStore<Ev>("events");
  const [form, setForm] = useState<Ev | "new" | null>(null);
  const list = [...items].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-4xl">Our Story</h1>
        <button onClick={() => setForm("new")} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-lavender to-pink px-5 py-2.5 font-semibold text-navy">
          <Plus size={18} /> Add milestone
        </button>
      </header>
      {ready && list.length === 0 && (
        <p className="mt-12 text-center font-hand text-2xl text-white/70">Our story starts here. Add the first milestone, like the day we met.</p>
      )}
      <ol className="relative mt-10 ml-3 space-y-8 border-l border-lavender/40">
        {list.map((ev) => (
          <motion.li key={ev.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} className="relative ml-6">
            <span className="absolute -left-[31px] top-6 h-3 w-3 rounded-full bg-pink shadow-[0_0_14px_3px_rgba(243,166,200,.8)]" />
            <article className="glass p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-lavender">{fmtDate(ev.date)}</p>
                  <h2 className="font-serif text-2xl">{ev.title}</h2>
                  {ev.location && <p className="mt-1 inline-flex items-center gap-1 text-sm text-white/60"><MapPin size={13} />{ev.location}</p>}
                </div>
                <div className="flex gap-1.5">
                  <button aria-label="Edit" onClick={() => setForm(ev)} className="rounded-full bg-white/10 p-2"><Pencil size={15} /></button>
                  <button aria-label="Delete" onClick={() => confirm("Delete this milestone?") && remove(ev.id)} className="rounded-full bg-white/10 p-2"><Trash2 size={15} /></button>
                </div>
              </div>
              {ev.photo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={ev.photo} alt={ev.title} loading="lazy" className="mt-4 max-h-80 w-full rounded-xl object-cover" />}
              {ev.description && <p className="mt-4 whitespace-pre-wrap font-hand text-2xl text-pink">{ev.description}</p>}
            </article>
          </motion.li>
        ))}
      </ol>
      {form && <EventForm initial={form === "new" ? null : form} onClose={() => setForm(null)} onSave={save} />}
    </div>
  );
}
