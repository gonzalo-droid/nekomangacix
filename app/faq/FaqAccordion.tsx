'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FaqSection {
  category: string;
  items: { q: string; a: string }[];
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex justify-between items-start gap-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-medium text-gray-900 dark:text-white text-sm">{question}</span>
        {open ? (
          <ChevronUp size={18} className="flex-shrink-0 text-[#2b496d] dark:text-[#5a7a9e] mt-0.5" />
        ) : (
          <ChevronDown size={18} className="flex-shrink-0 text-gray-400 mt-0.5" />
        )}
      </button>
      {open && (
        <p className="pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

export function FaqAccordion({ sections }: { sections: FaqSection[] }) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.category} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#2b496d] dark:text-[#5a7a9e] mb-4">{section.category}</h2>
          {section.items.map((item) => (
            <FaqItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
      ))}
    </div>
  );
}
