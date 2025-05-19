'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';

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

interface PinSelectorProps {
  onPinSelect: (pins: Pin[]) => void;
  accessToken?: string;
}

export default function PinSelector({ onPinSelect, accessToken }: PinSelectorProps) {
  const [pins, setPins] = useState<Pin[]>([]);
  const [selectedPins, setSelectedPins] = useState<Pin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token: contextToken } = useAuth();

  useEffect(() => {
    const fetchPins = async () => {
      try {
        setIsLoading(true);

        // Determine how to fetch pins based on whether we have an access token
        // Use the prop accessToken first, then fall back to the token from context
        const tokenToUse = accessToken || contextToken;

        let url = '/api/getPins';
        if (tokenToUse) {
          url += `?access_token=${tokenToUse}`;
        }

        const response = await fetch(url, {
          credentials: 'include', // Include cookies if no access token
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pins');
        }

        const data = await response.json();
        setPins(data.pins || []);
      } catch (err) {
        console.error('Error fetching pins:', err);
        setError('Failed to load pins from Pinterest');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPins();
  }, [accessToken, contextToken]);

  const togglePinSelection = (pin: Pin) => {
    if (selectedPins.some(p => p.id === pin.id)) {
      setSelectedPins(selectedPins.filter(p => p.id !== pin.id));
    } else {
      setSelectedPins([...selectedPins, pin]);
    }
  };

  const handleAddSelectedPins = () => {
    if (selectedPins.length === 0) {
      alert('Please select at least one pin');
      return;
    }

    onPinSelect(selectedPins);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading pins from Pinterest...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (pins.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No pins found in your Pinterest account.</p>
        <p className="text-gray-500">Try saving some pins on Pinterest first!</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Select Pins from Pinterest</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {selectedPins.length} pin{selectedPins.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleAddSelectedPins}
            disabled={selectedPins.length === 0}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Add Selected Pins
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {pins.map((pin) => {
          const isSelected = selectedPins.some(p => p.id === pin.id);
          const imageUrl = pin.media?.images?.["600x"]?.url;

          return (
            <div
              key={pin.id}
              onClick={() => togglePinSelection(pin)}
              className={`
                relative rounded-lg overflow-hidden cursor-pointer transition-all
                ${isSelected ? 'ring-4 ring-blue-500 scale-95' : 'hover:shadow-lg'}
              `}
            >
              {imageUrl ? (
                <div className="aspect-square relative">
                  <Image
                    src={imageUrl}
                    alt={pin.title || 'Pinterest Pin'}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No image</span>
                </div>
              )}

              {isSelected && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                  ✓
                </div>
              )}

              <div className="p-2 bg-white">
                <h3 className="text-sm font-medium truncate">{pin.title || 'Untitled'}</h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
