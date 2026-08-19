import type { ContentForgeData, ContentChannel, CarouselSlide } from '../../types';
import type { Language } from '../../i18n/translations';
import { seedFromString, cleanLabel, pickMany, delay, generateId } from '../mockUtils';

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

export async function generateContentForgeMock(
  rawTopic: string,
  channel: ContentChannel,
  language: Language
): Promise<ContentForgeData> {
  await delay(900 + Math.random() * 600);

  const topic = cleanLabel(rawTopic, language === 'es' ? 'este tema' : 'this topic', 60);
  const seed = seedFromString(rawTopic + channel);

  const hookFns = pickMany(HOOK_TEMPLATES[language], seed, 3);
  const hooks = hookFns.map((fn) => fn(topic));

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
