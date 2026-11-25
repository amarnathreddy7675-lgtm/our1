"use client";
import { useMemo, useState } from "react";
import { Plus, Play, Trash2, Download } from "lucide-react";
import { useStore, uid, readMedia } from "@/lib/store";
import ScratchGame, { type Item } from "./ScratchGame";

export default function ScratchManager() {
  const sc = useStore<Item>("scratch");
  const mems = useStore<{ id: string; photo: string; caption: string; date: string; video?: Blob | string }>("memories");
  const old = useStore<{ id: string; photo: string; at: number }>("photos");
  const [playing, setPlaying] = useState(false);
  const [msg, setMsg] = useState("");
  const items = useMemo(() => [...sc.items].sort((a, b) => a.at - b.at), [sc.items]);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      for (let i = 0; i < files.length; i++) {
        setMsg(`Adding ${i + 1} of ${files.length}...`);
        await sc.save({ id: uid(), ...(await readMedia(files[i])), caption: "", at: Date.now() + i });
      }
      setMsg(`Added ${files.length}. Write a hidden caption under each photo.`);
    } catch (e) { setMsg(e instanceof Error ? e.message : "Could not add photos."); }
  };

  const importOld = async () => {
    const have = new Set(sc.items.map((i) => i.id));
    const src = [
      ...[...mems.items].sort((a, b) => a.date.localeCompare(b.date)).map((m) => ({ id: "m-" + m.id, photo: m.photo, caption: m.caption, video: m.video })),
      ...[...old.items].sort((a, b) => a.at - b.at).map((p) => ({ id: "p-" + p.id, photo: p.photo, caption: "" })),
    ].filter((x) => !have.has(x.id));
    for (let i = 0; i < src.length; i++) await sc.save({ ...src[i], at: Date.now() + i });
    setMsg(src.length ? `Imported ${src.length} photos.` : "Nothing new to import.");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-4xl">Scratch &amp; Reveal</h1>
        <div className="flex flex-wrap gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/10 px-5 py-2.5">
            <Plus size={18} /> Add photos
            <input type="file" accept="image/*,video/*" multiple className="sr-only" onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
          </label>
          <button onClick={importOld} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5"><Download size={16} /> Import earlier photos</button>
          <button disabled={!items.length} onClick={() => setPlaying(true)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-lavender to-pink px-5 py-2.5 font-semibold text-navy disabled:opacity-40"><Play size={18} /> Start</button>
        </div>
      </header>
      <p role="status" className="text-sm text-white/60">{msg || "Each photo is covered in glitter. Scratch it away to see the photo and its hidden caption. The next one appears only after you do."}</p>

      {items.length === 0 ? (
        <p className="mt-12 text-center font-hand text-2xl text-white/70">Add the photos of us, then write a hidden caption for each one.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((s, n) => (
            <li key={s.id} className="glass flex items-start gap-4 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="relative shrink-0"><img src={s.photo} alt={`Photo ${n + 1}`} loading="lazy" className="h-24 w-20 rounded-lg object-cover" />{s.video && <span aria-hidden className="absolute inset-0 m-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/55"><Play size={16} /></span>}</div>
              <textarea defaultValue={s.caption} rows={3} aria-label={`Hidden caption for photo ${n + 1}`} placeholder="Hidden caption (Tinglish)..."
                onBlur={(e) => e.target.value !== s.caption && sc.save({ ...s, caption: e.target.value })}
                className="min-w-0 flex-1 rounded-lg bg-white/10 p-2 font-hand text-xl text-pink placeholder:text-white/40" />
              <button aria-label="Delete photo" onClick={() => confirm("Delete this photo?") && sc.remove(s.id)} className="rounded-full bg-white/10 p-2"><Trash2 size={16} /></button>
            </li>
          ))}
        </ul>
      )}
      {playing && <ScratchGame items={items} onClose={() => setPlaying(false)} />}
    </div>
  );
}
