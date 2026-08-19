import { supabase } from './supabaseClient';
import type { AppId } from '../types';
import type { Language } from '../i18n/translations';

export type FeedbackCategory = 'question' | 'suggestion' | 'bug' | 'other';

export interface FeedbackInput {
  email: string;
  category: FeedbackCategory;
  message: string;
  appContext: AppId;
  language: Language;
}

export async function submitFeedback(input: FeedbackInput): Promise<{ ok: true } | { ok: false }> {
  const { data: sessionData } = await supabase.auth.getSession();

  const { error } = await supabase.from('feedback_messages').insert({
    user_id: sessionData.session?.user.id ?? null,
    email: input.email.trim(),
    category: input.category,
    message: input.message.trim(),
    app_context: input.appContext,
    language: input.language,
  });

  if (error) {
    console.error('Error submitting feedback:', error);
    return { ok: false };
  }
  return { ok: true };
}
