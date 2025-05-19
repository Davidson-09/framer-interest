import { NextRequest, NextResponse } from 'next/server';
import { supabase, createMoodboard, getMoodboardsByEmail } from '@/lib/supabase';

// Get all moodboards for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    // Check for access token
    const accessToken = searchParams.get('access_token');

    // Here you would verify the access token if needed
    // For now, we'll just log it and proceed
    if (accessToken) {
      console.log('Using access token for authentication');
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const moodboards = await getMoodboardsByEmail(email);

    return NextResponse.json({ moodboards });
  } catch (error: any) {
    console.error('Error fetching moodboards:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch moodboards' },
      { status: 500 }
    );
  }
}

// Create a new moodboard
export async function POST(request: NextRequest) {
  try {
    // Check for access token
    const accessToken = request.nextUrl.searchParams.get('access_token');

    // Here you would verify the access token if needed
    // For now, we'll just log it and proceed
    if (accessToken) {
      console.log('Using access token for authentication');
    }

    const body = await request.json();
    const { name, description, user_email } = body;

    if (!name || !user_email) {
      return NextResponse.json(
        { error: 'Name and user_email are required' },
        { status: 400 }
      );
    }

    const moodboard = await createMoodboard({
      name,
      description,
      user_email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ moodboard }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating moodboard:', error.message);
    return NextResponse.json(
      { error: 'Failed to create moodboard' },
      { status: 500 }
    );
  }
}
