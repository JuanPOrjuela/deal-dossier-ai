import type {
  ContentForgeData,
  ContentChannel,
  CarouselSlide,
  TalentPulseData,
  RedFlag,
  InterviewQuestion,
  CommerceLensData,
  CompetitorComplaint,
  AttackAngle,
  DossierData,
  Language,
} from './types.ts';
import { seedFromString, cleanLabel, pickMany, numberInRange, generateId } from './mockUtils.ts';

// ---------------------------------------------------------------------------
// ContentForge AI
// ---------------------------------------------------------------------------

const HOOK_TEMPLATES: Record<Language, ((topic: string) => string)[]> = {
  es: [
    (t) => `Nadie te lo va a decir, pero "${t}" está a punto de cambiar por completo en los próximos 12 meses.`,
    (t) => `Probé 3 enfoques distintos de "${t}" durante un mes. Solo uno funcionó, y no es el que esperas.`,
    (t) => `El 90% de los equipos hace mal "${t}". Esto es lo que hace el otro 10%.`,
    (t) => `Dejé de hacer "${t}" de la forma tradicional y mis resultados se duplicaron en 3 semanas.`,
    (t) => `Esta es la conversación incómoda que nadie tiene sobre "${t}" — y deberían.`,
    (t) => `Si crees que ya dominas "${t}", este dato te va a incomodar.`,
  ],
  en: [
    (t) => `Nobody's going to tell you this, but "${t}" is about to completely change in the next 12 months.`,
    (t) => `I tried 3 different approaches to "${t}" for a month. Only one worked, and it's not the one you'd expect.`,
    (t) => `90% of teams get "${t}" wrong. Here's what the other 10% do differently.`,
    (t) => `I stopped doing "${t}" the traditional way and my results doubled in 3 weeks.`,
    (t) => `This is the uncomfortable conversation nobody's having about "${t}" — and they should.`,
    (t) => `If you think you've already mastered "${t}", this stat is going to bother you.`,
  ],
};

const POST_BODY: Record<Language, (topic: string, hook: string) => string> = {
  es: (t, hook) => `${hook}\n\nHace unos meses habría dicho que "${t}" era cuestión de fuerza bruta: más tiempo, más presupuesto, más gente.\n\nMe equivocaba.\n\nLo que realmente mueve la aguja son 3 cosas:\n\n1️⃣ Claridad antes que velocidad — define el resultado exacto antes de ejecutar.\n2️⃣ Sistemas repetibles — lo que no se documenta, no se escala.\n3️⃣ Feedback en ciclos cortos — corrige cada semana, no cada trimestre.\n\nEl equipo que aplica esto no trabaja más. Trabaja con más criterio.\n\n¿Cuál de los 3 te está fallando ahora mismo?`,
  en: (t, hook) => `${hook}\n\nA few months ago I would've said "${t}" was about brute force: more time, more budget, more people.\n\nI was wrong.\n\nWhat actually moves the needle is 3 things:\n\n1️⃣ Clarity before speed — define the exact outcome before you execute.\n2️⃣ Repeatable systems — what isn't documented doesn't scale.\n3️⃣ Short feedback loops — correct weekly, not quarterly.\n\nThe team that applies this doesn't work harder. It works with more judgment.\n\nWhich of the 3 is failing you right now?`,
};

const CAROUSEL_TEMPLATES: Record<Language, (topic: string) => CarouselSlide[]> = {
  es: (t) => [
    { slideNumber: 1, title: `La verdad incómoda sobre ${t}`, body: 'Todos hablan de esto. Casi nadie lo hace bien.' },
    { slideNumber: 2, title: 'El error #1', body: `Tratar "${t}" como una tarea puntual en vez de un sistema continuo.` },
    { slideNumber: 3, title: 'Lo que sí funciona', body: 'Procesos simples, repetibles, medidos cada semana — no complejidad, disciplina.' },
    { slideNumber: 4, title: 'Un dato que sorprende', body: 'Los equipos que documentan su proceso mejoran 2-3x más rápido que los que improvisan.' },
    { slideNumber: 5, title: 'Tu próximo paso', body: 'Elige 1 solo cambio de esta lista. Aplícalo esta semana. Mide el resultado.' },
  ],
  en: (t) => [
    { slideNumber: 1, title: `The uncomfortable truth about ${t}`, body: 'Everyone talks about it. Almost nobody does it right.' },
    { slideNumber: 2, title: 'Mistake #1', body: `Treating "${t}" as a one-off task instead of an ongoing system.` },
    { slideNumber: 3, title: 'What actually works', body: 'Simple, repeatable processes, measured weekly — not complexity, discipline.' },
    { slideNumber: 4, title: 'A surprising stat', body: 'Teams that document their process improve 2-3x faster than those who improvise.' },
    { slideNumber: 5, title: 'Your next step', body: 'Pick just 1 change from this list. Apply it this week. Measure the result.' },
  ],
};

