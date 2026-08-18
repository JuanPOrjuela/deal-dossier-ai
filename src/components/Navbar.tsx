import React from 'react';
import { Key, History, Zap } from 'lucide-react';
import type { UserCredits } from '../types';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';

interface NavbarProps {
  credits: UserCredits;
  onOpenPricing: () => void;
  onOpenSettings: () => void;
  onToggleHistory: () => void;
  historyCount: number;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  credits,
  onOpenPricing,
  onOpenSettings,
  onToggleHistory,
  historyCount,
  language,
  onToggleLanguage
}) => {
  const t = translations[language];

  return (
    <header className="border-b border-ink-800 bg-ink-950/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-ink-900 border border-ink-700 flex items-center justify-center text-gold-400 font-display font-semibold text-lg">
            D
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="font-display font-semibold text-lg tracking-tight text-ink-50">Deal Dossier</span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.14em] text-ink-500 font-semibold">
              B2B Intelligence
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">

          {/* Language Switcher */}
          <div className="flex items-center border border-ink-800 rounded-md overflow-hidden text-xs">
            <button
              onClick={() => onToggleLanguage('es')}
              className={`px-2.5 py-1.5 font-semibold transition cursor-pointer ${
                language === 'es'
                  ? 'bg-ink-800 text-ink-50'
                  : 'text-ink-500 hover:text-ink-200'
              }`}
            >
              ES
            </button>
            <button
              onClick={() => onToggleLanguage('en')}
              className={`px-2.5 py-1.5 font-semibold transition cursor-pointer border-l border-ink-800 ${
                language === 'en'
                  ? 'bg-ink-800 text-ink-50'
                  : 'text-ink-500 hover:text-ink-200'
              }`}
            >
              EN
            </button>
          </div>

          {/* History */}
          <button
            onClick={onToggleHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-ink-300 border border-ink-800 hover:border-ink-600 hover:text-ink-50 transition cursor-pointer"
          >
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.savedDossiers}</span>
            {historyCount > 0 && (
              <span className="text-ink-500">({historyCount})</span>
            )}
          </button>

          {/* Credits */}
          <button
            onClick={onOpenPricing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border border-gold-700/40 text-gold-300 hover:border-gold-600 transition cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5 text-gold-400" />
            <span>{credits.isPro ? t.creditsPro : `${credits.limit - credits.used} ${t.creditsFree}`}</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-md text-ink-400 hover:text-ink-50 border border-ink-800 hover:border-ink-600 transition cursor-pointer"
            title="Configuración"
          >
            <Key className="h-3.5 w-3.5" />
          </button>

        </div>

      </div>
    </header>
  );
};
