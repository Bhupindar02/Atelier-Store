'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signUp } from '@/lib/auth-client';

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/account';

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // Field validation error states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [serverError, setServerError] = useState('');

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const strengthLabels = ['Minimal', 'Basic', 'Moderate', 'Strong', 'Atelier Grade'];
  const strengthColors = ['bg-[#e8e3db]', 'bg-[#ef4444]', 'bg-[#f59e0b]', 'bg-[#10b981]', 'bg-[#d4af6a]'];

  // Validators
  const validateName = (val: string) => {
    if (!val.trim()) return 'Please enter your full name.';
    if (val.trim().length < 2) return 'Full name must be at least 2 characters.';
    return '';
  };

  const validateEmail = (val: string) => {
    if (!val.trim()) return 'Email address is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      return 'Please enter a valid email address (e.g. client@domain.com).';
    }
    return '';
  };

  const validatePassword = (val: string) => {
    if (!val) return 'Password is required.';
    if (val.length < 8) return 'Password must be at least 8 characters.';
    return '';
  };

  const validateConfirmPassword = (val: string, origPass: string) => {
    if (!val) return 'Please confirm your password.';
    if (val !== origPass) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const errName = validateName(name);
    const errEmail = validateEmail(email);
    const errPass = validatePassword(password);
    const errConfirm = validateConfirmPassword(confirmPassword, password);
    const errTerms = !acceptedTerms ? 'Please accept the Maison Atelier Terms of Service to proceed.' : '';

    setNameError(errName);
    setEmailError(errEmail);
    setPasswordError(errPass);
    setConfirmPasswordError(errConfirm);
    setTermsError(errTerms);

    if (errName || errEmail || errPass || errConfirm || errTerms) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (response.error) {
        const msg = response.error.message || 'Registration could not be completed. Please check your details.';
        setServerError(msg);
        setIsLoading(false);
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 700);
      }
    } catch {
      setServerError('A network error occurred while establishing your account with the Atelier database. Please retry.');
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
            MAISON ATELIER
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#1a1714]">
          Create Account
        </h1>
        <p className="text-xs text-[#787065] font-light leading-relaxed max-w-xs mx-auto">
          Register to preserve your bespoke wishlists, orders, and private salon appointments.
        </p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="mb-6 p-4 bg-[#fdf2f2] border-l-2 border-[#a11826] text-[#a11826] flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 6.75h.008v.008H12v-.008Z" />
            </svg>
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-wider font-semibold">Registration Notice</p>
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
            <p className="text-[10px] uppercase tracking-wider font-semibold">Account Established</p>
            <p className="text-xs font-light">Welcome to Maison Atelier. Initializing your client portfolio…</p>
          </div>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-name"
            className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#3a3530] block"
          >
            Full Name
          </label>
          <input
            id="signup-name"
            type="text"
            required
            disabled={isLoading || isSuccess}
            autoComplete="name"
            value={name}
            onBlur={() => {
              if (name) setNameError(validateName(name));
            }}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
              if (serverError) setServerError('');
            }}
            placeholder="Éléonore de Valmont"
            className={`w-full bg-[#faf9f7] border px-4 py-3 text-sm text-[#1a1714] placeholder-[#a0978d] transition-all focus:outline-none focus:bg-white ${
              nameError
                ? 'border-[#a11826] bg-[#fffbfb] focus:border-[#a11826]'
                : 'border-[#d6cfc5] focus:border-[#1a1714]'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          />
          {nameError && (
            <p className="text-[11px] text-[#a11826] font-light flex items-center gap-1.5 pt-0.5">
              <span>●</span> {nameError}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="signup-email"
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
          <input
            id="signup-email"
            type="email"
            required
            disabled={isLoading || isSuccess}
            autoComplete="email"
            value={email}
            onBlur={() => {
              if (email) setEmailError(validateEmail(email));
            }}
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
          {emailError && (
            <p className="text-[11px] text-[#a11826] font-light flex items-center gap-1.5 pt-0.5">
              <span>●</span> {emailError}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="signup-password"
              className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#3a3530] block"
            >
              Password
            </label>
            {password && (
              <span className="text-[9px] uppercase tracking-wider text-[#787065] font-mono">
                Strength: <strong className="text-[#1a1714]">{strengthLabels[passwordStrength]}</strong>
              </span>
            )}
          </div>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              disabled={isLoading || isSuccess}
              autoComplete="new-password"
              value={password}
              onBlur={() => {
                if (password) setPasswordError(validatePassword(password));
              }}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
                if (confirmPassword && e.target.value !== confirmPassword) {
                  setConfirmPasswordError('Passwords do not match.');
                } else if (confirmPassword) {
                  setConfirmPasswordError('');
                }
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

          {/* Password Strength Meter Bars */}
          <div className="pt-1.5 space-y-1">
            <div className="grid grid-cols-4 gap-1.5 h-1">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-full transition-all duration-300 ${
                    passwordStrength >= step
                      ? strengthColors[passwordStrength]
                      : 'bg-[#e8e3db]'
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-[#8e857b] font-light">
              Must be at least 8 characters. Uppercase, numbers & symbols recommended.
            </p>
          </div>

          {passwordError && (
            <p className="text-[11px] text-[#a11826] font-light flex items-center gap-1.5 pt-0.5">
              <span>●</span> {passwordError}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="signup-confirm-password"
              className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#3a3530] block"
            >
              Confirm Password
            </label>
            {confirmPassword && password && confirmPassword === password && (
              <span className="text-[9px] uppercase tracking-wider text-[#2d5a3c] font-medium flex items-center gap-1">
                ✓ Matching
              </span>
            )}
          </div>
          <div className="relative">
            <input
              id="signup-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              disabled={isLoading || isSuccess}
              autoComplete="new-password"
              value={confirmPassword}
              onBlur={() => {
                if (confirmPassword) {
                  setConfirmPasswordError(validateConfirmPassword(confirmPassword, password));
                }
              }}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmPasswordError) setConfirmPasswordError('');
                if (serverError) setServerError('');
              }}
              placeholder="••••••••••••"
              className={`w-full bg-[#faf9f7] border px-4 py-3 pr-11 text-sm text-[#1a1714] placeholder-[#a0978d] transition-all focus:outline-none focus:bg-white ${
                confirmPasswordError
                  ? 'border-[#a11826] bg-[#fffbfb] focus:border-[#a11826]'
                  : 'border-[#d6cfc5] focus:border-[#1a1714]'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#787065] hover:text-[#1a1714] p-1.5 focus:outline-none transition-colors"
              aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
            >
              {showConfirmPassword ? (
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
          {confirmPasswordError && (
            <p className="text-[11px] text-[#a11826] font-light flex items-center gap-1.5 pt-0.5">
              <span>●</span> {confirmPasswordError}
            </p>
          )}
        </div>

        {/* Terms & Privacy Agreement */}
        <div className="pt-1 space-y-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-[#787065] hover:text-[#1a1714]">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (termsError) setTermsError('');
              }}
              className="accent-[#1a1714] w-3.5 h-3.5 rounded-none mt-0.5"
            />
            <span className="text-[11px] font-light leading-snug">
              I acknowledge and agree to the Maison Atelier{' '}
              <span className="underline underline-offset-2 text-[#1a1714]">Client Terms</span>{' '}
              and private portfolio data protection policy.
            </span>
          </label>
          {termsError && (
            <p className="text-[11px] text-[#a11826] font-light flex items-center gap-1.5 pt-0.5">
              <span>●</span> {termsError}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className="w-full py-4 bg-[#1a1714] text-white text-[11px] font-medium tracking-[0.25em] uppercase hover:bg-[#a11826] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3 relative overflow-hidden group shadow-sm hover:shadow-md mt-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4 text-[#d4af6a]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span>Creating Client Record…</span>
            </>
          ) : isSuccess ? (
            <>
              <svg className="w-4 h-4 text-[#7ee787]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span>Account Created</span>
            </>
          ) : (
            <span>Register Private Account</span>
          )}
        </button>
      </form>

      {/* Footer Switch */}
      <div className="mt-8 pt-6 border-t border-[#e8e3db] text-center text-xs text-[#787065] space-y-2">
        <p className="font-light">Already hold an established account?</p>
        <Link
          href={`/auth/sign-in${callbackUrl !== '/account' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#a11826] hover:text-[#1a1714] transition-colors underline underline-offset-4"
        >
          <span>Sign In to Existing Account</span>
          <span className="text-xs">→</span>
        </Link>
      </div>
    </div>
  );
}
