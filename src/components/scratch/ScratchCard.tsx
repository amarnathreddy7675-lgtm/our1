"use client";
import { useEffect, useRef } from "react";
import BlobVideo from "@/components/shared/BlobVideo";

export default function ScratchCard({ photo, video, alt, revealed, onReveal }: { photo: string; video?: Blob | string; alt: string; revealed: boolean; onReveal: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const moves = useRef(0);

  useEffect(() => {
    const c = ref.current!, r = c.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = r.width * dpr; c.height = r.height * dpr;
    const x = c.getContext("2d")!;
    const g = x.createLinearGradient(0, 0, c.width, c.height);
    g.addColorStop(0, "#a78bfa"); g.addColorStop(0.5, "#f3a6c8"); g.addColorStop(1, "#c4b5fd");
    x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
    const glitter = ["#ffffff", "#fbcfe8", "#ddd6fe", "#fff4c2"];
    for (let i = 0; i < (c.width * c.height) / 700; i++) {
      x.fillStyle = glitter[i % 4]; x.globalAlpha = 0.4 + Math.random() * 0.6;
      const s = (1 + Math.random() * 2.2) * dpr;
      x.fillRect(Math.random() * c.width, Math.random() * c.height, s, s);
    }
    x.globalAlpha = 1; x.fillStyle = "rgba(255,255,255,.9)"; x.font = `${22 * dpr}px serif`; x.textAlign = "center";
    x.fillText("✨ scratch me ✨", c.width / 2, c.height / 2);
  }, []);

  const pt = (e: React.PointerEvent) => {
    const c = ref.current!, r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * c.width) / r.width, y: ((e.clientY - r.top) * c.height) / r.height };
  };
  const stroke = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const c = ref.current!, x = c.getContext("2d")!;
    x.globalCompositeOperation = "destination-out"; x.lineCap = "round"; x.lineJoin = "round";
    x.lineWidth = 38 * (c.width / c.getBoundingClientRect().width);
    x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke();
  };
  const check = () => {
    const c = ref.current!, d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    let clear = 0, n = 0;
    for (let i = 3; i < d.length; i += 64) { n++; if (d[i] < 128) clear++; }
    if (clear / n > 0.5) onReveal();
  };

  return (
    <div className="relative aspect-[4/5] w-full select-none overflow-hidden bg-stone-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt={revealed ? alt : ""} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      {revealed && video && <BlobVideo blob={video} className="absolute inset-0 h-full w-full object-cover" />}
      <canvas ref={ref} aria-hidden
        className={`absolute inset-0 h-full w-full cursor-grab touch-none transition-opacity duration-700 ${revealed ? "pointer-events-none opacity-0" : ""}`}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); last.current = pt(e); stroke(last.current, last.current); }}
        onPointerMove={(e) => { if (!last.current) return; const p = pt(e); stroke(last.current, p); last.current = p; if (++moves.current % 8 === 0) check(); }}
        onPointerUp={() => { last.current = null; check(); }}
        onPointerCancel={() => { last.current = null; }} />
      {!revealed && <div aria-hidden className="sheen pointer-events-none absolute inset-0" />}
    </div>
  );
}
