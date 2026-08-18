import React, { useState } from 'react';
import { X, Key, ExternalLink, ShieldCheck, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey
}) => {
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-ink-900 border border-ink-800 rounded-lg max-w-md w-full p-6 shadow-2xl relative animate-scaleUp">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-md text-ink-400 hover:text-ink-50 border border-ink-800 hover:border-ink-600 transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-ink-50 font-display font-semibold text-base mb-1">
          <Key className="h-4 w-4 text-gold-400" />
          <span>Configuración de Inteligencia</span>
        </div>
        <p className="text-xs text-ink-500 mb-6">
          Conecta tu API Key de Gemini para análisis en tiempo real ilimitados.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-300 mb-1.5">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={currentKey}
              onChange={(e) => setCurrentKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-ink-950 border border-ink-700 focus:border-gold-500 rounded-md px-4 py-2.5 text-ink-100 placeholder-ink-600 text-xs focus:outline-none font-mono"
            />
          </div>

          <div className="bg-ink-950 p-3 rounded-md border border-ink-800 text-[11px] text-ink-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-ink-300 font-medium">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              <span>Privacidad Total</span>
            </div>
            <p>
              Tu API key se almacena únicamente en tu navegador local (LocalStorage). Nunca pasa por ningún servidor intermediario.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:underline flex items-center gap-1 pt-1"
            >
              Obtener API Key gratuita en Google AI Studio
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gold-600 hover:bg-gold-500 text-ink-950 font-semibold py-2.5 rounded-md text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>¡Guardado con éxito!</span>
                </>
              ) : (
                <span>Guardar Configuración</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
