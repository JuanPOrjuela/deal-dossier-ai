export type CheckoutPlan = 'single' | 'allAccess' | 'lifetime';

export const GUMROAD_LINKS: Record<CheckoutPlan, string> = {
  single: 'https://orjuelar.gumroad.com/l/single-app',
  allAccess: 'https://orjuelar.gumroad.com/l/all-access-suite',
  lifetime: 'https://orjuelar.gumroad.com/l/lifetime-pass',
};

export const isCheckoutConfigured = true;

export function getCheckoutUrl(plan: CheckoutPlan, userId?: string, email?: string): string {
  const baseUrl = GUMROAD_LINKS[plan] || GUMROAD_LINKS.allAccess;
  const url = new URL(baseUrl);
  
  if (email) {
    url.searchParams.set('email', email);
  }
  if (userId) {
    url.searchParams.set('user_id', userId);
  }

  return url.toString();
}
