"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookHeart, Images, Mail, Sparkles } from "lucide-react";
import RelationshipCounter from "./RelationshipCounter";
import MigrateLocal from "@/components/shared/MigrateLocal";
import AnniversaryBloom from "./AnniversaryBloom";

const cards = [
  { href: "/story", label: "Our Story", Icon: BookHeart },
  { href: "/memories", label: "Memories", Icon: Images },
  { href: "/letters", label: "Love Letters", Icon: Mail },
  { href: "/scratch", label: "Scratch & Reveal", Icon: Sparkles },
];

export default function OverviewDashboard() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="pt-6 text-center">
        <h1 className="font-serif text-4xl sm:text-5xl">Welcome to Our Universe ❤️</h1>
        <p className="mt-3 text-lg text-lavender">B. Amarnath Reddy × M. Samhitha Reddy</p>
        <p className="mt-1 text-white/60">Every memory brought us here. Every tomorrow is another story.</p>
        <p className="mt-1 text-sm text-white/50">Since 27 November 2025</p>
      </header>
      <section className="glass p-8"><RelationshipCounter /><AnniversaryBloom /></section>
      <p className="text-center font-hand text-2xl text-pink">
        Mana story lo inka chala beautiful chapters rayalsi unnayi. ❤️
      </p>
      <section aria-label="Explore" className="grid grid-cols-2 gap-4">
        {cards.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className="glass flex flex-col items-center gap-2 p-6 transition hover:-translate-y-0.5 hover:border-pink/50">
            <Icon className="text-lavender" /> {label}
          </Link>
        ))}
      </section>
      <MigrateLocal />
    </motion.div>
  );
}
