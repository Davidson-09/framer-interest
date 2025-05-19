'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MoodboardDetail from '@/app/components/MoodboardDetail';
import PinterestLogin from '@/app/components/PinterestLogin';
import { useAuth } from '@/lib/auth/AuthContext';
import { verifyToken, getTokenFromUrl, cleanupUrl } from '@/lib/auth/authService';

export default function MoodboardPage({ params }: { params: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, userEmail, isAuthenticated, setToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Handle token from URL or context
  useEffect(() => {
    const initToken = async () => {
      try {
        // Check for token in URL (could be 'token' or 'access_token')
        const url = new URL(window.location.href);
        const urlToken = getTokenFromUrl(url);

        if (urlToken) {
          // Verify the token with the server
          const isValid = await verifyToken(urlToken);

          if (isValid) {
            // Store token in context if it's not already there or different
            if (!token || token !== urlToken) {
              setToken(urlToken);
            }
            setPageToken(urlToken);

            // Clean up URL by removing token parameters
            cleanupUrl();
          } else {
            console.error('Invalid token in URL');
            setPageToken(token); // Fall back to context token
          }
        } else if (token) {
          // Use token from context
          setPageToken(token);
        } else {
          console.log('No token found in URL or context');
          setPageToken(null);
        }
      } catch (error) {
        console.error('Error initializing token:', error);
        setPageToken(token); // Fall back to context token
      }
    };

    initToken();
  }, [searchParams, token, setToken]);

  // Verify authentication and show login prompt if needed
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated || !userEmail) {
          console.log('Not authenticated or no email, showing login prompt');
          setShowLoginPrompt(true);
          setIsLoading(false);
          return;
        }

        // Verify the token with the server
        const isValid = await verifyToken(pageToken);

        if (!isValid) {
          console.log('Token verification failed, showing login prompt');
          setShowLoginPrompt(true);
          setIsLoading(false);
        } else {
          setShowLoginPrompt(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error verifying authentication:', error);
        setShowLoginPrompt(true);
        setIsLoading(false);
      }
    };

    if (pageToken !== null) {
      verifyAuth();
    } else {
      // If we don't have a token yet, check if we're authenticated
      if (!isAuthenticated || !userEmail) {
        setShowLoginPrompt(true);
        setIsLoading(false);
      }
    }
  }, [router, isAuthenticated, userEmail, pageToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait while we load your moodboard.</p>
        </div>
      </div>
    );
  }

  // Show login prompt if needed
  if (showLoginPrompt) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Pinterest Moodboard</h1>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">
              You need to connect with Pinterest to view this moodboard.
            </p>
            <div className="flex justify-center">
              <PinterestLogin
                onLogin={(email) => {
                  // The PinterestLogin component will handle the redirect to Pinterest
                  // We'll store the current URL to return to after authentication
                  console.log(`Logging in with email: ${email}`);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <MoodboardDetail moodboardId={params.id} accessToken={pageToken} />
      </div>
    </div>
  );
}
