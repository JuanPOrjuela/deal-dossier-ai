import React, { useState } from 'react';
import { Sparkles, MessageSquareWarning, Target, FileText, Copy, Check, ShoppingBag } from 'lucide-react';
import type { CommerceLensData } from '../../types';
import type { Language } from '../../i18n/translations';
import { translations } from '../../i18n/translations';

interface CommerceLensViewProps {
  data: CommerceLensData;
  onUpdateStatus: (id: string, newStatus: CommerceLensData['status']) => void;
  language: Language;
}

function frequencyClasses(freq: 'Alta' | 'Media' | 'Baja'): string {
  if (freq === 'Alta') return 'bg-red-950/40 text-red-400 border-red-800/50';
  if (freq === 'Media') return 'bg-amber-900/20 text-amber-300 border-amber-700/40';
  return 'bg-slate-900 text-slate-400 border-slate-700';
}

export const CommerceLensView: React.FC<CommerceLensViewProps> = ({ data, onUpdateStatus, language }) => {
  const t = translations[language].commerceLens;
  const [activeSection, setActiveSection] = useState<'all' | 'complaints' | 'angles' | 'description'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const statusOptions: CommerceLensData['status'][] = ['Nuevo', 'En Uso', 'Archivado'];

  const tabs: { id: typeof activeSection; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: t.filterAll, icon: Sparkles },
    { id: 'complaints', label: t.filterComplaints, icon: MessageSquareWarning },
    { id: 'angles', label: t.filterAngles, icon: Target },
    { id: 'description', label: t.filterDescription, icon: FileText },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-24 space-y-5">

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-md bg-slate-950 border border-slate-700 flex items-center justify-center text-blue-400 flex-shrink-0">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-display font-semibold text-slate-50 tracking-tight">
                <span className="text-slate-400">{data.yourProduct}</span>
                <span className="text-slate-600 mx-2 text-sm">{t.vs}</span>
                <span>{data.competitorProduct}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 border border-slate-800 rounded-md px-3 py-1.5 text-xs">
            <span className="text-slate-500 font-medium">{t.status}:</span>
            <select
              value={data.status}
              onChange={(e) => onUpdateStatus(data.id, e.target.value as CommerceLensData['status'])}
              className="bg-transparent text-blue-400 font-semibold focus:outline-none cursor-pointer"
            >
              {statusOptions.map((st) => (
                <option key={st} value={st} className="bg-slate-900 text-slate-200">{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
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

      {/* Complaints */}
      {(activeSection === 'all' || activeSection === 'complaints') && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-base font-display font-semibold text-slate-50 flex items-center gap-2">
              <MessageSquareWarning className="h-4 w-4 text-amber-400" />
              <span>{t.complaintsTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.complaintsDesc}</p>
          </div>

          <div className="space-y-3">
            {data.complaints.map((c, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-md p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-100">{c.issue}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex-shrink-0 ${frequencyClasses(c.frequency)}`}>
                    {t.frequency}: {c.frequency}
                  </span>
                </div>
                <p className="text-xs text-slate-400 italic leading-relaxed">"{c.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attack Angles */}
      {(activeSection === 'all' || activeSection === 'angles') && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <h3 className="text-base font-display font-semibold text-slate-50 flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-400" />
            <span>{t.anglesTitle}</span>
          </h3>

          <div className="space-y-3">
            {data.attackAngles.map((a, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-md p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase text-blue-400 tracking-wider">{a.angle}</span>
                  <button
                    onClick={() => handleCopy(a.adCopy, `angle_${idx}`)}
                    className="text-slate-500 hover:text-blue-400 transition cursor-pointer"
                    title={t.copyAngle}
                  >
                    {copiedKey === `angle_${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{a.adCopy}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Persuasive Description */}
      {(activeSection === 'all' || activeSection === 'description') && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-display font-semibold text-slate-50 flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-400" />
                <span>{t.descriptionTitle}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{t.descriptionDesc}</p>
            </div>
            <button
              onClick={() => handleCopy(data.productDescription, 'description')}
              className="text-slate-400 hover:text-blue-400 px-3 py-1 rounded-md text-xs font-semibold border border-slate-700 hover:border-blue-600/50 transition flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              {copiedKey === 'description' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedKey === 'description' ? 'Copiado' : t.copyDescription}</span>
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-md p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {data.productDescription}
          </div>
        </div>
      )}

    </div>
  );
};
