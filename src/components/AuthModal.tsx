import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { signInWithEmail, signUpWithEmail } from '../services/entitlements';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  language: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthenticated, language }) => {
  const t = translations[language].auth;
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmNotice, setConfirmNotice] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || isLoading) return;
    setError(null);
    setConfirmNotice(false);
    setIsLoading(true);

    try {
      if (mode === 'signIn') {
        const { error: signInError } = await signInWithEmail(email.trim(), password);
        if (signInError) {
          setError(t.errorInvalidCredentials);
          return;
        }
        onAuthenticated();
        onClose();
      } else {
        const { error: signUpError } = await signUpWithEmail(email.trim(), password);
        if (signUpError) {
          setError(t.errorGeneric);
          return;
        }
        setConfirmNotice(true);
      }
    } catch {
      setError(t.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-sm w-full p-6 shadow-2xl relative animate-scaleUp">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-md text-slate-400 hover:text-slate-50 border border-slate-800 hover:border-slate-600 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 text-slate-50 font-display font-semibold text-base mb-1">
          {mode === 'signIn' ? <LogIn className="h-4 w-4 text-blue-400" /> : <UserPlus className="h-4 w-4 text-blue-400" />}
          <span>{t.title}</span>
        </div>
        <p className="text-xs text-slate-500 mb-6">{t.desc}</p>

        {!isSupabaseConfigured && (
          <div className="mb-4 text-[11px] text-amber-300 bg-amber-900/20 border border-amber-700/40 rounded-md p-3">
            Supabase is not configured yet (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Sign-in will not work until this project is connected -- see .env.example.
          </div>
        )}

        {confirmNotice ? (
          <p className="text-sm text-emerald-400 bg-emerald-900/10 border border-emerald-700/30 rounded-md p-3">
            {t.signUpSuccess}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                {t.emailLabel}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-md px-4 py-2.5 text-slate-100 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                {t.passwordLabel}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-md px-4 py-2.5 text-slate-100 text-sm focus:outline-none"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-md text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? '...' : mode === 'signIn' ? t.signInCta : t.signUpCta}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signIn' ? 'signUp' : 'signIn');
                setError(null);
              }}
              className="w-full text-center text-xs text-slate-400 hover:text-blue-400 transition cursor-pointer"
            >
              {mode === 'signIn' ? t.switchToSignUp : t.switchToSignIn}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
