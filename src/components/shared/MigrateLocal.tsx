"use client";
import { useEffect, useState } from "react";
import { cloudOn, countLocal, migrateLocal } from "@/lib/store";

export default function MigrateLocal() {
  const [n, setN] = useState(0);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!cloudOn) return;
    try { if (localStorage.getItem("ou-migrated")) return; } catch {}
    countLocal().then(setN).catch(() => {});
  }, []);
  if (!cloudOn || (!n && !msg)) return null;
  return (
    <section className="glass p-5 text-center" role="status">
      {msg ? <p>{msg}</p> : (
        <>
          <p>This browser has {n} saved items that aren't online yet.</p>
          <button disabled={busy} className="mt-3 rounded-full bg-gradient-to-r from-lavender to-pink px-5 py-2 font-semibold text-navy disabled:opacity-50"
            onClick={async () => {
              setBusy(true);
              try { const c = await migrateLocal(); try { localStorage.setItem("ou-migrated", "1"); } catch {} setMsg(`Moved ${c} items online.`); }
              catch (e) { setMsg(e instanceof Error ? e.message : "Could not move the data."); }
              setBusy(false);
            }}>Move them online</button>
        </>
      )}
    </section>
  );
}
