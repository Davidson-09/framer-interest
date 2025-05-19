'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MoodboardDetail from '@/app/components/MoodboardDetail';
import { useAuth } from '@/lib/auth/AuthContext';
import { verifyToken, getTokenFromUrl, cleanupUrl } from '@/lib/auth/authService';

export default function MoodboardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, userEmail, isAuthenticated, setToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [pageToken, setPageToken] = useState<string | null>(null);

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

  // Verify authentication and redirect if needed
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated || !userEmail) {
          console.log('Not authenticated or no email, redirecting to moodboards page');
          router.push('/moodboards');
          return;
        }

        // Verify the token with the server
        const isValid = await verifyToken(pageToken);

        if (!isValid) {
          console.log('Token verification failed, redirecting to moodboards page');
          router.push('/moodboards');
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error verifying authentication:', error);
        router.push('/moodboards');
      }
    };

    if (pageToken !== null) {
      verifyAuth();
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

  // No need to check isAuthenticated here as we're already handling it in useEffect

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <MoodboardDetail moodboardId={params.id} accessToken={pageToken} />
      </div>
    </div>
  );
}
