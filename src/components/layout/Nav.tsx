"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookHeart, Images, Mail, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { href: "/overview", label: "Overview", Icon: Home },
  { href: "/story", label: "Our Story", Icon: BookHeart },
  { href: "/memories", label: "Memories", Icon: Images },
  { href: "/letters", label: "Love Letters", Icon: Mail },
  { href: "/scratch", label: "Scratch & Reveal", Icon: Sparkles },
];

function useActive() { const p = usePathname(); return (h: string) => p.startsWith(h); }

export function Sidebar() {
  const active = useActive();
  return (
    <aside className="glass fixed left-4 top-4 bottom-4 hidden w-60 flex-col p-5 md:flex">
      <p className="font-serif text-2xl">OUR UNIVERSE</p>
      <nav aria-label="Main" className="mt-8 flex flex-col gap-1">
        {items.map(({ href, label, Icon }) => (
          <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}
            className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/80 hover:text-white">
            {active(href) && <motion.span layoutId="side-active" className="absolute inset-0 rounded-xl bg-lavender/20" />}
            <Icon size={18} className="relative" /><span className="relative">{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const active = useActive();
  return (
    <nav aria-label="Main" className="glass fixed inset-x-3 bottom-3 z-20 flex justify-around p-2 md:hidden">
      {items.map(({ href, label, Icon }) => (
        <Link key={href} href={href} aria-label={label} aria-current={active(href) ? "page" : undefined}
          className={`relative rounded-xl p-3 ${active(href) ? "bg-lavender/25 text-pink" : "text-white/70"}`}>
          <Icon size={22} />
        </Link>
      ))}
    </nav>
  );
}
