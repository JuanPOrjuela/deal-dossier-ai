// Builds LemonSqueezy hosted-checkout URLs. custom[user_id] is what lets
// supabase/functions/lemonsqueezy-webhook tie the resulting purchase back
// to the right Supabase account -- see that function's header comment.

export type CheckoutPlan = 'single' | 'allAccess' | 'lifetime';

const STORE_URL = import.meta.env.VITE_LEMONSQUEEZY_STORE_URL as string | undefined;

const VARIANT_BY_PLAN: Record<CheckoutPlan, string | undefined> = {
  single: import.meta.env.VITE_LEMONSQUEEZY_VARIANT_SINGLE as string | undefined,
  allAccess: import.meta.env.VITE_LEMONSQUEEZY_VARIANT_ALL_ACCESS as string | undefined,
  lifetime: import.meta.env.VITE_LEMONSQUEEZY_VARIANT_LIFETIME as string | undefined,
};

export const isCheckoutConfigured = Boolean(
  STORE_URL && VARIANT_BY_PLAN.single && VARIANT_BY_PLAN.allAccess && VARIANT_BY_PLAN.lifetime
);

export function getCheckoutUrl(plan: CheckoutPlan, userId: string, email?: string): string | null {
  const variantId = VARIANT_BY_PLAN[plan];
  if (!STORE_URL || !variantId) return null;

  const url = new URL(`${STORE_URL.replace(/\/$/, '')}/checkout/buy/${variantId}`);
  url.searchParams.set('checkout[custom][user_id]', userId);
  if (email) url.searchParams.set('checkout[email]', email);
  url.searchParams.set('embed', '0');

  return url.toString();
}
