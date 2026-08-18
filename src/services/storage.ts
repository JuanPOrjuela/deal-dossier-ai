import type { DossierData, UserCredits } from '../types';

const STORAGE_KEYS = {
  DOSSIERS: 'deal_dossier_saved_v1',
  CREDITS: 'deal_dossier_credits_v1',
  API_KEY: 'deal_dossier_gemini_key_v1',
};

export const StorageService = {
  getDossiers(): DossierData[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOSSIERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveDossier(dossier: DossierData): DossierData[] {
    const list = this.getDossiers();
    const existingIdx = list.findIndex(d => d.id === dossier.id);
    let updated: DossierData[];
    if (existingIdx >= 0) {
      updated = [...list];
      updated[existingIdx] = dossier;
    } else {
      updated = [dossier, ...list];
    }
    localStorage.setItem(STORAGE_KEYS.DOSSIERS, JSON.stringify(updated));
    return updated;
  },

  updateStatus(id: string, newStatus: DossierData['status']): DossierData[] {
    const list = this.getDossiers();
    const updated = list.map(d => d.id === id ? { ...d, status: newStatus } : d);
    localStorage.setItem(STORAGE_KEYS.DOSSIERS, JSON.stringify(updated));
    return updated;
  },

  deleteDossier(id: string): DossierData[] {
    const list = this.getDossiers();
    const updated = list.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOSSIERS, JSON.stringify(updated));
    return updated;
  },

  getCredits(): UserCredits {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CREDITS);
      return data ? JSON.parse(data) : { used: 0, limit: 5, isPro: false };
    } catch {
      return { used: 0, limit: 5, isPro: false };
    }
  },

  incrementCredits(): UserCredits {
    const current = this.getCredits();
    const updated: UserCredits = { ...current, used: current.used + 1 };
    localStorage.setItem(STORAGE_KEYS.CREDITS, JSON.stringify(updated));
    return updated;
  },

  setProPlan(): UserCredits {
    const updated: UserCredits = { used: 0, limit: 9999, isPro: true };
    localStorage.setItem(STORAGE_KEYS.CREDITS, JSON.stringify(updated));
    return updated;
  },

  getApiKey(): string {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  },

  setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
  }
};