const CHANNEL_TITLE_PREFIX: Record<ContentChannel, Record<Language, string>> = {
  linkedin: { es: 'Post de LinkedIn:', en: 'LinkedIn Post:' },
  twitter: { es: 'Hilo de X:', en: 'X Thread:' },
  newsletter: { es: 'Edición de Newsletter:', en: 'Newsletter Issue:' },
  tiktok: { es: 'Guión de TikTok:', en: 'TikTok Script:' },
};

export function generateContentForgeMock(rawTopic: string, channel: ContentChannel, language: Language): ContentForgeData {
  const topic = cleanLabel(rawTopic, language === 'es' ? 'este tema' : 'this topic', 60);
  const seed = seedFromString(rawTopic + channel);

  const hooks = pickMany(HOOK_TEMPLATES[language], seed, 3).map((fn) => fn(topic));
  const postTitle = `${CHANNEL_TITLE_PREFIX[channel][language]} ${topic}`;
  const postBody = POST_BODY[language](topic, hooks[0]);
  const carousel = CAROUSEL_TEMPLATES[language](topic);

  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    topic,
    channel,
    hooks,
    post: { title: postTitle, body: postBody },
    carousel,
    status: 'Borrador',
  };
}

// ---------------------------------------------------------------------------
// TalentPulse AI
// ---------------------------------------------------------------------------

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
    { question: 'Cuéntame sobre un proyecto donde tus decisiones tuvieron un impacto medible en un resultado de negocio. ¿Cómo lo mediste?', whyAsk: 'Verifica si los logros del CV son reales y si sabe cuantificar su propio impacto.' },
    { question: 'Describe una situación donde tuviste que aprender una herramienta o tecnología nueva bajo presión de tiempo.', whyAsk: 'Evalúa velocidad de aprendizaje, clave para el ritmo de este puesto.' },
    { question: '¿Cuál fue el desacuerdo más importante que tuviste con un manager o stakeholder, y cómo lo resolviste?', whyAsk: 'Revela madurez profesional y manejo de conflicto sin necesitar preguntas hipotéticas.' },
    { question: 'Si tuvieras que priorizar 3 iniciativas con recursos limitados en tu primer mes, ¿cómo decidirías cuáles ejecutar primero?', whyAsk: 'Pone a prueba el criterio de priorización real, no memorizado.' },
    { question: 'Explícame un concepto técnico central de tu rol como si yo no tuviera contexto del área.', whyAsk: 'Mide dominio real del tema y capacidad de comunicación — dos señales en una sola pregunta.' },
    { question: '¿Qué es lo que dejarías de hacer inmediatamente si te contratáramos, basado en lo que ya sabes de la vacante?', whyAsk: 'Detecta si investigó el puesto y si tiene opinión crítica formada, no solo respuestas genéricas.' },
  ],
  en: [
    { question: 'Tell me about a project where your decisions had a measurable impact on a business outcome. How did you measure it?', whyAsk: 'Verifies whether the resume achievements are real and whether they can quantify their own impact.' },
    { question: 'Describe a situation where you had to learn a new tool or technology under time pressure.', whyAsk: "Evaluates learning speed, which is critical for this role's pace." },
    { question: 'What was the most significant disagreement you had with a manager or stakeholder, and how did you resolve it?', whyAsk: 'Reveals professional maturity and conflict handling without needing a hypothetical question.' },
    { question: 'If you had to prioritize 3 initiatives with limited resources in your first month, how would you decide what to run first?', whyAsk: 'Tests real prioritization judgment, not a memorized answer.' },
    { question: 'Explain a core technical concept from your role as if I had no context on the domain.', whyAsk: 'Measures real subject mastery and communication ability — two signals in one question.' },
    { question: "Based on what you already know about this role, what's the first thing you'd stop doing if we hired you?", whyAsk: 'Detects whether they researched the role and hold a formed, critical opinion vs. generic answers.' },
  ],
};

