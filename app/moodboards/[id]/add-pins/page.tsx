'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PinSelector from '@/app/components/PinSelector';
import { useAuth } from '@/lib/auth/AuthContext';
import { verifyToken, getTokenFromUrl, cleanupUrl } from '@/lib/auth/authService';

interface Pin {
  id: string;
  title?: string;
  description?: string;
  media?: {
    images?: {
      [key: string]: {
        url: string;
        width: number;
        height: number;
      }
    }
  };
  link?: string;
}

export default function AddPinsPage({ params }: { params: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, userEmail, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingPins, setIsAddingPins] = useState(false);
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
  }, [searchParams, token]);

  // Verify authentication
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
        if (pageToken) {
          const isValid = await verifyToken(pageToken);

          if (!isValid) {
            console.log('Token verification failed, redirecting to moodboards page');
            router.push('/moodboards');
            return;
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error verifying authentication:', error);
        router.push('/moodboards');
      }
    };

    if (pageToken !== null) {
      verifyAuth();
    }
  }, [router, isAuthenticated, userEmail, pageToken]);

  const handlePinSelect = async (selectedPins: Pin[]) => {
    if (selectedPins.length === 0) return;

    setIsAddingPins(true);

    try {
      // Add each pin to the moodboard
      const addPromises = selectedPins.map(pin => {
        let url = `/api/moodboards/${params.id}/pins`;
        if (pageToken) {
          url += `?access_token=${encodeURIComponent(pageToken)}`;
        }

        return fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            pin_id: pin.id,
            pin_data: pin,
          }),
        });
      });

      await Promise.all(addPromises);

      // Redirect back to the moodboard page
      router.push(pageToken
        ? `/moodboards/${params.id}?token=${encodeURIComponent(pageToken)}`
        : `/moodboards/${params.id}`);
    } catch (err) {
      console.error('Error adding pins to moodboard:', err);
      alert('Failed to add pins to moodboard');
      setIsAddingPins(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait while we load your Pinterest pins.</p>
        </div>
      </div>
    );
  }

  // No need to check isAuthenticated here as we're already handling it in useEffect

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href={pageToken
              ? `/moodboards/${params.id}?token=${encodeURIComponent(pageToken)}`
              : `/moodboards/${params.id}`}
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Back to Moodboard
          </Link>
          <h1 className="text-3xl font-bold mb-6">Add Pins to Moodboard</h1>
        </div>

        {isAddingPins ? (
          <div className="text-center py-12">
            <p className="text-xl mb-2">Adding pins to your moodboard...</p>
            <p className="text-gray-600">Please wait, this may take a moment.</p>
          </div>
        ) : (
          <PinSelector onPinSelect={handlePinSelect} accessToken={token as string} />
        )}
      </div>
    </div>
  );
}
