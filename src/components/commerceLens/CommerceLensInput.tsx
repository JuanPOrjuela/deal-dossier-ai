import React, { useState } from 'react';
import { ShoppingBag, Swords, PackageCheck, ArrowRight, Sparkles } from 'lucide-react';
import type { Language } from '../../i18n/translations';
import { translations } from '../../i18n/translations';

interface CommerceLensInputProps {
  onAudit: (competitor: string, yourProduct: string) => void;
  isLoading: boolean;
  language: Language;
}

const EXAMPLES: Record<Language, { competitor: string; yours: string }[]> = {
  es: [
    { competitor: 'Termo XYZ 1L (amazon.com)', yours: 'Termo Acero Premium 1L con garantía de por vida' },
    { competitor: 'Silla Ergonómica ProSit', yours: 'Silla ErgoFlex con soporte lumbar ajustable y 5 años de garantía' },
    { competitor: 'Auriculares SoundMax Pro', yours: 'Auriculares ClearBeat con cancelación de ruido y 40h de batería' },
  ],
  en: [
    { competitor: 'XYZ 1L Thermos (amazon.com)', yours: 'Premium Steel Thermos 1L with lifetime warranty' },
    { competitor: 'ProSit Ergonomic Chair', yours: 'ErgoFlex Chair with adjustable lumbar support and 5-year warranty' },
    { competitor: 'SoundMax Pro Earbuds', yours: 'ClearBeat Earbuds with noise cancelling and 40h battery life' },
  ],
};

export const CommerceLensInput: React.FC<CommerceLensInputProps> = ({ onAudit, isLoading, language }) => {
  const t = translations[language].commerceLens;
  const [competitor, setCompetitor] = useState('');
  const [yourProduct, setYourProduct] = useState('');
  const examples = EXAMPLES[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitor.trim() || !yourProduct.trim() || isLoading) return;
    onAudit(competitor.trim(), yourProduct.trim());
  };

  const handleQuickDemo = (comp: string, yours: string) => {
    setCompetitor(comp);
    setYourProduct(yours);
    onAudit(comp, yours);
  };

  return (
    <div className="w-full max-w-3xl mx-auto pt-12 pb-16 px-4">

      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-blue-400 font-semibold mb-3">
          <ShoppingBag className="h-3.5 w-3.5" />
          CommerceLens AI
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-medium text-slate-50 tracking-tight leading-tight">
          {t.heroTitle}
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto mt-3 leading-relaxed">
          {t.heroDesc}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-3">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
            <Swords className="h-3.5 w-3.5 text-slate-500" />
            {t.competitorLabel}
          </label>
          <input
            type="text"
            value={competitor}
            onChange={(e) => setCompetitor(e.target.value)}
            placeholder={t.competitorPlaceholder}
            required
            className="w-full bg-slate-900 border border-slate-700 hover:border-slate-500 focus:border-blue-500 rounded-lg px-4 py-2.5 text-slate-50 placeholder-slate-500 text-sm focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
            <PackageCheck className="h-3.5 w-3.5 text-slate-500" />
            {t.yourProductLabel}
          </label>
          <input
            type="text"
            value={yourProduct}
            onChange={(e) => setYourProduct(e.target.value)}
            placeholder={t.yourProductPlaceholder}
            required
            className="w-full bg-slate-900 border border-slate-700 hover:border-slate-500 focus:border-blue-500 rounded-lg px-4 py-2.5 text-slate-50 placeholder-slate-500 text-sm focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !competitor.trim() || !yourProduct.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-md text-sm flex items-center justify-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
        >
          {isLoading ? (
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t.auditingButton}</span>
            </div>
          ) : (
            <>
              <span>{t.auditButton}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
        <span className="text-slate-500 font-medium">{t.exploreExamples}</span>
        {examples.map((ex, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickDemo(ex.competitor, ex.yours)}
            className="flex items-center gap-1.5 text-slate-300 hover:text-slate-50 border-b border-transparent hover:border-slate-500 pb-0.5 transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-slate-500" />
            <span>{idx === 0 ? t.example1 : idx === 1 ? t.example2 : t.example3}</span>
          </button>
        ))}
      </div>

    </div>
  );
};
