import React, { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import type { AppId } from '../types';
import { submitFeedback, type FeedbackCategory } from '../services/feedback';

interface ContactSectionProps {
  language: Language;
  activeApp: AppId;
  defaultEmail?: string;
}

const CATEGORIES: FeedbackCategory[] = ['question', 'suggestion', 'bug', 'other'];

export const ContactSection: React.FC<ContactSectionProps> = ({ language, activeApp, defaultEmail }) => {
  const t = translations[language].shell.contact;
  const categoryLabel: Record<FeedbackCategory, string> = {
    question: t.categoryQuestion,
    suggestion: t.categorySuggestion,
    bug: t.categoryBug,
    other: t.categoryOther,
  };

  const [email, setEmail] = useState(defaultEmail ?? '');
  const [category, setCategory] = useState<FeedbackCategory>('question');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim() || status === 'sending') return;

    setStatus('sending');
    const result = await submitFeedback({ email, category, message, appContext: activeApp, language });
    if (result.ok) {
      setStatus('sent');
      setMessage('');
    } else {
      setStatus('error');
    }
  };

  return (
    <section className="mt-12 max-w-3xl mx-auto mb-16">
      <div className="border border-slate-800 rounded-2xl bg-slate-900/50 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="h-4 w-4 text-blue-400" />
          <h2 className="font-display font-semibold text-slate-50 text-xl">{t.title}</h2>
        </div>
        <p className="text-xs text-slate-500 mb-6">{t.desc}</p>

        {status === 'sent' ? (
          <div className="flex items-start gap-2 text-sm text-emerald-400 bg-emerald-900/10 border border-emerald-700/30 rounded-md p-4">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{t.successMsg}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.emailLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  required
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-md px-4 py-2.5 text-slate-100 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.categoryLabel}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-md px-4 py-2.5 text-slate-100 text-sm focus:outline-none cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{categoryLabel[c]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.messageLabel}</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.messagePlaceholder}
                required
                rows={4}
                maxLength={4000}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-md px-4 py-2.5 text-slate-100 text-sm focus:outline-none resize-none"
              />
            </div>

            {status === 'error' && <p className="text-xs text-red-400">{t.errorMsg}</p>}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-5 rounded-md text-xs transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              {status === 'sending' ? t.submittingCta : t.submitCta}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
