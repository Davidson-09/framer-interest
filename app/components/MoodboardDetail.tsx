'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Moodboard, MoodboardPin } from '@/lib/supabase';

interface MoodboardDetailProps {
  moodboardId: string;
  accessToken?: string | null;
}

export default function MoodboardDetail({ moodboardId, accessToken }: MoodboardDetailProps) {
  const [moodboard, setMoodboard] = useState<Moodboard | null>(null);
  const [pins, setPins] = useState<MoodboardPin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMoodboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch moodboard details
        let moodboardUrl = `/api/moodboards/${moodboardId}`;
        if (accessToken) {
          moodboardUrl += `?access_token=${accessToken}`;
        }

        const moodboardResponse = await fetch(moodboardUrl, {
          credentials: 'include', // Include cookies if no access token
        });

        if (!moodboardResponse.ok) {
          throw new Error('Failed to fetch moodboard');
        }
        const moodboardData = await moodboardResponse.json();
        setMoodboard(moodboardData.moodboard);

        // Fetch moodboard pins
        let pinsUrl = `/api/moodboards/${moodboardId}/pins`;
        if (accessToken) {
          pinsUrl += `?access_token=${accessToken}`;
        }

        const pinsResponse = await fetch(pinsUrl, {
          credentials: 'include', // Include cookies if no access token
        });

        if (!pinsResponse.ok) {
          throw new Error('Failed to fetch moodboard pins');
        }
        const pinsData = await pinsResponse.json();
        setPins(pinsData.pins);
      } catch (err) {
        console.error(err);
        setError('Error loading moodboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoodboardData();
  }, [moodboardId, accessToken]);

  const handleRemovePin = async (pinId: string) => {
    if (!confirm('Are you sure you want to remove this pin from the moodboard?')) {
      return;
    }

    try {
      // Add access token to the request if available
      let url = `/api/moodboards/${moodboardId}/pins/${pinId}`;
      if (accessToken) {
        url += `?access_token=${accessToken}`;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include', // Include cookies if no access token
      });

      if (!response.ok) {
        throw new Error('Failed to remove pin');
      }

      // Update the UI by removing the pin
      setPins(pins.filter(pin => pin.id !== pinId));
    } catch (err) {
      console.error(err);
      alert('Failed to remove pin');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading moodboard...</div>;
  }

  if (error || !moodboard) {
    return <div className="text-center py-8 text-red-500">{error || 'Moodboard not found'}</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href={`https://infam.framer.website/${moodboard?.name}`} className="text-blue-600 hover:underline mb-4 inline-block">
          ← Done
        </Link>
        <h1 className="text-3xl font-bold mb-2">{moodboard.name}</h1>
        {moodboard.description && (
          <p className="text-gray-600 mb-4">{moodboard.description}</p>
        )}
        <div className="flex items-center text-sm text-gray-500">
          <span>Created {new Date(moodboard.created_at).toLocaleDateString()}</span>
          <span className="mx-2">•</span>
          <span>{pins.length} pin{pins.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Pins</h2>
        <Link
          href={accessToken
            ? `/moodboards/${moodboardId}/add-pins?token=${accessToken}`
            : `/moodboards/${moodboardId}/add-pins`}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Pins
        </Link>
      </div>

      {pins.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">This moodboard doesn't have any pins yet.</p>
          <Link
            href={accessToken
              ? `/moodboards/${moodboardId}/add-pins?token=${accessToken}`
              : `/moodboards/${moodboardId}/add-pins`}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Pins from Pinterest
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {pins.map((pin) => {
            const pinData = pin.pin_data;
            const imageUrl = pinData?.media?.images?.["600x"]?.url;

            return (
              <div key={pin.id} className="relative rounded-lg overflow-hidden shadow-md group">
                {imageUrl ? (
                  <div className="aspect-square relative">
                    <Image
                      src={imageUrl}
                      alt={pinData?.title || 'Pinterest Pin'}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No image</span>
                  </div>
                )}

                <div className="p-3 bg-white">
                  <h3 className="text-sm font-medium truncate">{pinData?.title || 'Untitled'}</h3>
                  {pinData?.description && (
                    <p className="text-xs text-gray-500 truncate mt-1">{pinData.description}</p>
                  )}
                </div>

                <button
                  onClick={() => handleRemovePin(pin.id)}
                  className="absolute top-2 right-2 bg-white bg-opacity-80 text-red-500 rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove pin"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
