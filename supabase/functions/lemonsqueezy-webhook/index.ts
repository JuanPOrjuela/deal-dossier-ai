// Receives LemonSqueezy webhook events and updates the matching customer's
// entitlement row. Every request is verified against the webhook signing
// secret before anything in the payload is trusted.
//
// Required checkout setup (see frontend src/services/checkout.ts): every
// LemonSqueezy checkout link must be created with
//   checkout[custom][user_id] = <the Supabase auth user id>
// so this function can tie the purchase back to the right account via
// `meta.custom_data.user_id`.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { jsonResponse } from '../_shared/cors.ts';

type Plan = 'single' | 'all_access' | 'lifetime';

async function verifySignature(rawBody: string, signatureHeader: string | null, secret: string): Promise<boolean> {
  if (!signatureHeader) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  const digestHex = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  if (digestHex.length !== signatureHeader.length) return false;
  let diff = 0;
  for (let i = 0; i < digestHex.length; i++) {
    diff |= digestHex.charCodeAt(i) ^ signatureHeader.charCodeAt(i);
  }
  return diff === 0;
}

function planForVariant(variantId: string): Plan | null {
  const single = Deno.env.get('LEMONSQUEEZY_VARIANT_SINGLE');
  const allAccess = Deno.env.get('LEMONSQUEEZY_VARIANT_ALL_ACCESS');
  const lifetime = Deno.env.get('LEMONSQUEEZY_VARIANT_LIFETIME');
  if (variantId && variantId === single) return 'single';
  if (variantId && variantId === allAccess) return 'all_access';
  if (variantId && variantId === lifetime) return 'lifetime';
  return null;
}

function statusForSubscription(lsStatus: string): 'active' | 'cancelled' {
  // Simplification: access is revoked as soon as LemonSqueezy reports the
  // subscription as anything other than active/on_trial, rather than
  // honoring `ends_at` for a grace period. Adjust here if you want
  // cancelled-but-still-in-period customers to keep access until renewal.
  return lsStatus === 'active' || lsStatus === 'on_trial' ? 'active' : 'cancelled';
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  const secret = Deno.env.get('LEMONSQUEEZY_WEBHOOK_SECRET');
  if (!secret) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not set');
    return jsonResponse({ error: 'server_misconfigured' }, 500);
  }

  const rawBody = await req.text();
  const signature = req.headers.get('X-Signature');
  const valid = await verifySignature(rawBody, signature, secret);
  if (!valid) {
    return jsonResponse({ error: 'invalid_signature' }, 401);
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }

  const eventName: string = payload?.meta?.event_name ?? '';
  const userId: string | undefined = payload?.meta?.custom_data?.user_id;

  if (!userId) {
    // No way to tie this purchase back to an account -- likely a test
    // event or a checkout created without custom_data. Acknowledge so
    // LemonSqueezy doesn't retry forever, but do nothing.
    console.warn(`lemonsqueezy-webhook: ${eventName} had no custom_data.user_id, skipping`);
    return jsonResponse({ ok: true, skipped: true });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceRoleKey);

  const attributes = payload?.data?.attributes ?? {};

  try {
    if (eventName === 'order_created') {
      const variantId = String(attributes?.first_order_item?.variant_id ?? '');
      const plan = planForVariant(variantId);
      // Only the Lifetime tier is a one-time order; Single/All-Access are
      // subscriptions and are handled by the subscription_* events below,
      // even though LemonSqueezy also fires order_created for their first
      // invoice.
      if (plan === 'lifetime') {
        await admin
          .from('entitlements')
          .update({
            plan: 'lifetime',
            status: 'active',
            lemonsqueezy_customer_id: String(attributes.customer_id ?? ''),
            lemonsqueezy_order_id: String(payload.data.id ?? ''),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      }
    } else if (
      eventName === 'subscription_created' ||
      eventName === 'subscription_updated' ||
      eventName === 'subscription_resumed'
    ) {
      const variantId = String(attributes?.variant_id ?? '');
      const plan = planForVariant(variantId);
      if (plan === 'single' || plan === 'all_access') {
        await admin
          .from('entitlements')
          .update({
            plan,
            status: statusForSubscription(String(attributes.status ?? '')),
            lemonsqueezy_customer_id: String(attributes.customer_id ?? ''),
            lemonsqueezy_subscription_id: String(payload.data.id ?? ''),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      }
    } else if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
      await admin
        .from('entitlements')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('lemonsqueezy_subscription_id', String(payload.data.id ?? ''));
    }
  } catch (err) {
    console.error('lemonsqueezy-webhook: failed to apply event', eventName, err);
    return jsonResponse({ error: 'internal_error' }, 500);
  }

  return jsonResponse({ ok: true });
});
