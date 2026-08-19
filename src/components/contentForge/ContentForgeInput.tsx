import React, { useState } from 'react';
import { PenTool, Share2, Hash, Newspaper, Video, ArrowRight, Sparkles } from 'lucide-react';
import type { ContentChannel } from '../../types';
import type { Language } from '../../i18n/translations';
import { translations } from '../../i18n/translations';

interface ContentForgeInputProps {
  onGenerate: (topic: string, channel: ContentChannel) => void;
  isLoading: boolean;
  language: Language;
}

const CHANNELS: { id: ContentChannel; icon: React.ElementType; labelKey: 'channelLinkedIn' | 'channelTwitter' | 'channelNewsletter' | 'channelTiktok' }[] = [
  { id: 'linkedin', icon: Share2, labelKey: 'channelLinkedIn' },
  { id: 'twitter', icon: Hash, labelKey: 'channelTwitter' },
  { id: 'newsletter', icon: Newspaper, labelKey: 'channelNewsletter' },
  { id: 'tiktok', icon: Video, labelKey: 'channelTiktok' },
];

export const ContentForgeInput: React.FC<ContentForgeInputProps> = ({ onGenerate, isLoading, language }) => {
  const t = translations[language].contentForge;
  const [topic, setTopic] = useState('');
  const [channel, setChannel] = useState<ContentChannel>('linkedin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;
    onGenerate(topic.trim(), channel);
  };

  const handleQuickDemo = (sampleTopic: string, sampleChannel: ContentChannel) => {
    setTopic(sampleTopic);
    setChannel(sampleChannel);
    onGenerate(sampleTopic, sampleChannel);
  };

  return (
    <div className="w-full max-w-3xl mx-auto pt-12 pb-16 px-4">

      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-amber-400 font-semibold mb-3">
          <PenTool className="h-3.5 w-3.5" />
          ContentForge AI
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-medium text-slate-50 tracking-tight leading-tight">
          {t.heroTitle}
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto mt-3 leading-relaxed">
          {t.heroDesc}
        </p>
      </div>

      <div className="relative max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="relative z-10 space-y-3">
          <div className="flex items-center bg-slate-900 border border-slate-700 hover:border-slate-500 focus-within:border-blue-500 rounded-lg pl-4 pr-1.5 py-1.5 transition-colors duration-200">
            <PenTool className="h-4 w-4 text-slate-500 mr-2.5 flex-shrink-0" />
            <input
              type="text"
              placeholder={t.inputPlaceholder}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              className="flex-1 bg-transparent text-slate-50 placeholder-slate-500 text-sm py-2 focus:outline-none font-medium"
            />
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-md text-xs sm:text-sm flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-1.5">
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t.generatingButton}</span>
                </div>
              ) : (
                <>
                  <span>{t.generateButton}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">{t.channelLabel}</label>
            <div className="flex flex-wrap gap-1.5">
              {CHANNELS.map(({ id, icon: Icon, labelKey }) => {
                const isActive = channel === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setChannel(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{t[labelKey]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
          <span className="text-slate-500 font-medium">{t.exploreExamples}</span>

          <button
            type="button"
            onClick={() => handleQuickDemo(t.example1, 'linkedin')}
            className="flex items-center gap-1.5 text-slate-300 hover:text-slate-50 border-b border-transparent hover:border-slate-500 pb-0.5 transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-slate-500" />
            <span>{t.example1}</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo(t.example2, 'twitter')}
            className="flex items-center gap-1.5 text-slate-300 hover:text-slate-50 border-b border-transparent hover:border-slate-500 pb-0.5 transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-slate-500" />
            <span>{t.example2}</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo(t.example3, 'newsletter')}
            className="flex items-center gap-1.5 text-slate-300 hover:text-slate-50 border-b border-transparent hover:border-slate-500 pb-0.5 transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-slate-500" />
            <span>{t.example3}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
