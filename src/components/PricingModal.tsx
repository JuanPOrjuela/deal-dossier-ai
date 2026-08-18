import React from 'react';
import { X, Check, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeToPro: () => void;
  isPro: boolean;
  language: Language;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onUpgradeToPro,
  isPro,
  language
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  const handleSimulateUpgrade = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
    onUpgradeToPro();
    setTimeout(() => {
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative animate-scaleUp">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold mb-3">
            <Zap className="h-3.5 w-3.5" />
            <span>{language === 'es' ? 'Oferta Especial de Lanzamiento' : 'Special Launch Offer'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.pricingTitle}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            {t.pricingDesc}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Tier 1: Starter ($14/mo) */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-base">{t.starterTitle}</h3>
              <p className="text-xs text-slate-400 mt-1">{t.starterDesc}</p>
              
              <div className="my-5">
                <span className="text-3xl font-black text-white font-mono">$14</span>
                <span className="text-xs text-slate-400"> / {language === 'es' ? 'mes' : 'month'}</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                  <span>50 {language === 'es' ? 'Dossiers mensuales' : 'Monthly dossiers'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                  <span>4 {language === 'es' ? 'Tonos de Outreach (Email + LinkedIn)' : 'Outreach Tones (Email + LinkedIn)'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                  <span>{language === 'es' ? 'Guión de Objeciones' : 'Call Battlecard Rebuttals'}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleSimulateUpgrade}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              {t.starterCta}
            </button>
          </div>

          {/* Tier 2: Agency Pro ($39/mo - Highlighted) */}
          <div className="bg-gradient-to-b from-blue-950/40 via-slate-950 to-slate-950 border-2 border-blue-500 rounded-2xl p-6 flex flex-col justify-between relative shadow-xl shadow-blue-500/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow">
              {t.agencyBadge}
            </div>

            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                <span>{t.agencyTitle}</span>
                <Sparkles className="h-4 w-4 text-blue-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">{t.agencyDesc}</p>

              <div className="my-5">
                <span className="text-3xl font-black text-white font-mono">$39</span>
                <span className="text-xs text-slate-400"> / {language === 'es' ? 'mes' : 'month'}</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                  <span className="font-bold text-white">{language === 'es' ? 'Dossiers ILIMITADOS' : 'UNLIMITED Dossiers'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                  <span>{language === 'es' ? 'Exportación en PDF sin marca de agua' : 'White-label PDF Export'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                  <span>{language === 'es' ? 'Señales de compra y stack tecnológico' : 'Buying signals & tech stack'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                  <span>{language === 'es' ? 'Soporte prioritario' : 'Priority Support'}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleSimulateUpgrade}
              className="mt-6 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              {isPro ? (language === 'es' ? '¡Plan Pro Activo!' : 'Pro Plan Active!') : t.agencyCta}
            </button>
          </div>

          {/* Tier 3: Lifetime Pass ($49 one-time) */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">Lifetime Deal</h3>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  {language === 'es' ? 'Pago Único' : 'One-time'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{language === 'es' ? 'Acceso de por vida sin mensualidades' : 'Lifetime access, zero recurring fees'}</p>

              <div className="my-5">
                <span className="text-3xl font-black text-white font-mono">$49</span>
                <span className="text-xs text-slate-400"> / {language === 'es' ? 'pago único' : 'lifetime'}</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                  <span>{language === 'es' ? 'Todas las funciones Pro para siempre' : 'All Pro features forever'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                  <span>{language === 'es' ? 'Actualizaciones futuras incluidas' : 'Future updates included'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                  <span>{language === 'es' ? 'Licencia comercial' : 'Commercial license'}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleSimulateUpgrade}
              className="mt-6 w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer"
            >
              {language === 'es' ? 'Obtener Pase de por Vida' : 'Get Lifetime Pass'}
            </button>
          </div>

        </div>

        {/* Security Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>{language === 'es' ? 'Garantía de reembolso de 14 días • Pagos seguros con Stripe & Lemon Squeezy' : '14-day money back guarantee • Secure checkout with Stripe & Lemon Squeezy'}</span>
        </div>

      </div>
    </div>
  );
};
