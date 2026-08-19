import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';

interface FaqSectionProps {
  language: Language;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ language }) => {
  const t = translations[language].shell.faq;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mt-16 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <HelpCircle className="h-4 w-4 text-blue-400" />
        <h2 className="font-display font-semibold text-slate-50 text-xl">{t.title}</h2>
      </div>
      <p className="text-xs text-slate-500 mb-6">{t.desc}</p>

      <div className="space-y-2">
        {t.items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="border border-slate-800 rounded-lg bg-slate-900/50 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-3 text-left px-4 py-3.5 cursor-pointer"
              >
                <span className="text-sm font-medium text-slate-100">{item.q}</span>
                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-sm text-slate-400 leading-relaxed animate-fadeIn">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