function scoreVerdict(score: number): TalentPulseData['verdict'] {
  if (score >= 78) return 'Fuerte Match';
  if (score >= 55) return 'Match Parcial';
  return 'No Recomendado';
}

export function generateTalentPulseMock(jobDescription: string, candidateProfile: string, language: Language): TalentPulseData {
  const jobTitle = cleanLabel(jobDescription.split('\n')[0], language === 'es' ? 'Vacante sin título' : 'Untitled role', 60);
  const candidateName = cleanLabel(candidateProfile.split('\n')[0], language === 'es' ? 'Candidato/a' : 'Candidate', 40);

  const seed = seedFromString(jobDescription + candidateProfile);
  const matchScore = numberInRange(seed, 52, 96);

  const strengths = pickMany(STRENGTHS[language], seed, 4);
  const hasFlags = seed % 4 !== 0;
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

// ---------------------------------------------------------------------------
// CommerceLens AI
// ---------------------------------------------------------------------------

const COMPLAINT_POOL: Record<Language, { issue: string; quote: string; frequency: CompetitorComplaint['frequency'] }[]> = {
  es: [
    { issue: 'Calidad de materiales inferior a lo mostrado en las fotos del anuncio.', quote: 'Se ve mucho más barato en persona de lo que parecía en las imágenes.', frequency: 'Alta' },
    { issue: 'Tiempos de envío más largos de lo prometido en la ficha de producto.', quote: 'Pedí en 3 días y llegó casi 3 semanas después, sin ninguna notificación.', frequency: 'Alta' },
    { issue: 'Servicio al cliente lento o inexistente ante reclamos.', quote: 'Escribí 4 veces y nunca me respondieron sobre mi producto defectuoso.', frequency: 'Media' },
    { issue: 'Instrucciones de uso o armado confusas e incompletas.', quote: 'El manual no tenía sentido, tuve que buscar un video en YouTube para armarlo.', frequency: 'Media' },
    { issue: 'Diferencias notables entre el tamaño/color anunciado y el producto recibido.', quote: 'El color no se parece en nada al de la foto principal.', frequency: 'Media' },
    { issue: 'Durabilidad muy por debajo de lo esperado — falla en pocas semanas de uso.', quote: 'Dejó de funcionar bien a las 3 semanas de uso normal.', frequency: 'Alta' },
    { issue: 'Política de devoluciones poco clara o costosa para el comprador.', quote: 'Quise devolverlo y tuve que pagar yo el envío de vuelta, nadie lo avisa antes.', frequency: 'Baja' },
  ],
  en: [
    { issue: 'Material quality noticeably lower than shown in the listing photos.', quote: 'It looks way cheaper in person than it did in the pictures.', frequency: 'Alta' },
    { issue: 'Shipping times far longer than promised on the product page.', quote: 'I ordered expecting 3 days and it arrived almost 3 weeks later with zero updates.', frequency: 'Alta' },
    { issue: 'Slow or unresponsive customer service when issues come up.', quote: 'I messaged 4 times and never got a reply about my defective unit.', frequency: 'Media' },
    { issue: 'Confusing or incomplete setup/usage instructions.', quote: 'The manual made no sense, I had to find a YouTube video just to assemble it.', frequency: 'Media' },
    { issue: 'Noticeable mismatch between the advertised size/color and what arrives.', quote: 'The color looks nothing like the main product photo.', frequency: 'Media' },
    { issue: 'Durability well below expectations — fails within a few weeks of use.', quote: 'It stopped working properly after just 3 weeks of normal use.', frequency: 'Alta' },
    { issue: 'Unclear or costly return policy for the buyer.', quote: "I wanted to return it and had to pay for shipping back myself — nobody warns you.", frequency: 'Baja' },
  ],
};

const ANGLE_TEMPLATES: Record<Language, ((competitor: string, yours: string, complaintIssue: string) => AttackAngle)[]> = {
  es: [
    (competitor, yours, issue) => ({ angle: 'Ángulo de Confianza / Prueba Social', adCopy: `¿Cansado de que "${competitor}" no cumpla lo que promete? ${yours} resuelve exactamente eso: ${issue.toLowerCase()} Mira por qué cientos de compradores están cambiando.` }),
    (competitor, yours, issue) => ({ angle: 'Ángulo de Comparación Directa', adCopy: `${competitor} vs ${yours}: la diferencia está en los detalles. Mientras ellos fallan en "${issue.toLowerCase()}", nosotros lo diseñamos como prioridad #1.` }),
    (competitor, yours) => ({ angle: 'Ángulo de Garantía / Riesgo Cero', adCopy: `Si ya te decepcionó un producto como "${competitor}", entendemos por qué dudas. Por eso ${yours} incluye garantía real — no promesas de marketing.` }),
  ],
  en: [
    (competitor, yours, issue) => ({ angle: 'Trust / Social Proof Angle', adCopy: `Tired of "${competitor}" not living up to the hype? ${yours} solves exactly that: ${issue.toLowerCase()} See why hundreds of buyers are switching.` }),
    (competitor, yours, issue) => ({ angle: 'Direct Comparison Angle', adCopy: `${competitor} vs ${yours}: the difference is in the details. While they fail on "${issue.toLowerCase()}", we designed for that as priority #1.` }),
    (competitor, yours) => ({ angle: 'Guarantee / Zero-Risk Angle', adCopy: `If a product like "${competitor}" already let you down, we get the hesitation. That's why ${yours} ships with a real guarantee — not marketing promises.` }),
  ],
};

const DESCRIPTION_TEMPLATE: Record<Language, (yours: string, competitor: string, issues: string[]) => string> = {
  es: (yours, competitor, issues) => `${yours} fue diseñado para quienes ya se cansaron de las promesas incumplidas de opciones como "${competitor}".\n\nEsto es lo que corregimos, punto por punto:\n\n${issues.map((i) => `✔️ ${i}`).join('\n')}\n\nCada detalle fue pensado para que no tengas que elegir entre precio y calidad. Pruébalo con la confianza de una garantía real.`,
  en: (yours, competitor, issues) => `${yours} was built for people who are done with the broken promises of options like "${competitor}".\n\nHere's exactly what we fixed, point by point:\n\n${issues.map((i) => `✔️ ${i}`).join('\n')}\n\nEvery detail was designed so you never have to choose between price and quality. Try it backed by a real guarantee.`,
};

export function generateCommerceLensMock(rawCompetitor: string, rawYourProduct: string, language: Language): CommerceLensData {
  const competitorProduct = cleanLabel(rawCompetitor, language === 'es' ? 'el producto competidor' : 'the competitor product', 60);
  const yourProduct = cleanLabel(rawYourProduct, language === 'es' ? 'tu producto' : 'your product', 60);

  const seed = seedFromString(rawCompetitor + rawYourProduct);

  const complaints = pickMany(COMPLAINT_POOL[language], seed, 4);
  const attackAngles = pickMany(ANGLE_TEMPLATES[language], seed + 5, 3).map((fn) => fn(competitorProduct, yourProduct, complaints[0].issue));
  const productDescription = DESCRIPTION_TEMPLATE[language](yourProduct, competitorProduct, complaints.slice(0, 3).map((c) => c.issue));

  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    competitorProduct,
    yourProduct,
    complaints,
    attackAngles,
    productDescription,
    status: 'Nuevo',
  };
}

