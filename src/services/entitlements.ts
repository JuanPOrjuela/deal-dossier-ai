import { supabase } from './supabaseClient';
import type { AppId } from '../types';
import type { Language } from '../i18n/translations';

export type PlanId = 'free' | 'single' | 'all_access' | 'lifetime';
export type PlanStatus = 'active' | 'cancelled' | 'expired';

export interface Entitlement {
  plan: PlanId;
  singleAppId: AppId | null;
  status: PlanStatus;
  freeCreditsUsed: number;
  freeCreditsLimit: number;
}

export async function fetchEntitlement(): Promise<Entitlement | null> {
  const { data, error } = await supabase
    .from('entitlements')
    .select('plan, single_app_id, status, free_credits_used, free_credits_limit')
    .single();

  if (error || !data) return null;

  return {
    plan: data.plan,
    singleAppId: data.single_app_id,
    status: data.status,
    freeCreditsUsed: data.free_credits_used,
    freeCreditsLimit: data.free_credits_limit,
  };
}

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export type GenerateResult<T> = { ok: true; data: T } | { ok: false; error: string; message?: string };

/**
 * Calls the `generate` Edge Function, which re-checks the caller's
 * entitlement in Postgres before producing anything. This is the ONLY path
 * that should be used for the 4 tools' demo/mock generation -- the browser
 * never decides locally whether a generation is allowed.
 */
export async function callGenerate<T>(tool: AppId, language: Language, payload: Record<string, unknown>): Promise<GenerateResult<T>> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    return { ok: false, error: 'missing_auth' };
  }

  const { data, error } = await supabase.functions.invoke('generate', {
    body: { tool, language, payload },
  });

  if (error) {
    const context = (error as { context?: { json?: () => Promise<{ error?: string; message?: string }> } }).context;
    if (context?.json) {
      try {
        const body = await context.json();
        return { ok: false, error: body.error ?? 'unknown_error', message: body.message };
      } catch {
        // fall through to generic network error below
      }
    }
    return { ok: false, error: 'network_error' };
  }

  if (data?.error) {
    return { ok: false, error: data.error, message: data.message };
  }

  return { ok: true, data: data.data as T };
}
