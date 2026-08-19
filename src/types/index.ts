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

// ---------------------------------------------------------------------------
// Cloud AIs suite: shared app identity
// ---------------------------------------------------------------------------

export type AppId = 'dealDossier' | 'contentForge' | 'talentPulse' | 'commerceLens';

export type BundlePlanId = 'single' | 'allAccess' | 'lifetime';

// ---------------------------------------------------------------------------
// ContentForge AI
// ---------------------------------------------------------------------------

export type ContentChannel = 'linkedin' | 'twitter' | 'newsletter' | 'tiktok';

export interface CarouselSlide {
  slideNumber: number;
  title: string;
  body: string;
}

export interface ContentForgeData {
  id: string;
  createdAt: string;
  topic: string;
  channel: ContentChannel;
  hooks: string[];
  post: {
    title: string;
    body: string;
  };
  carousel: CarouselSlide[];
  status: 'Borrador' | 'Programado' | 'Publicado';
}

// ---------------------------------------------------------------------------
// TalentPulse AI
// ---------------------------------------------------------------------------

export interface RedFlag {
  issue: string;
  severity: 'Alta' | 'Media' | 'Baja';
}

export interface InterviewQuestion {
  question: string;
  whyAsk: string;
}

export interface TalentPulseData {
  id: string;
  createdAt: string;
  jobTitle: string;
  candidateName: string;
  matchScore: number;
  verdict: 'Fuerte Match' | 'Match Parcial' | 'No Recomendado';
  strengths: string[];
  redFlags: RedFlag[];
  interviewQuestions: InterviewQuestion[];
  status: 'Nuevo' | 'Entrevista Agendada' | 'Rechazado' | 'Contratado';
}

// ---------------------------------------------------------------------------
// CommerceLens AI
// ---------------------------------------------------------------------------

export interface CompetitorComplaint {
  issue: string;
  frequency: 'Alta' | 'Media' | 'Baja';
  quote: string;
}

export interface AttackAngle {
  angle: string;
  adCopy: string;
}

export interface CommerceLensData {
  id: string;
  createdAt: string;
  competitorProduct: string;
  yourProduct: string;
  complaints: CompetitorComplaint[];
  attackAngles: AttackAngle[];
  productDescription: string;
  status: 'Nuevo' | 'En Uso' | 'Archivado';
}
