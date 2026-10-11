'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from '@/lib/auth-client';

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/account';

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Validation & Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Email format validator
  const validateEmailFormat = (val: string) => {
    if (!val.trim()) return 'Email address is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      return 'Please enter a valid email address (e.g. client@domain.com).';
    }
    return '';
  };

  // Password validator
  const validatePasswordFormat = (val: string) => {
    if (!val) return 'Password is required.';
    if (val.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  // Quick-fill credentials helper for easy testing
  const handleQuickFill = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setEmailError('');
    setPasswordError('');
    setServerError('');
  };

  const handleBlurEmail = () => {
    if (email) {
      setEmailError(validateEmailFormat(email));
    }
  };

  const handleBlurPassword = () => {
    if (password) {
      setPasswordError(validatePasswordFormat(password));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const errEmail = validateEmailFormat(email);
    const errPass = validatePasswordFormat(password);

    if (errEmail || errPass) {
      setEmailError(errEmail);
      setPasswordError(errPass);
      return;
    }

    setIsLoading(true);

    try {
      const response = await signIn.email({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (response.error) {
        const msg = response.error.message || 'Invalid credentials. Please verify your email and password.';
        setServerError(msg);
        setIsLoading(false);
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 600);
      }
    } catch {
      setServerError('A connection error occurred while contacting the Atelier authentication service. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white border border-[#e8e3db] p-8 sm:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all">
      {/* Header */}
      <div className="text-center space-y-2 mb-8 pb-6 border-b border-[#e8e3db]/80">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a]" />
          <span className="text-[9px] tracking-[0.35em] uppercase font-semibold text-[#8e857b]">
            CLIENT PRIVILÈGE
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#1a1714]">
          Sign In
        </h1>
        <p className="text-xs text-[#787065] font-light leading-relaxed max-w-xs mx-auto">
          Access your private client portfolio, orders, and saved masterworks.
        </p>
      </div>

      {/* Quick Fill Test Accounts Pill */}
      <div className="mb-6 p-3 bg-[#faf9f7] border border-[#e8e3db] rounded-none">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8e857b]">
            Quick Test Accounts
          </span>
          <span className="text-[9px] text-[#a0978d] font-mono">1-click fill</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('customer.test@maison-atelier.com', 'Password123!')}
            className="text-[10px] uppercase tracking-wider px-2.5 py-1 bg-white border border-[#d6cfc5] text-[#3a3530] hover:border-[#1a1714] hover:bg-[#1a1714] hover:text-white transition-colors cursor-pointer"
          >
            Client: Éléonore
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('admin.director@maison-atelier.com', 'AdminPassword2026!')}
            className="text-[10px] uppercase tracking-wider px-2.5 py-1 bg-white border border-[#d4af6a] text-[#8c6d32] hover:bg-[#11100e] hover:text-[#d4af6a] hover:border-[#11100e] transition-colors cursor-pointer"
          >
            Admin: Directrice
          </button>
        </div>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="mb-6 p-4 bg-[#fdf2f2] border-l-2 border-[#a11826] text-[#a11826] flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 6.75h.008v.008H12v-.008Z" />
            </svg>
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-wider font-semibold">Authentication Notice</p>
              <p className="text-xs font-light leading-relaxed">{serverError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setServerError('')}
            className="text-[#a11826] hover:opacity-70 p-1"
            aria-label="Dismiss error"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Success Notification */}
      {isSuccess && (
        <div className="mb-6 p-4 bg-[#f0f9f4] border-l-2 border-[#2d5a3c] text-[#2d5a3c] flex items-center gap-3 animate-fadeIn">
          <svg className="w-5 h-5 shrink-0 text-[#2d5a3c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider font-semibold">Access Authorized</p>
            <p className="text-xs font-light">Directing to your Private Portfolio…</p>
          </div>
        </div>
      )}

      {/* Main Sign-In Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Email Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="signin-email"
              className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#3a3530] block"
            >
              Email Address
            </label>
            {email && !emailError && (
              <span className="text-[9px] uppercase tracking-wider text-[#2d5a3c] font-medium flex items-center gap-1">
                ✓ Valid
              </span>
            )}
          </div>
          <div className="relative">
            <input
              id="signin-email"
              type="email"
              required
              disabled={isLoading || isSuccess}
              autoComplete="email"
              value={email}
              onBlur={handleBlurEmail}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
                if (serverError) setServerError('');
              }}
              placeholder="client@maison-atelier.com"
              className={`w-full bg-[#faf9f7] border px-4 py-3 text-sm text-[#1a1714] placeholder-[#a0978d] transition-all focus:outline-none focus:bg-white ${
                emailError
                  ? 'border-[#a11826] bg-[#fffbfb] focus:border-[#a11826]'
                  : 'border-[#d6cfc5] focus:border-[#1a1714]'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            />
          </div>
          {emailError && (
            <p className="text-[11px] text-[#a11826] font-light flex items-center gap-1.5 pt-0.5">
              <span>●</span> {emailError}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="signin-password"
              className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#3a3530] block"
            >
              Password
            </label>
            <span className="text-[9px] text-[#8e857b] font-light">
              Protected by Better Auth
            </span>
          </div>
          <div className="relative">
            <input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              required
              disabled={isLoading || isSuccess}
              autoComplete="current-password"
              value={password}
              onBlur={handleBlurPassword}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
                if (serverError) setServerError('');
              }}
              placeholder="••••••••••••"
              className={`w-full bg-[#faf9f7] border px-4 py-3 pr-11 text-sm text-[#1a1714] placeholder-[#a0978d] transition-all focus:outline-none focus:bg-white ${
                passwordError
                  ? 'border-[#a11826] bg-[#fffbfb] focus:border-[#a11826]'
                  : 'border-[#d6cfc5] focus:border-[#1a1714]'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#787065] hover:text-[#1a1714] p-1.5 focus:outline-none transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.3" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.3" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <circle cx="12" cy="12" r="3" strokeWidth="1.3" />
                </svg>
              )}
            </button>
          </div>
          {passwordError && (
            <p className="text-[11px] text-[#a11826] font-light flex items-center gap-1.5 pt-0.5">
              <span>●</span> {passwordError}
            </p>
          )}
        </div>

        {/* Options Bar */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[#787065] hover:text-[#1a1714]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-[#1a1714] w-3.5 h-3.5 rounded-none"
            />
            <span className="text-[11px] font-light">Keep session active (7 days)</span>
          </label>
          <span className="text-[10px] text-[#8e857b] uppercase tracking-wider">
            Encrypted TLS
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className="w-full py-4 bg-[#1a1714] text-white text-[11px] font-medium tracking-[0.25em] uppercase hover:bg-[#a11826] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3 relative overflow-hidden group shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4 text-[#d4af6a]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span>Verifying Credentials…</span>
            </>
          ) : isSuccess ? (
            <>
              <svg className="w-4 h-4 text-[#7ee787]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span>Welcome Back</span>
            </>
          ) : (
            <span>Access Private Account</span>
          )}
        </button>
      </form>

      {/* Footer Switch */}
      <div className="mt-8 pt-6 border-t border-[#e8e3db] text-center text-xs text-[#787065] space-y-2">
        <p className="font-light">Seeking first-time access to Maison Atelier?</p>
        <Link
          href={`/auth/sign-up${callbackUrl !== '/account' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#a11826] hover:text-[#1a1714] transition-colors underline underline-offset-4"
        >
          <span>Create a Private Account</span>
          <span className="text-xs">→</span>
        </Link>
      </div>
    </div>
  );
}
