import React from 'react';
import { Target, PenTool, Users, ShoppingBag } from 'lucide-react';
import type { AppId } from '../types';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';

interface AppSwitcherProps {
  activeApp: AppId;
  onSwitchApp: (appId: AppId) => void;
  language: Language;
}

const APP_ICONS: Record<AppId, React.ElementType> = {
  dealDossier: Target,
  contentForge: PenTool,
  talentPulse: Users,
  commerceLens: ShoppingBag,
};

const APP_ORDER: AppId[] = ['dealDossier', 'contentForge', 'talentPulse', 'commerceLens'];

export const AppSwitcher: React.FC<AppSwitcherProps> = ({ activeApp, onSwitchApp, language }) => {
  const t = translations[language].shell;

  return (
    <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-16 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
        {APP_ORDER.map((appId) => {
          const Icon = APP_ICONS[appId];
          const meta = t.apps[appId];
          const isActive = activeApp === appId;
          return (
            <button
              key={appId}
              onClick={() => onSwitchApp(appId)}
              title={meta.description}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                isActive
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-slate-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{meta.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
