export interface PitchAngle {
  title: string;
  hook: string;
  coldEmailSubject: string;
  coldEmailBody: string;
  linkedInMessage: string;
  whyItWorks: string;
}

export type ToneId = 'consultivo' | 'roi' | 'challenger' | 'relacional';

export interface BuyingSignal {
  label: string;
  value: string;
  status: 'positive' | 'warning' | 'neutral';
}

export interface ObjectionItem {
  objection: string;
  rebuttal: string;
  context: string;
}

export interface DossierData {
  id: string;
  createdAt: string;
  companyName: string;
  websiteUrl: string;
  industry: string;
  targetPersona: string;
  sellerOffer: string;
  summary: string;
  
  // High-Density B2B Intelligence
  dealScore: {
    overall: number; // 0 - 100
    budgetTier: 'Tier 1 ($50k+)' | 'Tier 2 ($15k-$50k)' | 'Tier 3 (<$15k)';
    urgencyScore: number; // 1 - 10
    buyingWindow: string;
    priorityLabel: 'Alta Prioridad' | 'Oportunidad Regular' | 'Baja Prioridad';
  };
  
  buyingSignals: BuyingSignal[];

  companyDna: {
    businessModel: string;
    targetAudience: string;
    keyProducts: string[];
    estimatedSize: string;
    techStackSummary?: string[];
  };

  painPoints: {
    issue: string;
    impact: string;
    urgency: 'Crítica' | 'Alta' | 'Media';
  }[];

  // Dynamic Tones with distinct copy
  toneAngles: Record<ToneId, PitchAngle>;

  objections: ObjectionItem[];

  discoveryQuestions: string[];
  icebreakers: string[];
  status: 'Nuevo' | 'Contactado' | 'En Reunión' | 'Propuesta Enviada' | 'Ganado';
  notes?: string;
}

export interface UserCredits {
  used: number;
  limit: number;
  isPro: boolean;
}
