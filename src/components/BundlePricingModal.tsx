import React from 'react';
import { X, Check, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { getCheckoutUrl, isCheckoutConfigured, type CheckoutPlan } from '../services/checkout';
import type { PlanId } from '../services/entitlements';

interface BundlePricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequireAuth: () => void;
  userId: string | null;
  userEmail?: string;
  currentPlan: PlanId;
  language: Language;
}

export const BundlePricingModal: React.FC<BundlePricingModalProps> = ({
  isOpen,
  onClose,
  onRequireAuth,
  userId,
  userEmail,
  currentPlan,
  language
}) => {
  const t = translations[language].pricing;

  if (!isOpen) return null;

  const goToCheckout = (plan: CheckoutPlan) => {
    if (!userId) {
      onClose();
      onRequireAuth();
      return;
    }
    const url = getCheckoutUrl(plan, userId, userEmail);
    if (!url) {
      console.warn('[Cloud AIs] LemonSqueezy checkout is not configured -- see .env.example');
      return;
    }
    window.location.href = url;
  };

  const isAllAccessActive = currentPlan === 'all_access' || currentPlan === 'lifetime';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative animate-scaleUp">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-50 bg-slate-800 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold mb-3">
            <Zap className="h-3.5 w-3.5" />
            <span>{t.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-slate-50">
            {t.title}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            {t.desc}
          </p>
          {!isCheckoutConfigured && (
            <p className="text-[11px] text-amber-300 bg-amber-900/20 border border-amber-700/40 rounded-md p-2 mt-3 inline-block">
              LemonSqueezy checkout is not configured yet -- see .env.example.
            </p>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Tier 1: Single App */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-display font-semibold text-slate-50 text-base">{t.singleTitle}</h3>
              <p className="text-xs text-slate-400 mt-1">{t.singleDesc}</p>

              <div className="my-5">
                <span className="text-3xl font-black text-white font-mono">$7</span>
                <span className="text-xs text-slate-400"> / {language === 'es' ? 'mes' : 'month'}</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{t.singleFeature1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{t.singleFeature2}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{t.singleFeature3}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => goToCheckout('single')}
              disabled={currentPlan === 'single'}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-default"
            >
              {currentPlan === 'single' ? t.allAccessActive : t.singleCta}
            </button>
          </div>

          {/* Tier 2: All-Access Suite (Highlighted) */}
          <div className="bg-gradient-to-b from-blue-950/40 via-slate-950 to-slate-950 border-2 border-blue-500 rounded-2xl p-6 flex flex-col justify-between relative shadow-xl shadow-blue-500/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow">
              {t.allAccessBadge}
            </div>

            <div>
              <h3 className="font-display font-semibold text-slate-50 text-base flex items-center gap-1.5">
                <span>{t.allAccessTitle}</span>
                <Sparkles className="h-4 w-4 text-blue-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">{t.allAccessDesc}</p>

              <div className="my-5">
                <span className="text-3xl font-black text-slate-50 font-mono">$19</span>
                <span className="text-xs text-slate-400"> {t.allAccessPriceNote}</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="font-bold text-slate-50">{t.allAccessFeature1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{t.allAccessFeature2}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{t.allAccessFeature3}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{t.allAccessFeature4}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => goToCheckout('allAccess')}
              disabled={isAllAccessActive}
              className="mt-6 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer disabled:opacity-50 disabled:cursor-default"
            >
              {isAllAccessActive ? t.allAccessActive : t.allAccessCta}
            </button>
          </div>

          {/* Tier 3: Lifetime All-Access Pass */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-slate-50 text-base">{t.lifetimeTitle}</h3>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  {t.lifetimeBadge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{t.lifetimeDesc}</p>

              <div className="my-5">
                <span className="text-3xl font-black text-slate-50 font-mono">$39</span>
                <span className="text-xs text-slate-400"> {t.lifetimePriceNote}</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                  <span>{t.lifetimeFeature1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                  <span>{t.lifetimeFeature2}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                  <span>{t.lifetimeFeature3}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => goToCheckout('lifetime')}
              disabled={currentPlan === 'lifetime'}
              className="mt-6 w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-default"
            >
              {currentPlan === 'lifetime' ? t.allAccessActive : t.lifetimeCta}
            </button>
          </div>

        </div>

        {/* Security Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>{t.securityFooter}</span>
        </div>

      </div>
    </div>
  );
};
