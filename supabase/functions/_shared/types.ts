export type AppId = 'dealDossier' | 'contentForge' | 'talentPulse' | 'commerceLens';
export type Language = 'es' | 'en';
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
  post: { title: string; body: string };
  carousel: CarouselSlide[];
  status: 'Borrador' | 'Programado' | 'Publicado';
}

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

export interface DossierData {
  id: string;
  createdAt: string;
  companyName: string;
  websiteUrl: string;
  industry: string;
  targetPersona: string;
  sellerOffer: string;
  summary: string;
  dealScore: {
    overall: number;
    budgetTier: string;
    urgencyScore: number;
    buyingWindow: string;
    priorityLabel: string;
  };
  companyDna: {
    businessModel: string;
    targetAudience: string;
    estimatedSize: string;
  };
  painPoints: { issue: string; impact: string; urgency: 'Crítica' | 'Alta' | 'Media' }[];
  toneAngles: Record<string, {
    title: string;
    hook: string;
    coldEmailSubject: string;
    coldEmailBody: string;
    linkedInMessage: string;
    whyItWorks: string;
  }>;
  objections: { objection: string; rebuttal: string; context: string }[];
  status: 'Nuevo' | 'Contactado' | 'En Reunión' | 'Propuesta Enviada' | 'Ganado';
}
