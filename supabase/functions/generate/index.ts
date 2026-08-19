// Server-side, entitlement-gated generation for all 4 Cloud AIs tools.
//
// This is the ONLY place a mock result is ever produced for a signed-in
// user without their own Gemini key. The browser never holds the credit
// count itself, so reloading the page (or clearing localStorage) cannot
// grant more usage -- the check below always re-reads the entitlement row
// from Postgres before doing any work.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import {
  generateContentForgeMock,
  generateTalentPulseMock,
  generateCommerceLensMock,
  generateDealDossierMock,
} from '../_shared/mockGenerators.ts';
import type { AppId, Language } from '../_shared/types.ts';

const VALID_TOOLS: AppId[] = ['dealDossier', 'contentForge', 'talentPulse', 'commerceLens'];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'missing_auth' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Identify the caller from their own JWT (never trust a client-supplied user id).
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await callerClient.auth.getUser();
    if (userErr || !userData.user) {
      return jsonResponse({ error: 'invalid_session' }, 401);
    }
    const userId = userData.user.id;

    const body = await req.json();
    const tool = body?.tool as AppId;
    const language: Language = body?.language === 'en' ? 'en' : 'es';
    const payload = body?.payload ?? {};

    if (!VALID_TOOLS.includes(tool)) {
      return jsonResponse({ error: 'invalid_tool' }, 400);
    }

    // service_role bypasses RLS -- required to both read and write the
    // entitlement row. This key never leaves the Edge Function runtime.
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: entitlement, error: entErr } = await admin
      .from('entitlements')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (entErr || !entitlement) {
      return jsonResponse({ error: 'no_entitlement' }, 403);
    }

    const isActivePaidAllAccess =
      entitlement.status === 'active' && (entitlement.plan === 'all_access' || entitlement.plan === 'lifetime');

    if (!isActivePaidAllAccess) {
      if (entitlement.plan === 'single') {
        if (entitlement.status !== 'active') {
          return jsonResponse({ error: 'subscription_inactive' }, 403);
        }
        if (entitlement.single_app_id && entitlement.single_app_id !== tool) {
          return jsonResponse({
            error: 'wrong_app',
            message: `Your Single App plan is locked to ${entitlement.single_app_id}. Upgrade to All-Access to use every tool.`,
          }, 403);
        }
        if (!entitlement.single_app_id) {
          // First use under a Single App plan locks the choice permanently.
          await admin
            .from('entitlements')
            .update({ single_app_id: tool, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        }
      } else {
        // Free tier: atomic increment guarded by the WHERE clause so two
        // simultaneous requests can't both slip through on the same credit.
        const { data: updated, error: updateErr } = await admin
          .from('entitlements')
          .update({ free_credits_used: entitlement.free_credits_used + 1, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('plan', 'free')
          .lt('free_credits_used', entitlement.free_credits_limit)
          .select()
          .single();

        if (updateErr || !updated) {
          return jsonResponse({ error: 'out_of_credits' }, 403);
        }
      }
    }

    let result;
    switch (tool) {
      case 'contentForge':
        result = generateContentForgeMock(payload.topic ?? '', payload.channel ?? 'linkedin', language);
        break;
      case 'talentPulse':
        result = generateTalentPulseMock(payload.jobDescription ?? '', payload.candidateProfile ?? '', language);
        break;
      case 'commerceLens':
        result = generateCommerceLensMock(payload.competitor ?? '', payload.yourProduct ?? '', language);
        break;
      case 'dealDossier':
        result = generateDealDossierMock(payload.url ?? '', payload.persona ?? '', payload.offer ?? '', language);
        break;
    }

    return jsonResponse({ data: result });
  } catch (err) {
    console.error('generate function error:', err);
    return jsonResponse({ error: 'internal_error' }, 500);
  }
});
