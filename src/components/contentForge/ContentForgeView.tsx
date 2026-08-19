import React, { useState } from 'react';
import { Sparkles, Zap, FileText, LayoutGrid, Copy, Check, Share2, Hash, Newspaper, Video } from 'lucide-react';
import type { ContentForgeData, ContentChannel } from '../../types';
import type { Language } from '../../i18n/translations';
import { translations } from '../../i18n/translations';

interface ContentForgeViewProps {
  data: ContentForgeData;
  onUpdateStatus: (id: string, newStatus: ContentForgeData['status']) => void;
  language: Language;
}

const CHANNEL_ICONS: Record<ContentChannel, React.ElementType> = {
  linkedin: Share2,
  twitter: Hash,
  newsletter: Newspaper,
  tiktok: Video,
};

const CHANNEL_LABEL_KEY: Record<ContentChannel, 'channelLinkedIn' | 'channelTwitter' | 'channelNewsletter' | 'channelTiktok'> = {
  linkedin: 'channelLinkedIn',
  twitter: 'channelTwitter',
  newsletter: 'channelNewsletter',
  tiktok: 'channelTiktok',
};

export const ContentForgeView: React.FC<ContentForgeViewProps> = ({ data, onUpdateStatus, language }) => {
  const t = translations[language].contentForge;
  const [activeSection, setActiveSection] = useState<'all' | 'hooks' | 'post' | 'carousel'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const statusOptions: ContentForgeData['status'][] = ['Borrador', 'Programado', 'Publicado'];
  const ChannelIcon = CHANNEL_ICONS[data.channel];

  const tabs: { id: typeof activeSection; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: t.filterAll, icon: Sparkles },
    { id: 'hooks', label: t.filterHooks, icon: Zap },
    { id: 'post', label: t.filterPost, icon: FileText },
    { id: 'carousel', label: t.filterCarousel, icon: LayoutGrid },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-24 space-y-5">

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-md bg-slate-950 border border-slate-700 flex items-center justify-center text-amber-400 flex-shrink-0">
              <ChannelIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-display font-semibold text-slate-50 tracking-tight">{data.topic}</h2>
              <p className="text-xs text-slate-400 mt-1">
                <span className="text-slate-500">{t.channel}:</span> <span className="text-blue-400 font-medium">{t[CHANNEL_LABEL_KEY[data.channel]]}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 border border-slate-800 rounded-md px-3 py-1.5 text-xs">
            <span className="text-slate-500 font-medium">{t.status}:</span>
            <select
              value={data.status}
              onChange={(e) => onUpdateStatus(data.id, e.target.value as ContentForgeData['status'])}
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

      {/* Hooks */}
      {(activeSection === 'all' || activeSection === 'hooks') && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-base font-display font-semibold text-slate-50 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>{t.hooksTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.hooksDesc}</p>
          </div>

          <div className="space-y-2.5">
            {data.hooks.map((hook, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-md p-4 flex items-start justify-between gap-3">
                <p className="text-sm text-slate-200 leading-relaxed">{hook}</p>
                <button
                  onClick={() => handleCopy(hook, `hook_${idx}`)}
                  className="text-slate-400 hover:text-blue-400 p-1.5 rounded-md border border-slate-700 hover:border-blue-600/50 transition flex-shrink-0 cursor-pointer"
                  title={t.copyHook}
                >
                  {copiedKey === `hook_${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post */}
      {(activeSection === 'all' || activeSection === 'post') && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-slate-500" />
              {t.postTitle}
            </span>
            <button
              onClick={() => handleCopy(`${data.post.title}\n\n${data.post.body}`, 'post')}
              className="text-slate-400 hover:text-blue-400 px-3 py-1 rounded-md text-xs font-semibold border border-slate-700 hover:border-blue-600/50 transition flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'post' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedKey === 'post' ? 'Copiado' : t.copyPost}</span>
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-md p-4 text-sm space-y-2">
            <div className="text-slate-100 font-semibold">{data.post.title}</div>
            <div className="border-t border-slate-800 pt-3 text-slate-300 leading-relaxed whitespace-pre-line">
              {data.post.body}
            </div>
          </div>
        </div>
      )}

      {/* Carousel */}
      {(activeSection === 'all' || activeSection === 'carousel') && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-base font-display font-semibold text-slate-50 flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-blue-400" />
              <span>{t.carouselTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.carouselDesc}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.carousel.map((slide) => (
              <div key={slide.slideNumber} className="bg-slate-950 border border-slate-800 rounded-md p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold text-amber-400 uppercase tracking-wider">
                    {t.slide} {slide.slideNumber}/5
                  </span>
                  <button
                    onClick={() => handleCopy(`${slide.title}\n\n${slide.body}`, `slide_${slide.slideNumber}`)}
                    className="text-slate-500 hover:text-blue-400 transition cursor-pointer"
                    title={t.copySlide}
                  >
                    {copiedKey === `slide_${slide.slideNumber}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-slate-100">{slide.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{slide.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