// ---------------------------------------------------------------------------
// DealDossier AI (server-side mock fallback -- the "bring your own Gemini
// key" path stays entirely client-side and is never routed through this
// gated endpoint, see src/services/gemini.ts)
// ---------------------------------------------------------------------------

const DOSSIER_HOOK: Record<Language, (company: string) => string> = {
  es: (c) => `Detectamos fricciones de conversión en el embudo de prospección de ${c} debido a personalización superficial.`,
  en: (c) => `We detected conversion friction in ${c}'s outbound funnel caused by surface-level personalization.`,
};

export function generateDealDossierMock(websiteUrl: string, targetPersona: string, sellerOffer: string, language: Language): DossierData {
  const cleanUrl = cleanLabel(websiteUrl, 'empresa.com', 60);
  const companyGuess = cleanUrl.split('.')[0] || 'Empresa';
  const companyName = companyGuess.charAt(0).toUpperCase() + companyGuess.slice(1);
  const seed = seedFromString(websiteUrl + targetPersona + sellerOffer);
  const persona = targetPersona.trim() || (language === 'es' ? 'Director Comercial / VP de Ventas' : 'VP of Sales');
  const offer = sellerOffer.trim() || (language === 'es' ? 'Automatización con IA' : 'AI automation');

  const hook = DOSSIER_HOOK[language](companyName);

  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    companyName,
    websiteUrl: cleanUrl,
    industry: language === 'es' ? 'Tecnología & Servicios B2B' : 'B2B SaaS & Tech Services',
    targetPersona: persona,
    sellerOffer: offer,
    summary: language === 'es'
      ? `${companyName} opera como un jugador consolidado en su segmento. Muestra tracción comercial pero sufre fricciones de conversión en prospección en frío.`
      : `${companyName} is an established player in its market. It shows strong momentum but experiences friction in cold outbound prospecting.`,
    dealScore: {
      overall: numberInRange(seed, 62, 96),
      budgetTier: numberInRange(seed, 0, 2) === 0 ? 'Tier 1 ($50k+)' : numberInRange(seed, 0, 1) === 0 ? 'Tier 2 ($15k-$50k)' : 'Tier 3 (<$15k)',
      urgencyScore: numberInRange(seed + 3, 5, 10),
      buyingWindow: language === 'es' ? 'Próximos 30-45 días (cierre de ciclo)' : 'Next 30-45 days (fiscal close)',
      priorityLabel: language === 'es' ? 'Alta Prioridad' : 'High Priority',
    },
    companyDna: {
      businessModel: language === 'es' ? 'B2B SaaS / Suscripción Anual & Servicios' : 'B2B SaaS / Annual Subscription & Services',
      targetAudience: language === 'es' ? 'Líderes de operaciones y ventas en empresas medianas' : 'Operations and sales leaders at mid-market companies',
      estimatedSize: '50-200 employees',
    },
    painPoints: [
      {
        issue: language === 'es' ? 'Alto costo de adquisición por investigación manual de cuentas' : 'High CAC due to manual account research',
        impact: language === 'es' ? 'Los reps dedican 40% de su tiempo a investigar en vez de vender.' : 'Reps spend 40% of their time researching instead of selling.',
        urgency: 'Crítica',
      },
      {
        issue: language === 'es' ? 'Baja tasa de respuesta en outreach genérico' : 'Low response rates from generic outreach',
        impact: language === 'es' ? 'Tasas de apertura y respuesta cayendo por debajo del benchmark.' : 'Open and reply rates falling below benchmark.',
        urgency: 'Alta',
      },
    ],
    toneAngles: {
      consultivo: {
        title: language === 'es' ? 'Consultivo & Diagnóstico' : 'Consultative & Diagnostic',
        hook,
        coldEmailSubject: `${companyName}: ${language === 'es' ? 'diagnóstico rápido para' : 'quick diagnostic for'} ${persona}`,
        coldEmailBody: language === 'es'
          ? `Hola [Nombre],\n\nAl analizar ${companyName}, notamos una oportunidad relacionada con ${offer}.\n\n¿Tendrías 10 minutos esta semana?`
          : `Hi [First Name],\n\nWhile analyzing ${companyName}, we noticed an opportunity related to ${offer}.\n\nOpen to 10 minutes this week?`,
        linkedInMessage: language === 'es'
          ? `Hola [Nombre], te comparto un análisis breve de ${companyName}. ¿Lo revisamos?`
          : `Hi [First Name], put together a quick analysis of ${companyName}. Mind if I share it?`,
        whyItWorks: language === 'es' ? 'Posiciona como consultor estratégico, no como vendedor agresivo.' : 'Positions you as a strategic consultant rather than a pushy salesperson.',
      },
    },
    objections: [
      {
        objection: language === 'es' ? 'Ya tenemos un equipo interno para esto.' : 'We already have an internal team for this.',
        context: language === 'es' ? 'Miedo a herramientas redundantes.' : 'Fear of redundant tools.',
        rebuttal: language === 'es'
          ? 'Tiene sentido. La idea no es reemplazar tu equipo, sino devolverle 15h/semana enfocándose en cerrar en vez de investigar.'
          : "Makes sense. The goal isn't to replace your team, but to give them back 15h/week to focus on closing instead of researching.",
      },
    ],
    status: 'Nuevo',
  };
}
