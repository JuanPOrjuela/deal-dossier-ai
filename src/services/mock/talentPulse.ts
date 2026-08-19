import type { TalentPulseData, RedFlag, InterviewQuestion } from '../../types';
import type { Language } from '../../i18n/translations';
import { seedFromString, cleanLabel, pickMany, numberInRange, delay, generateId } from '../mockUtils';

const STRENGTHS: Record<Language, string[]> = {
  es: [
    'Experiencia comprobable con métricas de impacto concretas, no solo responsabilidades genéricas.',
    'Trayectoria de crecimiento acelerado dentro de organizaciones similares en tamaño y etapa.',
    'Dominio de las herramientas y el stack que el puesto requiere desde el día uno.',
    'Comunicación escrita clara y estructurada — buena señal para roles con contacto directo con clientes.',
    'Historial de permanencia saludable (18+ meses) en sus últimas 2 posiciones.',
    'Evidencia de liderazgo de proyectos o personas, incluso sin el título formal.',
    'Formación técnica o certificaciones directamente alineadas con los requisitos clave.',
    'Experiencia previa en el mismo sector o modelo de negocio (B2B, SaaS, marketplace, etc.).',
  ],
  en: [
    'Verifiable track record with concrete impact metrics, not just generic responsibilities.',
    'Accelerated growth trajectory within organizations of similar size and stage.',
    'Fluency with the tools and stack this role requires from day one.',
    'Clear, structured written communication — a strong signal for customer-facing roles.',
    'Healthy tenure history (18+ months) across their last 2 positions.',
    'Evidence of leading projects or people, even without the formal title.',
    'Technical background or certifications directly aligned with the key requirements.',
    'Prior experience in the same sector or business model (B2B, SaaS, marketplace, etc.).',
  ],
};

const RED_FLAG_POOL: Record<Language, { issue: string; severity: RedFlag['severity'] }[]> = {
  es: [
    { issue: 'Múltiples cambios de trabajo en periodos menores a 12 meses en los últimos 3 años.', severity: 'Alta' },
    { issue: 'El CV no menciona resultados medibles, solo listas de tareas realizadas.', severity: 'Media' },
    { issue: 'Brecha sin explicar de más de 6 meses entre dos posiciones recientes.', severity: 'Media' },
    { issue: 'Nivel de seniority declarado no coincide con los años de experiencia reportados.', severity: 'Alta' },
    { issue: 'Sin evidencia de experiencia remota o async, y el puesto es 100% remoto.', severity: 'Baja' },
    { issue: 'Rango salarial esperado no fue especificado ni es consistente con el mercado.', severity: 'Baja' },
  ],
  en: [
    { issue: 'Multiple job changes within periods shorter than 12 months over the last 3 years.', severity: 'Alta' },
    { issue: 'The resume lists tasks performed but no measurable outcomes.', severity: 'Media' },
    { issue: 'An unexplained 6+ month gap between two recent positions.', severity: 'Media' },
    { issue: "Declared seniority level doesn't match the reported years of experience.", severity: 'Alta' },
    { issue: 'No evidence of remote/async work experience, and this role is fully remote.', severity: 'Baja' },
    { issue: "Expected salary range wasn't specified or isn't consistent with the market.", severity: 'Baja' },
  ],
};

const QUESTION_POOL: Record<Language, { question: string; whyAsk: string }[]> = {
  es: [
    {
      question: 'Cuéntame sobre un proyecto donde tus decisiones tuvieron un impacto medible en un resultado de negocio. ¿Cómo lo mediste?',
      whyAsk: 'Verifica si los logros del CV son reales y si sabe cuantificar su propio impacto.',
    },
    {
      question: 'Describe una situación donde tuviste que aprender una herramienta o tecnología nueva bajo presión de tiempo.',
      whyAsk: 'Evalúa velocidad de aprendizaje, clave para el ritmo de este puesto.',
    },
    {
      question: '¿Cuál fue el desacuerdo más importante que tuviste con un manager o stakeholder, y cómo lo resolviste?',
      whyAsk: 'Revela madurez profesional y manejo de conflicto sin necesitar preguntas hipotéticas.',
    },
    {
      question: 'Si tuvieras que priorizar 3 iniciativas con recursos limitados en tu primer mes, ¿cómo decidirías cuáles ejecutar primero?',
      whyAsk: 'Pone a prueba el criterio de priorización real, no memorizado.',
    },
    {
      question: 'Explícame un concepto técnico central de tu rol como si yo no tuviera contexto del área.',
      whyAsk: 'Mide dominio real del tema y capacidad de comunicación — dos señales en una sola pregunta.',
    },
    {
      question: '¿Qué es lo que dejarías de hacer inmediatamente si te contratáramos, basado en lo que ya sabes de la vacante?',
      whyAsk: 'Detecta si investigó el puesto y si tiene opinión crítica formada, no solo respuestas genéricas.',
    },
  ],
  en: [
    {
      question: 'Tell me about a project where your decisions had a measurable impact on a business outcome. How did you measure it?',
      whyAsk: 'Verifies whether the resume achievements are real and whether they can quantify their own impact.',
    },
    {
      question: 'Describe a situation where you had to learn a new tool or technology under time pressure.',
      whyAsk: "Evaluates learning speed, which is critical for this role's pace.",
    },
    {
      question: 'What was the most significant disagreement you had with a manager or stakeholder, and how did you resolve it?',
      whyAsk: 'Reveals professional maturity and conflict handling without needing a hypothetical question.',
    },
    {
      question: 'If you had to prioritize 3 initiatives with limited resources in your first month, how would you decide what to run first?',
      whyAsk: 'Tests real prioritization judgment, not a memorized answer.',
    },
    {
      question: 'Explain a core technical concept from your role as if I had no context on the domain.',
      whyAsk: 'Measures real subject mastery and communication ability — two signals in one question.',
    },
    {
      question: "Based on what you already know about this role, what's the first thing you'd stop doing if we hired you?",
      whyAsk: 'Detects whether they researched the role and hold a formed, critical opinion vs. generic answers.',
    },
  ],
};

function scoreVerdict(score: number): TalentPulseData['verdict'] {
  if (score >= 78) return 'Fuerte Match';
  if (score >= 55) return 'Match Parcial';
  return 'No Recomendado';
}

export async function generateTalentPulseMock(
  jobDescription: string,
  candidateProfile: string,
  language: Language
): Promise<TalentPulseData> {
  await delay(900 + Math.random() * 700);

  const jobTitle = cleanLabel(jobDescription.split('\n')[0], language === 'es' ? 'Vacante sin título' : 'Untitled role', 60);
  const candidateName = cleanLabel(candidateProfile.split('\n')[0], language === 'es' ? 'Candidato/a' : 'Candidate', 40);

  const seed = seedFromString(jobDescription + candidateProfile);
  const matchScore = numberInRange(seed, 52, 96);

  const strengths = pickMany(STRENGTHS[language], seed, 4);
  const hasFlags = seed % 4 !== 0; // ~75% of profiles show at least one flag
  const redFlags = hasFlags ? pickMany(RED_FLAG_POOL[language], seed + 13, 1 + (seed % 2)) : [];
  const interviewQuestions: InterviewQuestion[] = pickMany(QUESTION_POOL[language], seed + 29, 5);

  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    jobTitle,
    candidateName,
    matchScore,
    verdict: scoreVerdict(matchScore),
    strengths,
    redFlags,
    interviewQuestions,
    status: 'Nuevo',
  };
}
