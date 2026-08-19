import type { CommerceLensData, CompetitorComplaint, AttackAngle } from '../../types';
import type { Language } from '../../i18n/translations';
import { seedFromString, cleanLabel, pickMany, delay, generateId } from '../mockUtils';

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
    { issue: 'Unclear or costly return policy for the buyer.', quote: 'I wanted to return it and had to pay for shipping back myself — nobody warns you.', frequency: 'Baja' },
  ],
};

const ANGLE_TEMPLATES: Record<Language, ((competitor: string, yours: string, complaintIssue: string) => AttackAngle)[]> = {
  es: [
    (competitor, yours, issue) => ({
      angle: 'Ángulo de Confianza / Prueba Social',
      adCopy: `¿Cansado de que "${competitor}" no cumpla lo que promete? ${yours} resuelve exactamente eso: ${issue.toLowerCase()} Mira por qué cientos de compradores están cambiando.`,
    }),
    (competitor, yours, issue) => ({
      angle: 'Ángulo de Comparación Directa',
      adCopy: `${competitor} vs ${yours}: la diferencia está en los detalles. Mientras ellos fallan en "${issue.toLowerCase()}", nosotros lo diseñamos como prioridad #1.`,
    }),
    (competitor, yours) => ({
      angle: 'Ángulo de Garantía / Riesgo Cero',
      adCopy: `Si ya te decepcionó un producto como "${competitor}", entendemos por qué dudas. Por eso ${yours} incluye garantía real — no promesas de marketing.`,
    }),
  ],
  en: [
    (competitor, yours, issue) => ({
      angle: 'Trust / Social Proof Angle',
      adCopy: `Tired of "${competitor}" not living up to the hype? ${yours} solves exactly that: ${issue.toLowerCase()} See why hundreds of buyers are switching.`,
    }),
    (competitor, yours, issue) => ({
      angle: 'Direct Comparison Angle',
      adCopy: `${competitor} vs ${yours}: the difference is in the details. While they fail on "${issue.toLowerCase()}", we designed for that as priority #1.`,
    }),
    (competitor, yours) => ({
      angle: 'Guarantee / Zero-Risk Angle',
      adCopy: `If a product like "${competitor}" already let you down, we get the hesitation. That's why ${yours} ships with a real guarantee — not marketing promises.`,
    }),
  ],
};

const DESCRIPTION_TEMPLATE: Record<Language, (yours: string, competitor: string, issues: string[]) => string> = {
  es: (yours, competitor, issues) => `${yours} fue diseñado para quienes ya se cansaron de las promesas incumplidas de opciones como "${competitor}".\n\nEsto es lo que corregimos, punto por punto:\n\n${issues.map((i) => `✔️ ${i}`).join('\n')}\n\nCada detalle fue pensado para que no tengas que elegir entre precio y calidad. Pruébalo con la confianza de una garantía real.`,
  en: (yours, competitor, issues) => `${yours} was built for people who are done with the broken promises of options like "${competitor}".\n\nHere's exactly what we fixed, point by point:\n\n${issues.map((i) => `✔️ ${i}`).join('\n')}\n\nEvery detail was designed so you never have to choose between price and quality. Try it backed by a real guarantee.`,
};

export async function generateCommerceLensMock(
  rawCompetitor: string,
  rawYourProduct: string,
  language: Language
): Promise<CommerceLensData> {
  await delay(900 + Math.random() * 700);

  const competitorProduct = cleanLabel(rawCompetitor, language === 'es' ? 'el producto competidor' : 'the competitor product', 60);
  const yourProduct = cleanLabel(rawYourProduct, language === 'es' ? 'tu producto' : 'your product', 60);

  const seed = seedFromString(rawCompetitor + rawYourProduct);

  const complaints = pickMany(COMPLAINT_POOL[language], seed, 4);
  const angleFns = pickMany(ANGLE_TEMPLATES[language], seed + 5, 3);
  const attackAngles = angleFns.map((fn) => fn(competitorProduct, yourProduct, complaints[0].issue));

  const productDescription = DESCRIPTION_TEMPLATE[language](
    yourProduct,
    competitorProduct,
    complaints.slice(0, 3).map((c) => c.issue)
  );

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
