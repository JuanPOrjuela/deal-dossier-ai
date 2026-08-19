import type { DossierData, ContentForgeData, TalentPulseData, CommerceLensData, AppId } from '../types';

const STORAGE_KEYS = {
  DOSSIERS: 'deal_dossier_saved_v1',
  CONTENT_FORGE: 'cloud_ais_content_forge_v1',
  TALENT_PULSE: 'cloud_ais_talent_pulse_v1',
  COMMERCE_LENS: 'cloud_ais_commerce_lens_v1',
  API_KEY: 'deal_dossier_gemini_key_v1',
  THEME: 'deal_dossier_theme_v1',
  ACTIVE_APP: 'cloud_ais_active_app_v1',
};

interface HasId {
  id: string;
  status: string;
}

function createHistoryStore<T extends HasId>(storageKey: string) {
  return {
    getAll(): T[] {
      try {
        const data = localStorage.getItem(storageKey);
        return data ? JSON.parse(data) : [];
      } catch {
        return [];
      }
    },
    save(item: T): T[] {
      const list = this.getAll();
      const existingIdx = list.findIndex((i) => i.id === item.id);
      const updated = existingIdx >= 0
        ? list.map((i, idx) => (idx === existingIdx ? item : i))
        : [item, ...list];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    },
    updateStatus(id: string, status: T['status']): T[] {
      const list = this.getAll();
      const updated = list.map((i) => (i.id === id ? { ...i, status } : i));
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    },
    remove(id: string): T[] {
      const updated = this.getAll().filter((i) => i.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    },
  };
}

const dossierStore = createHistoryStore<DossierData>(STORAGE_KEYS.DOSSIERS);
const contentForgeStore = createHistoryStore<ContentForgeData>(STORAGE_KEYS.CONTENT_FORGE);
const talentPulseStore = createHistoryStore<TalentPulseData>(STORAGE_KEYS.TALENT_PULSE);
const commerceLensStore = createHistoryStore<CommerceLensData>(STORAGE_KEYS.COMMERCE_LENS);

export const StorageService = {
  // DealDossier AI
  getDossiers: () => dossierStore.getAll(),
  saveDossier: (dossier: DossierData) => dossierStore.save(dossier),
  updateDossierStatus: (id: string, status: DossierData['status']) => dossierStore.updateStatus(id, status),
  deleteDossier: (id: string) => dossierStore.remove(id),

  // ContentForge AI
  getContentForgeHistory: () => contentForgeStore.getAll(),
  saveContentForgeItem: (item: ContentForgeData) => contentForgeStore.save(item),
  updateContentForgeStatus: (id: string, status: ContentForgeData['status']) => contentForgeStore.updateStatus(id, status),
  deleteContentForgeItem: (id: string) => contentForgeStore.remove(id),

  // TalentPulse AI
  getTalentPulseHistory: () => talentPulseStore.getAll(),
  saveTalentPulseItem: (item: TalentPulseData) => talentPulseStore.save(item),
  updateTalentPulseStatus: (id: string, status: TalentPulseData['status']) => talentPulseStore.updateStatus(id, status),
  deleteTalentPulseItem: (id: string) => talentPulseStore.remove(id),

  // CommerceLens AI
  getCommerceLensHistory: () => commerceLensStore.getAll(),
  saveCommerceLensItem: (item: CommerceLensData) => commerceLensStore.save(item),
  updateCommerceLensStatus: (id: string, status: CommerceLensData['status']) => commerceLensStore.updateStatus(id, status),
  deleteCommerceLensItem: (id: string) => commerceLensStore.remove(id),

  // Shared suite state
  getApiKey(): string {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  },

  setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
  },

  getTheme(): 'dark' | 'light' {
    return localStorage.getItem(STORAGE_KEYS.THEME) === 'light' ? 'light' : 'dark';
  },

  setTheme(theme: 'dark' | 'light'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  getActiveApp(): AppId {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_APP);
    const valid: AppId[] = ['dealDossier', 'contentForge', 'talentPulse', 'commerceLens'];
    return valid.includes(stored as AppId) ? (stored as AppId) : 'dealDossier';
  },

  setActiveApp(appId: AppId): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_APP, appId);
  },
};
