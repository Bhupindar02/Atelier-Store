'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';

interface SignOutButtonProps {
  className?: string;
  variant?: 'outline' | 'minimal' | 'solid';
}

export default function SignOutButton({ className, variant = 'outline' }: SignOutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Sign out failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const baseStyles = 'inline-flex items-center justify-center text-[10px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  let variantStyles = '';
  if (variant === 'outline') {
    variantStyles = 'border border-[#d6cfc5] px-5 py-2.5 text-[#1a1714] hover:bg-[#1a1714] hover:text-white hover:border-[#1a1714]';
  } else if (variant === 'solid') {
    variantStyles = 'bg-[#1a1714] text-white px-5 py-2.5 hover:bg-[#a11826]';
  } else if (variant === 'minimal') {
    variantStyles = 'text-[#787065] hover:text-[#a11826] py-1 underline underline-offset-4';
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      className={className || `${baseStyles} ${variantStyles}`}
    >
      {isLoading ? 'Signing Out…' : 'Sign Out'}
    </button>
  );
}
