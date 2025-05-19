'use client'

import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { initiatePinterestLogin } from '@/lib/auth/authService';

interface PinterestLoginProps {
  onLogin?: (email: string) => void;
}

export default function PinterestLogin({ onLogin }: PinterestLoginProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUserEmail } = useAuth();

  const handlePinterestLogin = () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
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
        Enter your email and connect your Pinterest account to create moodboards.
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
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
