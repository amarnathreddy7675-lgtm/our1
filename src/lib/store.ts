"use client";
import { useCallback, useEffect, useState } from "react";
import * as cloud from "./cloud";

export const cloudOn = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

const open = () => new Promise<IDBDatabase>((res, rej) => {
  const r = indexedDB.open("our-universe", 4);
  r.onupgradeneeded = () => ["memories", "letters", "events", "places", "photos", "scratch"].forEach((n) => { if (!r.result.objectStoreNames.contains(n)) r.result.createObjectStore(n, { keyPath: "id" }); });
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
});
const run = async <T,>(s: string, m: IDBTransactionMode, f: (o: IDBObjectStore) => IDBRequest<T>) => {
  const db = await open();
  return new Promise<T>((res, rej) => { const q = f(db.transaction(s, m).objectStore(s)); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
};

export function useStore<T extends { id: string }>(name: string) {
  const [items, setItems] = useState<T[]>([]);
  const [ready, setReady] = useState(false);
  const load = useCallback(async () => { try { setItems(cloudOn ? await cloud.list<T>(name) : await run<T[]>(name, "readonly", (o) => o.getAll())); } catch (e) { console.error(e); } setReady(true); }, [name]);
  useEffect(() => {
    load();
    if (!cloudOn) return;
    const off = cloud.subscribe(name, load);
    const f = () => load();
    window.addEventListener("focus", f);
    return () => { off(); window.removeEventListener("focus", f); };
  }, [load, name]);
  const save = async (i: T) => { if (cloudOn) await cloud.put(name, i); else await run(name, "readwrite", (o) => o.put(i)); await load(); };
  const remove = async (id: string) => { if (cloudOn) await cloud.del(name, id); else await run(name, "readwrite", (o) => o.delete(id)); await load(); };
  return { items, ready, save, remove };
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const fmtDate = (d: string) => d ? new Date(d + "T00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

export const shrink = (f: File, max = 1400) => new Promise<string>((res, rej) => {
  const img = new Image(), u = URL.createObjectURL(f);
  img.onload = () => {
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = img.width * k; c.height = img.height * k;
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(u); res(c.toDataURL("image/jpeg", 0.82));
  };
  img.onerror = () => rej(new Error("Could not read " + f.name));
  img.src = u;
});

export const MAX_VIDEO = 50 * 1024 * 1024;

export const videoPoster = (f: File, max = 1000) => new Promise<string>((res, rej) => {
  const v = document.createElement("video"), u = URL.createObjectURL(f);
  const fail = () => { URL.revokeObjectURL(u); rej(new Error("Could not read " + f.name)); };
  v.muted = true; v.playsInline = true; v.preload = "auto"; v.src = u; v.onerror = fail;
  v.onloadedmetadata = () => { v.currentTime = Math.min(0.5, (v.duration || 1) / 2); };
  v.onseeked = () => {
    const k = Math.min(1, max / Math.max(v.videoWidth, v.videoHeight));
    const c = document.createElement("canvas");
    c.width = v.videoWidth * k; c.height = v.videoHeight * k;
    c.getContext("2d")!.drawImage(v, 0, 0, c.width, c.height);
    URL.revokeObjectURL(u); res(c.toDataURL("image/jpeg", 0.8));
  };
  setTimeout(fail, 10000);
});

export async function readMedia(f: File): Promise<{ photo: string; video?: Blob | string }> {
  if (f.type.startsWith("video/")) {
    if (f.size > MAX_VIDEO) throw new Error(`${f.name} is over 50 MB. Trim it or pick a shorter clip.`);
    return { photo: await videoPoster(f), video: f };
  }
  return { photo: await shrink(f) };
}

export function useBlobUrl(b?: Blob | string) {
  const [u, setU] = useState<string>();
  useEffect(() => {
    if (!b) { setU(undefined); return; }
    if (typeof b === "string") { setU(b); return; }
    const x = URL.createObjectURL(b); setU(x);
    return () => URL.revokeObjectURL(x);
  }, [b]);
  return u;
}

const STORES = ["memories", "letters", "events", "photos", "scratch"];
export const countLocal = async () => {
  let n = 0;
  for (const s of STORES) n += (await run<unknown[]>(s, "readonly", (o) => o.getAll())).length;
  return n;
};
export const migrateLocal = async () => {
  let n = 0;
  for (const s of STORES) for (const i of await run<{ id: string }[]>(s, "readonly", (o) => o.getAll())) { await cloud.put(s, i); n++; }
  return n;
};
