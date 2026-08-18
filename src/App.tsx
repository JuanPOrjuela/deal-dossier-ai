import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CompanyInput } from './components/CompanyInput';
import { DossierView } from './components/DossierView';
import { HistoryList } from './components/HistoryList';
import { PricingModal } from './components/PricingModal';
import { SettingsModal } from './components/SettingsModal';
import type { DossierData, UserCredits } from './types';
import type { Language } from './i18n/translations';
import { generateDossierWithGemini } from './services/gemini';
import { StorageService } from './services/storage';

export const App: React.FC = () => {
  const [dossiers, setDossiers] = useState<DossierData[]>([]);
  const [currentDossier, setCurrentDossier] = useState<DossierData | null>(null);
  const [credits, setCredits] = useState<UserCredits>({ used: 0, limit: 5, isPro: false });
  const [apiKey, setApiKey] = useState<string>('');
  const [language, setLanguage] = useState<Language>('es');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modal states
  const [isPricingOpen, setIsPricingOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  useEffect(() => {
    setDossiers(StorageService.getDossiers());
    setCredits(StorageService.getCredits());
    setApiKey(StorageService.getApiKey());
  }, []);

  const handleAnalyze = async (url: string, persona: string, offer: string) => {
    if (!credits.isPro && credits.used >= credits.limit) {
      setIsPricingOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const newDossier = await generateDossierWithGemini(url, persona, offer, apiKey, language);
      const updatedList = StorageService.saveDossier(newDossier);
      setDossiers(updatedList);
      setCurrentDossier(newDossier);
      
      if (!credits.isPro) {
        const updatedCredits = StorageService.incrementCredits();
        setCredits(updatedCredits);
      }
    } catch (error) {
      console.error('Error generating dossier:', error);
      alert('Error generating dossier. Please check connection or API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: DossierData['status']) => {
    const updated = StorageService.updateStatus(id, newStatus);
    setDossiers(updated);
    if (currentDossier && currentDossier.id === id) {
      setCurrentDossier({ ...currentDossier, status: newStatus });
    }
  };

  const handleDeleteDossier = (id: string) => {
    const updated = StorageService.deleteDossier(id);
    setDossiers(updated);
    if (currentDossier && currentDossier.id === id) {
      setCurrentDossier(null);
    }
  };

  const handleUpgradeToPro = () => {
    const updated = StorageService.setProPlan();
    setCredits(updated);
  };

  const handleSaveApiKey = (key: string) => {
    StorageService.setApiKey(key);
    setApiKey(key);
  };

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100 flex flex-col selection:bg-gold-600 selection:text-ink-950">
      
      {/* Top Navbar with Language Switcher */}
      <Navbar
        credits={credits}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        historyCount={dossiers.length}
        language={language}
        onToggleLanguage={(lang) => setLanguage(lang)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4">
        
        {/* Search Bar / Input Card */}
        <CompanyInput
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          language={language}
        />

        {/* Dossier Results */}
        {currentDossier && (
          <div className="mt-4 animate-fadeIn">
            <DossierView
              dossier={currentDossier}
              onUpdateStatus={handleUpdateStatus}
              language={language}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-ink-900 py-6 text-center text-xs text-ink-600">
        <p>Deal Dossier — B2B sales intelligence for agencies and outbound teams</p>
      </footer>

      {/* Drawers and Modals */}
      <HistoryList
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        dossiers={dossiers}
        onSelectDossier={(d) => setCurrentDossier(d)}
        onDeleteDossier={handleDeleteDossier}
      />

      <PricingModal
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
      />
    </div>
  );
};

export default App;
