'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MoodboardDetail from '@/app/components/MoodboardDetail';
import AutoPinterestLogin from '@/app/components/AutoPinterestLogin';
import { useAuth } from '@/lib/auth/AuthContext';
import { verifyToken, getTokenFromUrl, cleanupUrl } from '@/lib/auth/authService';

interface Moodboard {
  id: string;
  name: string;
  description?: string;
  user_email: string;
  created_at: string;
  updated_at: string;
}

export default function UserMoodboardPage({ params }: { params: { name: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { token, userEmail, isAuthenticated, setToken, setUserEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [moodboard, setMoodboard] = useState<Moodboard | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Store the email from the query parameter in the auth context
  useEffect(() => {
    if (email && !userEmail) {
      setUserEmail(email);
    }
  }, [email, userEmail, setUserEmail]);

  // Fetch moodboard data
  useEffect(() => {
    const fetchMoodboard = async () => {
      if (showLoginPrompt || isLoading || !email) {
        return;
      }

      try {
        // Fetch moodboard by name and email
        let url = `/api/moodboards/by-name?name=${encodeURIComponent(params.name)}&email=${encodeURIComponent(email)}`;
        if (pageToken) {
          url += `&access_token=${encodeURIComponent(pageToken)}`;
        }

        const response = await fetch(url, {
          credentials: 'include', // Include cookies if no access token
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch moodboard: ${response.statusText}`);
        }

        const data = await response.json();
        setMoodboard(data.moodboard);
        setError(null);
      } catch (err) {
        console.error('Error fetching moodboard:', err);
        setError('Failed to load moodboard');
      }
    };

    fetchMoodboard();
  }, [params.name, email, pageToken, showLoginPrompt, isLoading]);

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

  if (!email) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8 text-red-500">
            Email parameter is required. Please use a URL like /user-moodboards/{params.name}?email=your@email.com
          </div>
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
              <AutoPinterestLogin
                email={email || ''}
                onLogin={(loginEmail: string) => {
                  // The AutoPinterestLogin component will handle the redirect to Pinterest
                  console.log(`Logging in with email: ${loginEmail}`);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !moodboard) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8 text-red-500">
            {error || 'Moodboard not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <MoodboardDetail moodboardId={moodboard.id} accessToken={pageToken} />
      </div>
    </div>
  );
}
