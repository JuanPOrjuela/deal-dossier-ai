import React from 'react';
import { Key, History, Zap, Sun, Moon, Cloud, LogIn, LogOut, UserCircle2 } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import type { Entitlement } from '../services/entitlements';

interface NavbarProps {
  entitlement: Entitlement | null;
  userEmail: string | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenPricing: () => void;
  onOpenSettings: () => void;
  onToggleHistory: () => void;
  historyCount: number;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  onToggleTheme: (theme: 'dark' | 'light') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  entitlement,
  userEmail,
  onOpenAuth,
  onSignOut,
  onOpenPricing,
  onOpenSettings,
  onToggleHistory,
  historyCount,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme
}) => {
  const t = translations[language].shell;

  const planLabel = (() => {
    if (!entitlement) return t.creditsFree;
    if (entitlement.status === 'active' && (entitlement.plan === 'all_access' || entitlement.plan === 'lifetime')) {
      return t.creditsPro;
    }
    if (entitlement.status === 'active' && entitlement.plan === 'single') {
      return t.apps[entitlement.singleAppId ?? 'dealDossier'].name;
    }
    return `${Math.max(entitlement.freeCreditsLimit - entitlement.freeCreditsUsed, 0)} ${t.creditsFree}`;
  })();

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40 h-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
            <Cloud className="h-4.5 w-4.5" />
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="font-display font-semibold text-lg tracking-tight text-slate-50">{t.brand}</span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.14em] text-slate-500 font-semibold">
              {t.brandTagline}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">

          {/* Language Switcher */}
          <div className="flex items-center border border-slate-800 rounded-md overflow-hidden text-xs">
            <button
              onClick={() => onToggleLanguage('es')}
              className={`px-2.5 py-1.5 font-semibold transition cursor-pointer ${
                language === 'es'
                  ? 'bg-slate-800 text-slate-50'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              ES
            </button>
            <button
              onClick={() => onToggleLanguage('en')}
              className={`px-2.5 py-1.5 font-semibold transition cursor-pointer border-l border-slate-800 ${
                language === 'en'
                  ? 'bg-slate-800 text-slate-50'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              EN
            </button>
          </div>

          {/* Theme Switcher */}
          <div className="flex items-center border border-slate-800 rounded-md overflow-hidden text-xs">
            <button
              onClick={() => onToggleTheme('light')}
              title={t.lightMode}
              className={`p-1.5 transition cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-800 text-slate-50'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onToggleTheme('dark')}
              title={t.darkMode}
              className={`p-1.5 transition cursor-pointer border-l border-slate-800 ${
                theme === 'dark'
                  ? 'bg-slate-800 text-slate-50'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* History */}
          <button
            onClick={onToggleHistory}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-300 border border-slate-800 hover:border-slate-600 hover:text-slate-50 transition cursor-pointer"
          >
            <History className="h-3.5 w-3.5" />
            <span>{t.savedItems}</span>
            {historyCount > 0 && (
              <span className="text-slate-500">({historyCount})</span>
            )}
          </button>

          {/* Credits / Plan */}
          <button
            onClick={onOpenPricing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border border-blue-700/40 text-blue-300 hover:border-blue-600 transition cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            <span>{planLabel}</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-md text-slate-400 hover:text-slate-50 border border-slate-800 hover:border-slate-600 transition cursor-pointer"
            title={t.settings}
          >
            <Key className="h-3.5 w-3.5" />
          </button>

          {/* Auth */}
          {userEmail ? (
            <button
              onClick={onSignOut}
              title={`${t.signOut} (${userEmail})`}
              className="flex items-center gap-1.5 p-2 rounded-md text-slate-400 hover:text-slate-50 border border-slate-800 hover:border-slate-600 transition cursor-pointer"
            >
              <UserCircle2 className="h-3.5 w-3.5" />
              <LogOut className="h-3.5 w-3.5 sm:hidden" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.signIn}</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
