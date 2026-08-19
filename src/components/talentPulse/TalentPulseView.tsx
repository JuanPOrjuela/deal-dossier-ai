import React, { useState } from 'react';
import { Sparkles, ThumbsUp, AlertTriangle, MessageCircleQuestion, Copy, Check, User } from 'lucide-react';
import type { TalentPulseData } from '../../types';
import type { Language } from '../../i18n/translations';
import { translations } from '../../i18n/translations';

interface TalentPulseViewProps {
  data: TalentPulseData;
  onUpdateStatus: (id: string, newStatus: TalentPulseData['status']) => void;
  language: Language;
}

function scoreColor(score: number): { text: string; bar: string; ring: string } {
  if (score >= 78) return { text: 'text-emerald-400', bar: 'bg-emerald-500', ring: 'border-emerald-500' };
  if (score >= 55) return { text: 'text-amber-400', bar: 'bg-amber-500', ring: 'border-amber-500' };
  return { text: 'text-red-400', bar: 'bg-red-500', ring: 'border-red-500' };
}

function severityClasses(severity: 'Alta' | 'Media' | 'Baja'): string {
  if (severity === 'Alta') return 'bg-red-950/40 text-red-400 border-red-800/50';
  if (severity === 'Media') return 'bg-amber-900/20 text-amber-300 border-amber-700/40';
  return 'bg-slate-900 text-slate-400 border-slate-700';
}

export const TalentPulseView: React.FC<TalentPulseViewProps> = ({ data, onUpdateStatus, language }) => {
  const t = translations[language].talentPulse;
  const [activeSection, setActiveSection] = useState<'all' | 'strengths' | 'flags' | 'questions'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const statusOptions: TalentPulseData['status'][] = ['Nuevo', 'Entrevista Agendada', 'Rechazado', 'Contratado'];
  const colors = scoreColor(data.matchScore);

  const tabs: { id: typeof activeSection; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: t.filterAll, icon: Sparkles },
    { id: 'strengths', label: t.filterStrengths, icon: ThumbsUp },
    { id: 'flags', label: t.filterFlags, icon: AlertTriangle },
    { id: 'questions', label: t.filterQuestions, icon: MessageCircleQuestion },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-24 space-y-5">

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-full border-2 ${colors.ring} flex items-center justify-center flex-shrink-0`}>
              <User className={`h-6 w-6 ${colors.text}`} />
            </div>
            <div>
              <h2 className="text-xl font-display font-semibold text-slate-50 tracking-tight">{data.candidateName}</h2>
              <p className="text-xs text-slate-400 mt-1">{data.jobTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 border border-slate-800 rounded-md px-3 py-1.5 text-xs">
            <span className="text-slate-500 font-medium">{t.status}:</span>
            <select
              value={data.status}
              onChange={(e) => onUpdateStatus(data.id, e.target.value as TalentPulseData['status'])}
              className="bg-transparent text-blue-400 font-semibold focus:outline-none cursor-pointer"
            >
              {statusOptions.map((st) => (
                <option key={st} value={st} className="bg-slate-900 text-slate-200">{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Match Score */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{t.matchScore}</span>
            <span className={`text-xs font-semibold ${colors.text}`}>{data.verdict}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-mono font-bold ${colors.text}`}>{data.matchScore}</span>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${colors.bar} transition-all`} style={{ width: `${data.matchScore}%` }} />
            </div>
            <span className="text-xs text-slate-600 font-mono">/100</span>
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

      {/* Strengths */}
      {(activeSection === 'all' || activeSection === 'strengths') && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-3">
          <h3 className="text-base font-display font-semibold text-slate-50 flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-emerald-400" />
            <span>{t.strengthsTitle}</span>
          </h3>
          <ul className="space-y-2">
            {data.strengths.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-950 border border-slate-800 rounded-md p-3">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Red Flags */}
      {(activeSection === 'all' || activeSection === 'flags') && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-3">
          <h3 className="text-base font-display font-semibold text-slate-50 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>{t.redFlagsTitle}</span>
          </h3>
          {data.redFlags.length === 0 ? (
            <p className="text-xs text-slate-500 italic">{t.noFlags}</p>
          ) : (
            <ul className="space-y-2">
              {data.redFlags.map((flag, idx) => (
                <li key={idx} className="flex items-center justify-between gap-3 bg-slate-950 border border-slate-800 rounded-md p-3">
                  <span className="text-sm text-slate-300">{flag.issue}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex-shrink-0 ${severityClasses(flag.severity)}`}>
                    {flag.severity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Interview Questions */}
      {(activeSection === 'all' || activeSection === 'questions') && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <h3 className="text-base font-display font-semibold text-slate-50 flex items-center gap-2">
            <MessageCircleQuestion className="h-4 w-4 text-blue-400" />
            <span>{t.questionsTitle}</span>
          </h3>
          <div className="space-y-3">
            {data.interviewQuestions.map((q, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-md p-4 space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-100 leading-relaxed">{idx + 1}. {q.question}</p>
                  <button
                    onClick={() => handleCopy(q.question, `q_${idx}`)}
                    className="text-slate-500 hover:text-blue-400 transition flex-shrink-0 cursor-pointer"
                    title={t.copyQuestion}
                  >
                    {copiedKey === `q_${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 italic">{t.whyAsk} {q.whyAsk}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
