'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqSection {
  category: string;
  items: { q: string; a: string }[];
}

interface CategoryAccent {
  text: string;
  bg: string;
  ring: string;
}

// Rotación de acentos por categoría, estilo paleta manga
const ACCENTS: CategoryAccent[] = [
  { text: 'text-[#ec4899]', bg: 'bg-[#ec4899]/10', ring: 'ring-[#ec4899]/20' },
  { text: 'text-[#06b6d4]', bg: 'bg-[#06b6d4]/10', ring: 'ring-[#06b6d4]/20' },
  { text: 'text-[#eab308]', bg: 'bg-[#eab308]/10', ring: 'ring-[#eab308]/20' },
  { text: 'text-[#5a7a9e]', bg: 'bg-[#5a7a9e]/10', ring: 'ring-[#5a7a9e]/20' },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 dark:border-white/5 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex justify-between items-start gap-4 py-4 text-left group"
        aria-expanded={open}
      >
        <span className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-[#ec4899] transition-colors">
          {question}
        </span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-gray-400 mt-0.5 transition-all ${
            open ? 'rotate-180 text-[#ec4899]' : 'group-hover:text-[#ec4899]'
          }`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed animate-tilt-in">
          {answer}
        </p>
      )}
    </div>
  );
}

export function FaqAccordion({ sections }: { sections: FaqSection[] }) {
  return (
    <div className="space-y-5">
      {sections.map((section, idx) => {
        const accent = ACCENTS[idx % ACCENTS.length];
        return (
          <div
            key={section.category}
            className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm p-6 ring-1 ${accent.ring}`}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${accent.bg} ${accent.text} text-xs font-extrabold`}>
                {String(idx + 1).padStart(2, '0')}
              </span>
              <h2 className={`text-lg font-extrabold ${accent.text}`}>{section.category}</h2>
            </div>
            {section.items.map((item) => (
              <FaqItem key={item.q} question={item.q} answer={item.a} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
