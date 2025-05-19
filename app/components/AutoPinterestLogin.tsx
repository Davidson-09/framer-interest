'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { initiatePinterestLogin } from '@/lib/auth/authService';

interface AutoPinterestLoginProps {
  email: string;
  onLogin?: (email: string) => void;
}

export default function AutoPinterestLogin({ email, onLogin }: AutoPinterestLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { setUserEmail } = useAuth();

  const handlePinterestLogin = () => {
    if (!email || !email.includes('@')) {
      alert('Invalid email address provided');
      return;
    }

    setIsLoading(true);

    // Store email in context and localStorage
    setUserEmail(email);

    // Call the onLogin prop if provided
    if (onLogin) {
      onLogin(email);
    }

    // Initiate Pinterest login
    initiatePinterestLogin(email);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <h2 className="text-xl font-semibold">Login with Pinterest</h2>
      <p className="text-sm text-gray-600">
        Connect your Pinterest account to view and manage your moodboards.
      </p>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">
          You will be logged in with: <span className="font-bold">{email}</span>
        </p>
      </div>

      <button
        onClick={handlePinterestLogin}
        disabled={isLoading}
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-[#E60023] text-white gap-2 hover:bg-[#ad081b] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Connecting...' : 'Connect with Pinterest'}
      </button>
    </div>
  );
}
