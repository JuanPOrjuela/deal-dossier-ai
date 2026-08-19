import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AppSwitcher } from './components/AppSwitcher';
import { CompanyInput } from './components/CompanyInput';
import { DossierView } from './components/DossierView';
import { ContentForgeInput } from './components/contentForge/ContentForgeInput';
import { ContentForgeView } from './components/contentForge/ContentForgeView';
import { TalentPulseInput } from './components/talentPulse/TalentPulseInput';
import { TalentPulseView } from './components/talentPulse/TalentPulseView';
import { CommerceLensInput } from './components/commerceLens/CommerceLensInput';
import { CommerceLensView } from './components/commerceLens/CommerceLensView';
import { HistoryDrawer, type HistoryItem } from './components/HistoryDrawer';
import { BundlePricingModal } from './components/BundlePricingModal';
import { SettingsModal } from './components/SettingsModal';
import type { DossierData, ContentForgeData, TalentPulseData, CommerceLensData, UserCredits, AppId, ContentChannel } from './types';
import type { Language } from './i18n/translations';
import { translations } from './i18n/translations';
import { generateDossierWithGemini } from './services/gemini';
import { generateContentForgeMock } from './services/mock/contentForge';
import { generateTalentPulseMock } from './services/mock/talentPulse';
import { generateCommerceLensMock } from './services/mock/commerceLens';
import { StorageService } from './services/storage';

const CHANNEL_LABEL: Record<ContentChannel, string> = {
  linkedin: 'LinkedIn',
  twitter: 'Twitter/X',
  newsletter: 'Newsletter',
  tiktok: 'TikTok',
};

