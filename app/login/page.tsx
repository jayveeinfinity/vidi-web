'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('Google sign-in error:', error);
        setErrorMessage(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Unexpected login error:', err);
      setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-md md:p-lg pt-24 min-h-[calc(100vh-160px)]">
      <div className="glass-panel p-lg rounded-xl flex flex-col items-center gap-md w-full max-w-[400px] animate-in fade-in duration-700">
        <h1 className="font-headline-md text-on-surface">Welcome to Vidi</h1>
        <p className="text-on-surface-variant font-body-md text-center">
          Sign in to access your watch history, manage your profile, and stream your favorite movies.
        </p>

        {(errorMessage || errorParam) && (
          <div className="w-full p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
            <div>
              <p className="font-medium">Sign in failed</p>
              <p className="text-red-400/80 mt-0.5">
                {errorMessage || (errorParam === 'auth_error' ? 'Authentication failed or callback was rejected.' : errorParam)}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-sm flex items-center justify-center gap-3 w-full py-[10px] px-4 bg-white border border-[#dadce0] rounded-md hover:bg-gray-50 active:bg-gray-100 active:scale-[0.99] focus:ring-2 focus:ring-offset-2 focus:ring-[#4285f4] transition-all cursor-pointer shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          <span className="text-[#3c4043] font-medium text-[14px]">
            {loading ? 'Connecting to Google...' : 'Sign in with Google'}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center p-md md:p-lg pt-24 min-h-[calc(100vh-160px)]">
        <div className="glass-panel p-lg rounded-xl flex flex-col items-center gap-md w-full max-w-[400px]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
