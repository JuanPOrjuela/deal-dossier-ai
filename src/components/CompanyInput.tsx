import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowRight, ShoppingCart, Laptop, Briefcase, FileSearch, BrainCircuit, Mail } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';

interface CompanyInputProps {
  onAnalyze: (url: string, persona: string, offer: string) => void;
  isLoading: boolean;
  language: Language;
}

export const CompanyInput: React.FC<CompanyInputProps> = ({ onAnalyze, isLoading, language }) => {
  const t = translations[language];
  const [url, setUrl] = useState('');
  const [persona, setPersona] = useState(language === 'es' ? 'Director Comercial / VP de Ventas' : 'VP of Sales / Commercial Director');
  const [offer, setOffer] = useState(language === 'es' ? 'Automatización con Inteligencia Artificial y prospección outbound' : 'AI Outbound prospecting automation');
  const [showConfig, setShowConfig] = useState(false);

  const steps = language === 'es'
    ? [
        { icon: FileSearch, title: 'Pega el sitio', desc: 'El dominio del prospecto que tu equipo quiere abordar.' },
        { icon: BrainCircuit, title: 'Leemos la señal', desc: 'Analizamos posicionamiento, oferta y modelo de negocio.' },
        { icon: Mail, title: 'Recibe el guión', desc: 'Email, LinkedIn y respuestas a objeciones, listos para usar.' },
      ]
    : [
        { icon: FileSearch, title: 'Paste the site', desc: "The prospect's domain your team wants to approach." },
        { icon: BrainCircuit, title: 'We read the signal', desc: 'Positioning, offer and business model, analyzed.' },
        { icon: Mail, title: 'Get the script', desc: 'Email, LinkedIn and objection handling, ready to send.' },
      ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    onAnalyze(url.trim(), persona.trim(), offer.trim());
  };

  const handleQuickDemo = (sampleUrl: string, samplePersona: string, sampleOffer: string) => {
    setUrl(sampleUrl);
    setPersona(samplePersona);
    setOffer(sampleOffer);
    onAnalyze(sampleUrl, samplePersona, sampleOffer);
  };

  return (
    <div className="w-full max-w-3xl mx-auto pt-12 pb-16 px-4">

      {/* Hero Copy */}
      <div className="mb-8 text-center">
        <span className="inline-block text-[11px] uppercase tracking-[0.16em] text-gold-400 font-semibold mb-3">
          {language === 'es' ? 'Para agencias y equipos comerciales' : 'For agencies & sales teams'}
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-medium text-ink-50 tracking-tight leading-tight">
          {language === 'es' ? 'Convierte cualquier sitio web en un plan de ataque comercial' : 'Turn any website into a ready-to-run sales play'}
        </h1>
        <p className="text-sm text-ink-400 max-w-lg mx-auto mt-3 leading-relaxed">
          {t.brandTagline}
        </p>
      </div>

      {/* Main Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="relative z-10">
          <div className="flex items-center bg-ink-900 border border-ink-700 hover:border-ink-500 focus-within:border-gold-500 rounded-lg pl-4 pr-1.5 py-1.5 transition-colors duration-200">

            <Search className="h-4 w-4 text-ink-500 mr-2.5 flex-shrink-0" />

            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="flex-1 bg-transparent text-ink-50 placeholder-ink-500 text-sm py-2 focus:outline-none font-medium"
            />

            {/* Parameters Toggle */}
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className={`p-2 rounded-md mr-1 transition cursor-pointer ${
                showConfig
                  ? 'bg-ink-800 text-gold-400'
                  : 'text-ink-500 hover:text-ink-200 hover:bg-ink-800'
              }`}
              title={t.advancedParams}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>

            {/* Search Button */}
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="bg-gold-600 hover:bg-gold-500 text-ink-950 font-semibold px-4 py-2 rounded-md text-xs sm:text-sm flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-1.5">
                  <div className="h-3.5 w-3.5 border-2 border-ink-950 border-t-transparent rounded-full animate-spin" />
                  <span>{t.searchingButton}</span>
                </div>
              ) : (
                <>
                  <span>{t.searchButton}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Parameters Dropdown */}
          {showConfig && (
            <div className="mt-3 bg-ink-900 border border-ink-800 rounded-lg p-4 text-left shadow-xl animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-ink-300 font-semibold mb-1.5">
                    {t.targetPersonaLabel}
                  </label>
                  <input
                    type="text"
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                    placeholder={t.targetPersonaPlaceholder}
                    className="w-full bg-ink-950 border border-ink-700 rounded-md px-3 py-2 text-ink-50 focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-ink-300 font-semibold mb-1.5">
                    {t.sellerOfferLabel}
                  </label>
                  <input
                    type="text"
                    value={offer}
                    onChange={(e) => setOffer(e.target.value)}
                    placeholder={t.sellerOfferPlaceholder}
                    className="w-full bg-ink-950 border border-ink-700 rounded-md px-3 py-2 text-ink-50 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Category Chips */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
          <span className="text-ink-500 font-medium">{t.exploreExamples}</span>

          <button
            type="button"
            onClick={() => handleQuickDemo('shopify.com', language === 'es' ? 'VP de Marketing' : 'VP of Marketing', language === 'es' ? 'Optimización de conversión con IA' : 'AI CRO optimization')}
            className="flex items-center gap-1.5 text-ink-300 hover:text-ink-50 border-b border-transparent hover:border-ink-500 pb-0.5 transition cursor-pointer"
          >
            <ShoppingCart className="h-3.5 w-3.5 text-ink-500" />
            <span>Shopify</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('hubspot.com', language === 'es' ? 'Head de Ventas' : 'Head of Sales Operations', language === 'es' ? 'Aceleración de pipeline' : 'Pipeline acceleration')}
            className="flex items-center gap-1.5 text-ink-300 hover:text-ink-50 border-b border-transparent hover:border-ink-500 pb-0.5 transition cursor-pointer"
          >
            <Laptop className="h-3.5 w-3.5 text-ink-500" />
            <span>HubSpot</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('deel.com', language === 'es' ? 'VP de Recursos Humanos' : 'VP of People / HR', language === 'es' ? 'Capacitación remota' : 'Remote team training')}
            className="flex items-center gap-1.5 text-ink-300 hover:text-ink-50 border-b border-transparent hover:border-ink-500 pb-0.5 transition cursor-pointer"
          >
            <Briefcase className="h-3.5 w-3.5 text-ink-500" />
            <span>Deel</span>
          </button>
        </div>

      </div>

      {/* How it works */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 max-w-2xl mx-auto">
        {steps.map((step, idx) => (
          <div key={step.title} className="relative pl-4 sm:pl-0 sm:pt-4 border-l sm:border-l-0 sm:border-t border-ink-800">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[11px] text-gold-500">0{idx + 1}</span>
              <step.icon className="h-3.5 w-3.5 text-ink-500" />
            </div>
            <h3 className="text-xs font-semibold text-ink-200">{step.title}</h3>
            <p className="text-[11px] text-ink-500 mt-1 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
};
