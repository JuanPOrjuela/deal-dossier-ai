import React, { useState } from 'react';
import { Users, Briefcase, FileUser, ArrowRight, Sparkles } from 'lucide-react';
import type { Language } from '../../i18n/translations';
import { translations } from '../../i18n/translations';

interface TalentPulseInputProps {
  onAnalyze: (jobDescription: string, candidateProfile: string) => void;
  isLoading: boolean;
  language: Language;
}

const EXAMPLE_JOBS: Record<Language, { job: string; candidate: string }[]> = {
  es: [
    {
      job: 'Head of Sales SaaS — Liderar equipo comercial de 8 personas, responsable de $2M ARR, experiencia en ventas B2B consultivas.',
      candidate: 'Gerente Comercial con 6 años liderando equipos de ventas SaaS, incrementó ARR en 40% en 18 meses, experiencia con Salesforce y HubSpot.',
    },
    {
      job: 'Senior Frontend Engineer — React, TypeScript, sistemas de diseño, 5+ años de experiencia, trabajo en equipo remoto.',
      candidate: 'Frontend Developer con 4 años en React y TypeScript, construyó un design system usado por 3 equipos, experiencia parcial remota.',
    },
    {
      job: 'People & Culture Lead — Diseñar estrategia de cultura organizacional para startup de 80 personas en crecimiento acelerado.',
      candidate: 'HR Business Partner con 5 años de experiencia, lideró onboarding y engagement en empresa de 50 a 120 personas.',
    },
  ],
  en: [
    {
      job: 'Head of Sales SaaS — Lead an 8-person commercial team, own $2M ARR, consultative B2B sales experience.',
      candidate: 'Sales Manager with 6 years leading SaaS sales teams, grew ARR by 40% in 18 months, experience with Salesforce and HubSpot.',
    },
    {
      job: 'Senior Frontend Engineer — React, TypeScript, design systems, 5+ years of experience, remote team collaboration.',
      candidate: 'Frontend Developer with 4 years in React and TypeScript, built a design system used by 3 teams, partial remote experience.',
    },
    {
      job: 'People & Culture Lead — Design the org culture strategy for an 80-person startup in hyper-growth.',
      candidate: 'HR Business Partner with 5 years of experience, led onboarding and engagement as the company grew from 50 to 120 people.',
    },
  ],
};

export const TalentPulseInput: React.FC<TalentPulseInputProps> = ({ onAnalyze, isLoading, language }) => {
  const t = translations[language].talentPulse;
  const [jobDescription, setJobDescription] = useState('');
  const [candidateProfile, setCandidateProfile] = useState('');
  const examples = EXAMPLE_JOBS[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim() || !candidateProfile.trim() || isLoading) return;
    onAnalyze(jobDescription.trim(), candidateProfile.trim());
  };

  const handleQuickDemo = (job: string, candidate: string) => {
    setJobDescription(job);
    setCandidateProfile(candidate);
    onAnalyze(job, candidate);
  };

  return (
    <div className="w-full max-w-3xl mx-auto pt-12 pb-16 px-4">

      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-emerald-400 font-semibold mb-3">
          <Users className="h-3.5 w-3.5" />
          TalentPulse AI
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-medium text-slate-50 tracking-tight leading-tight">
          {t.heroTitle}
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto mt-3 leading-relaxed">
          {t.heroDesc}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-3">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
            <Briefcase className="h-3.5 w-3.5 text-slate-500" />
            {t.jobDescLabel}
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder={t.jobDescPlaceholder}
            required
            rows={4}
            className="w-full bg-slate-900 border border-slate-700 hover:border-slate-500 focus:border-blue-500 rounded-lg px-4 py-3 text-slate-50 placeholder-slate-500 text-sm focus:outline-none resize-none transition-colors"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
            <FileUser className="h-3.5 w-3.5 text-slate-500" />
            {t.candidateLabel}
          </label>
          <textarea
            value={candidateProfile}
            onChange={(e) => setCandidateProfile(e.target.value)}
            placeholder={t.candidatePlaceholder}
            required
            rows={4}
            className="w-full bg-slate-900 border border-slate-700 hover:border-slate-500 focus:border-blue-500 rounded-lg px-4 py-3 text-slate-50 placeholder-slate-500 text-sm focus:outline-none resize-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !jobDescription.trim() || !candidateProfile.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-md text-sm flex items-center justify-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
        >
          {isLoading ? (
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t.analyzingButton}</span>
            </div>
          ) : (
            <>
              <span>{t.analyzeButton}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
        <span className="text-slate-500 font-medium">{t.exploreExamples}</span>
        {examples.map((ex, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickDemo(ex.job, ex.candidate)}
            className="flex items-center gap-1.5 text-slate-300 hover:text-slate-50 border-b border-transparent hover:border-slate-500 pb-0.5 transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-slate-500" />
            <span>{idx === 0 ? t.example1 : idx === 1 ? t.example2 : t.example3}</span>
          </button>
        ))}
      </div>

    </div>
  );
};
