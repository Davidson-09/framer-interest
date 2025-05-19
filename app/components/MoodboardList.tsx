'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Moodboard } from '@/lib/supabase';
import { useAuth } from '@/lib/auth/AuthContext';

interface MoodboardListProps {
  userEmail: string;
}

export default function MoodboardList({ userEmail }: MoodboardListProps) {
  const { token } = useAuth();
  const [moodboards, setMoodboards] = useState<Moodboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMoodboardName, setNewMoodboardName] = useState('');
  const [newMoodboardDescription, setNewMoodboardDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!userEmail) return;

    const fetchMoodboards = async () => {
      try {
        setIsLoading(true);

        // Add token to the request if available
        let url = `/api/moodboards?email=${encodeURIComponent(userEmail)}`;
        if (token) {
          url += `&access_token=${token}`;
        }

        const response = await fetch(url, {
          credentials: 'include', // Include cookies if no access token
        });

        if (!response.ok) {
          throw new Error('Failed to fetch moodboards');
        }

        const data = await response.json();
        setMoodboards(data.moodboards);
      } catch (err) {
        setError('Error loading moodboards');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoodboards();
  }, [userEmail, token]);

  const handleCreateMoodboard = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMoodboardName.trim()) {
      alert('Please enter a moodboard name');
      return;
    }

    try {
      setIsCreating(true);

      // Add token to the request if available
      let url = '/api/moodboards';
      if (token) {
        url += `?access_token=${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies if no access token
        body: JSON.stringify({
          name: newMoodboardName,
          description: newMoodboardDescription,
          user_email: userEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create moodboard');
      }

      const data = await response.json();
      setMoodboards([data.moodboard, ...moodboards]);
      setNewMoodboardName('');
      setNewMoodboardDescription('');
    } catch (err) {
      console.error(err);
      alert('Failed to create moodboard');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading moodboards...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Moodboard</h2>
        <form onSubmit={handleCreateMoodboard} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={newMoodboardName}
              onChange={(e) => setNewMoodboardName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="My Awesome Moodboard"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={newMoodboardDescription}
              onChange={(e) => setNewMoodboardDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="A collection of my favorite design ideas"
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Moodboard'}
          </button>
        </form>
      </div>

      <h2 className="text-2xl font-bold mb-4">Your Moodboards</h2>

      {moodboards.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">You don't have any moodboards yet.</p>
          <p className="text-gray-500">Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {moodboards.map((moodboard) => (
            <Link
              href={token
                ? `/moodboards/${moodboard.id}?token=${token}`
                : `/moodboards/${moodboard.id}`}
              key={moodboard.id}
              className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1">{moodboard.name}</h3>
                {moodboard.description && (
                  <p className="text-gray-600 text-sm mb-2">{moodboard.description}</p>
                )}
                <p className="text-gray-400 text-xs">
                  Created {new Date(moodboard.created_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
