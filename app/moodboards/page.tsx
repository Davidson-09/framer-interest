'use client'

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PinterestLogin from '../components/PinterestLogin';
import MoodboardList from '../components/MoodboardList';
import { useAuth } from '@/lib/auth/AuthContext';
import { verifyToken, getTokenFromUrl, cleanupUrl } from '@/lib/auth/authService';

export default function MoodboardsPage() {
  const searchParams = useSearchParams();
  const { token, userEmail, isAuthenticated, login, setToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have a token in the URL (from Pinterest callback)
        const url = new URL(window.location.href);
        const urlToken = getTokenFromUrl(url);

        if (urlToken) {
          // Verify the token with the server
          const isValid = await verifyToken(urlToken);

          if (isValid) {
            // Get email from localStorage
            const email = localStorage.getItem('pinterest_user_email');

            if (email) {
              // Login with token and email
              login(urlToken, email);
            } else {
              // Just set the token if no email is found
              setToken(urlToken);
            }

            // Clean up URL by removing token parameters
            cleanupUrl();
          } else {
            console.error('Invalid token received from Pinterest');
          }
        } else if (token) {
          // If we already have a token in context, verify it
          const isValid = await verifyToken(token);

          if (!isValid) {
            console.warn('Stored token is invalid or expired');
          }
        }
      } catch (error) {
        console.error('Error during authentication initialization:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [searchParams, login, setToken, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait while we set up your moodboards.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Pinterest Moodboards</h1>

        {!isAuthenticated ? (
          <div className="flex justify-center">
            <PinterestLogin />
          </div>
        ) : (
          userEmail && <MoodboardList userEmail={userEmail} />
        )}
      </div>
    </div>
  );
}
