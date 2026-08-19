import React, { useState } from 'react';
import {
  Building2,
  Target,
  Mail,
  Check,
  Copy,
  Download,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Zap,
  Layers,
  Sparkles,
  Share2,
  BadgeCheck,
  AlertCircle
} from 'lucide-react';
import type { DossierData, ToneId } from '../types';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';

interface DossierViewProps {
  dossier: DossierData;
  onUpdateStatus: (id: string, newStatus: DossierData['status']) => void;
  language: Language;
}

export const DossierView: React.FC<DossierViewProps> = ({ dossier, onUpdateStatus, language }) => {
  const t = translations[language].dealDossier;
  const [activeSection, setActiveSection] = useState<'all' | 'email' | 'linkedin' | 'objections' | 'dna'>('all');
  const [selectedTone, setSelectedTone] = useState<ToneId>('consultivo');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const statusOptions: DossierData['status'][] = [
    'Nuevo',
    'Contactado',
    'En Reunión',
    'Propuesta Enviada',
    'Ganado'
  ];

  const currentAngle = dossier.toneAngles ? dossier.toneAngles[selectedTone] : {
    title: 'Ángulo Principal',
    hook: 'Propuesta de valor diferenciada',
    coldEmailSubject: `Reunión para ${dossier.companyName}`,
    coldEmailBody: `Hola [Nombre],\n\nNotamos una oportunidad en ${dossier.websiteUrl} relacionada con ${dossier.sellerOffer}.\n\n¿Tendrías 10 minutos esta semana?`,
    linkedInMessage: `Hola [Nombre], te comparto un análisis breve de ${dossier.companyName}. ¿Lo revisamos?`,
    whyItWorks: 'Enfoque directo de valor'
  };

  const tonePills: { id: ToneId; label: string; icon: any }[] = [
    { id: 'consultivo', label: language === 'es' ? 'Consultivo & Diagnóstico' : 'Consultative', icon: Sparkles },
    { id: 'roi', label: language === 'es' ? 'Directo / Puro ROI' : 'Direct / Pure ROI', icon: TrendingUp },
    { id: 'challenger', label: language === 'es' ? 'Challenger / Provocador' : 'Challenger Pitch', icon: Zap },
    { id: 'relacional', label: language === 'es' ? 'Relacional & Cálido' : 'Warm & Relationship', icon: ShieldCheck }
  ];

  const tabs: { id: typeof activeSection; label: string; icon: any }[] = [
    { id: 'all', label: t.filterAll, icon: Sparkles },
    { id: 'email', label: t.filterEmail, icon: Mail },
    { id: 'linkedin', label: t.filterLinkedIn, icon: Share2 },
    { id: 'objections', label: t.filterObjections, icon: ShieldCheck },
    { id: 'dna', label: t.filterDna, icon: Building2 },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-24 space-y-5">

      {/* 1. Dossier Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-md bg-slate-950 border border-slate-700 flex items-center justify-center text-blue-400 text-xl font-display font-semibold flex-shrink-0">
              {dossier.companyName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-display font-semibold text-slate-50 tracking-tight">{dossier.companyName}</h2>
                <BadgeCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <a
                  href={`https://${dossier.websiteUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                >
                  {dossier.websiteUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span className="text-slate-700">·</span>
                <span className="text-slate-400">{dossier.companyDna?.businessModel || 'B2B'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 border border-slate-800 rounded-md px-3 py-1.5 text-xs">
              <span className="text-slate-500 font-medium">{t.status}:</span>
              <select
                value={dossier.status}
                onChange={(e) => onUpdateStatus(dossier.id, e.target.value as DossierData['status'])}
                className="bg-transparent text-blue-400 font-semibold focus:outline-none cursor-pointer"
              >
                {statusOptions.map((st) => (
                  <option key={st} value={st} className="bg-slate-900 text-slate-200">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-slate-300 text-xs font-semibold border border-slate-700 hover:border-slate-500 hover:text-slate-50 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t.exportPdf}</span>
            </button>
          </div>

        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-0 mt-6 pt-5 border-t border-slate-800 divide-x divide-slate-800">
          <div className="pr-4">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">{t.dealScore}</span>
            <span className="text-lg font-mono font-semibold text-slate-50">{dossier.dealScore?.overall || 88}<span className="text-slate-600 text-sm">/100</span></span>
          </div>

          <div className="px-4">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">{t.budget}</span>
            <span className="text-lg font-mono font-semibold text-emerald-400">{dossier.dealScore?.budgetTier || 'Tier 1 ($50k+)'}</span>
          </div>

          <div className="pl-4">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">{t.buyingWindow}</span>
            <span className="text-lg font-mono font-semibold text-amber-400">{dossier.dealScore?.buyingWindow || '30-45 days'}</span>
          </div>
        </div>

      </div>

      {/* 2. Tab Bar */}
      <div className="flex items-center gap-5 overflow-x-auto border-b border-slate-800">
        {tabs.map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-1.5 pb-3 text-xs font-semibold transition cursor-pointer whitespace-nowrap border-b-2 -mb-px ${
                isActive ? 'text-slate-50 border-blue-500' : 'text-slate-500 hover:text-slate-300 border-transparent'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Outreach Studio */}
      {(activeSection === 'all' || activeSection === 'email' || activeSection === 'linkedin') && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-display font-semibold text-slate-50 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-400" />
                <span>{t.outreachStudio}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{t.outreachDesc}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tonePills.map((tp) => {
                const isSelected = selectedTone === tp.id;
                return (
                  <button
                    key={tp.id}
                    onClick={() => setSelectedTone(tp.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-transparent text-slate-500 border-slate-800 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <span>{tp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950 border-l-2 border-blue-500 rounded-r-md p-4 text-xs">
            <span className="text-blue-400 font-semibold uppercase tracking-wider block mb-1">
              {t.psychologicalHook} {dossier.targetPersona}
            </span>
            <p className="text-slate-100 font-medium">{currentAngle.hook}</p>
            <p className="text-slate-500 mt-1 italic text-[11px]">{currentAngle.whyItWorks}</p>
          </div>

          {/* Cold Email */}
          {(activeSection === 'all' || activeSection === 'email') && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-slate-500" />
                  {t.coldEmailTitle}
                </span>
                <button
                  onClick={() => handleCopy(`${currentAngle.coldEmailSubject}\n\n${currentAngle.coldEmailBody}`, 'email')}
                  className="text-slate-400 hover:text-blue-400 px-3 py-1 rounded-md text-xs font-semibold border border-slate-700 hover:border-blue-600/50 transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'email' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === 'email' ? t.copied : t.copyEmail}</span>
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-md p-4 text-xs space-y-2 font-mono">
                <div className="text-slate-500">
                  <span className="font-semibold">{language === 'es' ? 'Asunto:' : 'Subject:'} </span>
                  <span className="text-slate-100 font-sans font-semibold">{currentAngle.coldEmailSubject}</span>
                </div>
                <div className="border-t border-slate-800 pt-3 text-slate-300 font-sans leading-relaxed whitespace-pre-line text-sm">
                  {currentAngle.coldEmailBody}
                </div>
              </div>
            </div>
          )}

          {/* LinkedIn Message */}
          {(activeSection === 'all' || activeSection === 'linkedin') && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                  <Share2 className="h-4 w-4 text-slate-500" />
                  {t.linkedInTitle}
                </span>
                <button
                  onClick={() => handleCopy(currentAngle.linkedInMessage, 'linkedin')}
                  className="text-slate-400 hover:text-blue-400 px-3 py-1 rounded-md text-xs font-semibold border border-slate-700 hover:border-blue-600/50 transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'linkedin' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === 'linkedin' ? t.copied : t.copyLinkedIn}</span>
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-md p-4 text-xs text-slate-300 leading-relaxed text-sm">
                {currentAngle.linkedInMessage}
              </div>
            </div>
          )}

        </div>
      )}

      {/* 4. Company DNA & Pain Points */}
      {(activeSection === 'all' || activeSection === 'dna') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
            <h3 className="font-display font-semibold text-sm text-slate-50 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-500" />
              <span>{t.companyProfile}</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-md border border-slate-800">
              {dossier.summary}
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">{t.businessModel}:</span>
                <span className="text-slate-200 font-semibold">{dossier.companyDna?.businessModel}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">{t.targetAudience}:</span>
                <span className="text-slate-200 font-semibold text-right max-w-[200px]">{dossier.companyDna?.targetAudience}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">{t.estimatedSize}:</span>
                <span className="text-slate-200 font-semibold">{dossier.companyDna?.estimatedSize}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
            <h3 className="font-display font-semibold text-sm text-slate-50 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-slate-500" />
              <span>{t.painPointsTitle}</span>
            </h3>

            <div className="space-y-3">
              {dossier.painPoints?.map((pp, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-md border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-100">{pp.issue}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      pp.urgency === 'Crítica' ? 'bg-red-950/40 text-red-400 border-red-800/50' :
                      pp.urgency === 'Alta' ? 'bg-amber-900/20 text-amber-300 border-amber-700/40' :
                      'bg-slate-900 text-slate-400 border-slate-700'
                    }`}>
                      {pp.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{pp.impact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Objection Handling Battlecard */}
      {(activeSection === 'all' || activeSection === 'objections') && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">
          <div className="flex items-center gap-2 text-slate-50 font-display font-semibold text-base border-b border-slate-800 pb-3">
            <Layers className="h-4 w-4 text-blue-400" />
            <span>{t.battlecardTitle}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dossier.objections?.map((obj, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-md p-4 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-slate-500 border border-slate-700 px-2 py-0.5 rounded inline-block mb-2">
                    {t.objectionIfTheySay} #{idx + 1}
                  </span>
                  <h4 className="font-semibold text-xs text-slate-100 mb-2 leading-snug">
                    "{obj.objection}"
                  </h4>

                  <div className="border-l-2 border-emerald-500 pl-3 py-1">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                      {t.tacticalRebuttal}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {obj.rebuttal}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900 flex justify-end">
                  <button
                    onClick={() => handleCopy(obj.rebuttal, `rebuttal_${idx}`)}
                    className="text-xs text-slate-400 hover:text-blue-400 font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedKey === `rebuttal_${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === `rebuttal_${idx}` ? t.copied : t.copyRebuttal}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