export const App: React.FC = () => {
  const [activeApp, setActiveApp] = useState<AppId>('dealDossier');
  const [language, setLanguage] = useState<Language>('es');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [credits, setCredits] = useState<UserCredits>({ used: 0, limit: 5, isPro: false });
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // DealDossier AI
  const [dossiers, setDossiers] = useState<DossierData[]>([]);
  const [currentDossier, setCurrentDossier] = useState<DossierData | null>(null);

  // ContentForge AI
  const [contentForgeHistory, setContentForgeHistory] = useState<ContentForgeData[]>([]);
  const [currentContentForge, setCurrentContentForge] = useState<ContentForgeData | null>(null);

  // TalentPulse AI
  const [talentPulseHistory, setTalentPulseHistory] = useState<TalentPulseData[]>([]);
  const [currentTalentPulse, setCurrentTalentPulse] = useState<TalentPulseData | null>(null);

  // CommerceLens AI
  const [commerceLensHistory, setCommerceLensHistory] = useState<CommerceLensData[]>([]);
  const [currentCommerceLens, setCurrentCommerceLens] = useState<CommerceLensData | null>(null);

  // Modal states
  const [isPricingOpen, setIsPricingOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  useEffect(() => {
    setActiveApp(StorageService.getActiveApp());
    setDossiers(StorageService.getDossiers());
    setContentForgeHistory(StorageService.getContentForgeHistory());
    setTalentPulseHistory(StorageService.getTalentPulseHistory());
    setCommerceLensHistory(StorageService.getCommerceLensHistory());
    setCredits(StorageService.getCredits());
    setApiKey(StorageService.getApiKey());
    setTheme(StorageService.getTheme());
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const handleToggleTheme = (next: 'dark' | 'light') => {
    setTheme(next);
    StorageService.setTheme(next);
  };

  const handleSwitchApp = (appId: AppId) => {
    setActiveApp(appId);
    StorageService.setActiveApp(appId);
  };

  const consumeCredit = (): boolean => {
    if (!credits.isPro && credits.used >= credits.limit) {
      setIsPricingOpen(true);
      return false;
    }
    if (!credits.isPro) {
      setCredits(StorageService.incrementCredits());
    }
    return true;
  };

  // --- DealDossier AI ---
  const handleAnalyzeDossier = async (url: string, persona: string, offer: string) => {
    if (!consumeCredit()) return;
    setIsLoading(true);
    try {
      const newDossier = await generateDossierWithGemini(url, persona, offer, apiKey, language);
      setDossiers(StorageService.saveDossier(newDossier));
      setCurrentDossier(newDossier);
    } catch (error) {
      console.error('Error generating dossier:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDossierStatus = (id: string, newStatus: DossierData['status']) => {
    setDossiers(StorageService.updateDossierStatus(id, newStatus));
    if (currentDossier?.id === id) setCurrentDossier({ ...currentDossier, status: newStatus });
  };

  const handleDeleteDossier = (id: string) => {
    setDossiers(StorageService.deleteDossier(id));
    if (currentDossier?.id === id) setCurrentDossier(null);
  };

  // --- ContentForge AI ---
  const handleGenerateContentForge = async (topic: string, channel: ContentChannel) => {
    if (!consumeCredit()) return;
    setIsLoading(true);
    try {
      const result = await generateContentForgeMock(topic, channel, language);
      setContentForgeHistory(StorageService.saveContentForgeItem(result));
      setCurrentContentForge(result);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateContentForgeStatus = (id: string, newStatus: ContentForgeData['status']) => {
    setContentForgeHistory(StorageService.updateContentForgeStatus(id, newStatus));
    if (currentContentForge?.id === id) setCurrentContentForge({ ...currentContentForge, status: newStatus });
  };

  const handleDeleteContentForge = (id: string) => {
    setContentForgeHistory(StorageService.deleteContentForgeItem(id));
    if (currentContentForge?.id === id) setCurrentContentForge(null);
  };

  // --- TalentPulse AI ---
  const handleAnalyzeTalentPulse = async (jobDescription: string, candidateProfile: string) => {
    if (!consumeCredit()) return;
    setIsLoading(true);
    try {
      const result = await generateTalentPulseMock(jobDescription, candidateProfile, language);
      setTalentPulseHistory(StorageService.saveTalentPulseItem(result));
      setCurrentTalentPulse(result);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTalentPulseStatus = (id: string, newStatus: TalentPulseData['status']) => {
    setTalentPulseHistory(StorageService.updateTalentPulseStatus(id, newStatus));
    if (currentTalentPulse?.id === id) setCurrentTalentPulse({ ...currentTalentPulse, status: newStatus });
  };

  const handleDeleteTalentPulse = (id: string) => {
    setTalentPulseHistory(StorageService.deleteTalentPulseItem(id));
    if (currentTalentPulse?.id === id) setCurrentTalentPulse(null);
  };

  // --- CommerceLens AI ---
  const handleAuditCommerceLens = async (competitor: string, yourProduct: string) => {
    if (!consumeCredit()) return;
    setIsLoading(true);
    try {
      const result = await generateCommerceLensMock(competitor, yourProduct, language);
      setCommerceLensHistory(StorageService.saveCommerceLensItem(result));
      setCurrentCommerceLens(result);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCommerceLensStatus = (id: string, newStatus: CommerceLensData['status']) => {
    setCommerceLensHistory(StorageService.updateCommerceLensStatus(id, newStatus));
    if (currentCommerceLens?.id === id) setCurrentCommerceLens({ ...currentCommerceLens, status: newStatus });
  };

  const handleDeleteCommerceLens = (id: string) => {
    setCommerceLensHistory(StorageService.deleteCommerceLensItem(id));
    if (currentCommerceLens?.id === id) setCurrentCommerceLens(null);
  };

  // --- Shared suite state ---
  const handleUpgradeToPro = () => setCredits(StorageService.setProPlan());
  const handleSaveApiKey = (key: string) => {
    StorageService.setApiKey(key);
    setApiKey(key);
  };

  const t = translations[language].shell;

  // Map each app's history into the generic HistoryDrawer shape
  const historyByApp: Record<AppId, { title: string; items: HistoryItem[]; onSelect: (id: string) => void; onDelete: (id: string) => void }> = {
    dealDossier: {
      title: `${t.savedItems} (${dossiers.length})`,
      items: dossiers.map((d) => ({ id: d.id, title: d.companyName, subtitle: d.websiteUrl, date: d.createdAt, status: d.status })),
      onSelect: (id) => setCurrentDossier(dossiers.find((d) => d.id === id) || null),
      onDelete: handleDeleteDossier,
    },
    contentForge: {
      title: `${t.savedItems} (${contentForgeHistory.length})`,
      items: contentForgeHistory.map((c) => ({ id: c.id, title: c.topic, subtitle: CHANNEL_LABEL[c.channel], date: c.createdAt, status: c.status })),
      onSelect: (id) => setCurrentContentForge(contentForgeHistory.find((c) => c.id === id) || null),
      onDelete: handleDeleteContentForge,
    },
    talentPulse: {
      title: `${t.savedItems} (${talentPulseHistory.length})`,
      items: talentPulseHistory.map((c) => ({ id: c.id, title: c.candidateName, subtitle: c.jobTitle, date: c.createdAt, status: c.status })),
      onSelect: (id) => setCurrentTalentPulse(talentPulseHistory.find((c) => c.id === id) || null),
      onDelete: handleDeleteTalentPulse,
    },
    commerceLens: {
      title: `${t.savedItems} (${commerceLensHistory.length})`,
      items: commerceLensHistory.map((c) => ({ id: c.id, title: c.yourProduct, subtitle: `${t.apps.commerceLens.short} · ${c.competitorProduct}`, date: c.createdAt, status: c.status })),
      onSelect: (id) => setCurrentCommerceLens(commerceLensHistory.find((c) => c.id === id) || null),
      onDelete: handleDeleteCommerceLens,
    },
  };

  const activeHistory = historyByApp[activeApp];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">

      <Navbar
        credits={credits}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        historyCount={activeHistory.items.length}
        language={language}
        onToggleLanguage={(lang) => setLanguage(lang)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <AppSwitcher activeApp={activeApp} onSwitchApp={handleSwitchApp} language={language} />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4">

        {activeApp === 'dealDossier' && (
          <>
            <CompanyInput onAnalyze={handleAnalyzeDossier} isLoading={isLoading} language={language} />
            {currentDossier && (
              <div className="mt-4 animate-fadeIn">
                <DossierView dossier={currentDossier} onUpdateStatus={handleUpdateDossierStatus} language={language} />
              </div>
            )}
          </>
        )}

        {activeApp === 'contentForge' && (
          <>
            <ContentForgeInput onGenerate={handleGenerateContentForge} isLoading={isLoading} language={language} />
            {currentContentForge && (
              <div className="mt-4 animate-fadeIn">
                <ContentForgeView data={currentContentForge} onUpdateStatus={handleUpdateContentForgeStatus} language={language} />
              </div>
            )}
          </>
        )}

        {activeApp === 'talentPulse' && (
          <>
            <TalentPulseInput onAnalyze={handleAnalyzeTalentPulse} isLoading={isLoading} language={language} />
            {currentTalentPulse && (
              <div className="mt-4 animate-fadeIn">
                <TalentPulseView data={currentTalentPulse} onUpdateStatus={handleUpdateTalentPulseStatus} language={language} />
              </div>
            )}
          </>
        )}

        {activeApp === 'commerceLens' && (
          <>
            <CommerceLensInput onAudit={handleAuditCommerceLens} isLoading={isLoading} language={language} />
            {currentCommerceLens && (
              <div className="mt-4 animate-fadeIn">
                <CommerceLensView data={currentCommerceLens} onUpdateStatus={handleUpdateCommerceLensStatus} language={language} />
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        <p>{t.footer}</p>
      </footer>

      {/* Drawers and Modals */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title={activeHistory.title}
        items={activeHistory.items}
        emptyMessage={t.emptyHistory}
        deleteLabel={t.delete}
        onSelect={activeHistory.onSelect}
        onDelete={activeHistory.onDelete}
      />

      <BundlePricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onUpgradeToPro={handleUpgradeToPro}
        isPro={credits.isPro}
        language={language}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        language={language}
      />
    </div>
  );
};

export default App;
