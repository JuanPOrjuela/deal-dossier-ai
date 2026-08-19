import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
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
import { AuthModal } from './components/AuthModal';
import type { DossierData, ContentForgeData, TalentPulseData, CommerceLensData, AppId, ContentChannel } from './types';
import type { Language } from './i18n/translations';
import { translations } from './i18n/translations';
import { generateDossierWithGemini } from './services/gemini';
import { StorageService } from './services/storage';
import { supabase } from './services/supabaseClient';
import { fetchEntitlement, signOut as supabaseSignOut, callGenerate, type Entitlement } from './services/entitlements';

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
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Auth + entitlement (server-verified plan/credits -- see src/services/entitlements.ts)
  const [session, setSession] = useState<Session | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);

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
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  const t = translations[language].shell;
  const tAuthErrors = translations[language].shell;

  const refreshEntitlement = useCallback(async () => {
    const ent = await fetchEntitlement();
    setEntitlement(ent);
  }, []);

  useEffect(() => {
    setActiveApp(StorageService.getActiveApp());
    setDossiers(StorageService.getDossiers());
    setContentForgeHistory(StorageService.getContentForgeHistory());
    setTalentPulseHistory(StorageService.getTalentPulseHistory());
    setCommerceLensHistory(StorageService.getCommerceLensHistory());
    setApiKey(StorageService.getApiKey());
    setTheme(StorageService.getTheme());

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) refreshEntitlement();
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        refreshEntitlement();
      } else {
        setEntitlement(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [refreshEntitlement]);

  // Re-check entitlement whenever the tab regains focus -- catches the case
  // where the customer just came back from a LemonSqueezy checkout and the
  // webhook already upgraded their plan server-side.
  useEffect(() => {
    const onFocus = () => {
      if (session) refreshEntitlement();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [session, refreshEntitlement]);

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

  const handleSignOut = async () => {
    await supabaseSignOut();
    setSession(null);
    setEntitlement(null);
  };

  /**
   * Every generate-error string coming back from the `generate` Edge
   * Function maps to a user-facing action here: prompt sign-in, open
   * pricing, or just surface the message. This is the single place that
   * reacts to the server's entitlement decision.
   */
  const handleGenerateError = (error: string, message?: string) => {
    if (error === 'missing_auth' || error === 'invalid_session') {
      setIsAuthOpen(true);
      return;
    }
    if (error === 'out_of_credits') {
      alert(tAuthErrors.outOfCredits);
      setIsPricingOpen(true);
      return;
    }
    if (error === 'wrong_app') {
      alert(message || tAuthErrors.wrongApp);
      setIsPricingOpen(true);
      return;
    }
    if (error === 'subscription_inactive') {
      alert(tAuthErrors.subscriptionInactive);
      setIsPricingOpen(true);
      return;
    }
    alert(translations[language].auth.errorGeneric);
  };

  // --- DealDossier AI ---
  const handleAnalyzeDossier = async (url: string, persona: string, offer: string) => {
    setIsLoading(true);
    try {
      let newDossier: DossierData;
      if (apiKey && apiKey.trim().length > 10) {
        // Bring-your-own Gemini key: always free, always client-side, never
        // subject to the shared credit pool.
        newDossier = await generateDossierWithGemini(url, persona, offer, apiKey, language);
      } else {
        if (!session) {
          setIsAuthOpen(true);
          return;
        }
        const result = await callGenerate<DossierData>('dealDossier', language, { url, persona, offer });
        if (!result.ok) {
          handleGenerateError(result.error, result.message);
          return;
        }
        newDossier = result.data;
        refreshEntitlement();
      }
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
    if (!session) {
      setIsAuthOpen(true);
      return;
    }
    setIsLoading(true);
    try {
      const result = await callGenerate<ContentForgeData>('contentForge', language, { topic, channel });
      if (!result.ok) {
        handleGenerateError(result.error, result.message);
        return;
      }
      setContentForgeHistory(StorageService.saveContentForgeItem(result.data));
      setCurrentContentForge(result.data);
      refreshEntitlement();
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
    if (!session) {
      setIsAuthOpen(true);
      return;
    }
    setIsLoading(true);
    try {
      const result = await callGenerate<TalentPulseData>('talentPulse', language, { jobDescription, candidateProfile });
      if (!result.ok) {
        handleGenerateError(result.error, result.message);
        return;
      }
      setTalentPulseHistory(StorageService.saveTalentPulseItem(result.data));
      setCurrentTalentPulse(result.data);
      refreshEntitlement();
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
    if (!session) {
      setIsAuthOpen(true);
      return;
    }
    setIsLoading(true);
    try {
      const result = await callGenerate<CommerceLensData>('commerceLens', language, { competitor, yourProduct });
      if (!result.ok) {
        handleGenerateError(result.error, result.message);
        return;
      }
      setCommerceLensHistory(StorageService.saveCommerceLensItem(result.data));
      setCurrentCommerceLens(result.data);
      refreshEntitlement();
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
  const handleSaveApiKey = (key: string) => {
    StorageService.setApiKey(key);
    setApiKey(key);
  };

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
        entitlement={entitlement}
        userEmail={session?.user.email ?? null}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
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
        onRequireAuth={() => setIsAuthOpen(true)}
        userId={session?.user.id ?? null}
        userEmail={session?.user.email}
        currentPlan={entitlement?.plan ?? 'free'}
        language={language}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        language={language}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={refreshEntitlement}
        language={language}
      />
    </div>
  );
};

export default App;
