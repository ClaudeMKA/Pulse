"use client";
import { useState } from "react";
import { COLORS } from "@/lib/theme";

export type FAQItem = { q: string; a: string };

export default function FAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="max-w-3xl mx-auto py-16 px-4">
      <h2 className="text-4xl font-bold mb-10 text-center" style={{ color: COLORS.lavande }}>
        Infos pratiques
      </h2>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={item.q} className="rounded-2xl shadow bg-white border-2" style={{ borderColor: COLORS.roseClair }}>
            <button
              className="w-full text-left px-8 py-5 font-semibold text-xl flex justify-between items-center focus:outline-none"
              style={{ color: COLORS.violet }}
              onClick={() => setOpen(open === idx ? null : idx)}
            >
              {item.q}
              <span>{open === idx ? '-' : '+'}</span>
            </button>
            {open === idx && (
              <div className="px-8 pb-5 text-gray-700 text-lg">{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}


