import React, { useState } from 'react';
import { X, Key, ExternalLink, ShieldCheck, Check } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  language: Language;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  language
}) => {
  const t = translations[language].shell;
  const [currentKey, setCurrentKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(currentKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6 shadow-2xl relative animate-scaleUp">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-md text-slate-400 hover:text-slate-50 border border-slate-800 hover:border-slate-600 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-slate-50 font-display font-semibold text-base mb-1">
          <Key className="h-4 w-4 text-blue-400" />
          <span>{t.settingsTitle}</span>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          {t.settingsDesc}
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.apiKeyLabel}
            </label>
            <input
              type="password"
              value={currentKey}
              onChange={(e) => setCurrentKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-md px-4 py-2.5 text-slate-100 placeholder-slate-600 text-xs focus:outline-none font-mono"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-md border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>{t.apiKeyPrivacyTitle}</span>
            </div>
            <p>
              {t.apiKeyPrivacyDesc}
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 pt-1"
            >
              {t.apiKeyGetFree}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-md text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>{t.savedSuccess}</span>
                </>
              ) : (
                <span>{t.saveSettings}</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
