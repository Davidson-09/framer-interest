import { NextRequest, NextResponse } from 'next/server';
import { getMoodboardById, updateMoodboard, deleteMoodboard } from '@/lib/supabase';

// Get a specific moodboard
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check for access token
    const accessToken = request.nextUrl.searchParams.get('access_token');

    // Here you would verify the access token if needed
    // For now, we'll just log it and proceed
    if (accessToken) {
      console.log('Using access token for authentication');
    }

    const id = params.id;
    const moodboard = await getMoodboardById(id);

    return NextResponse.json({ moodboard });
  } catch (error: any) {
    console.error('Error fetching moodboard:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch moodboard' },
      { status: 500 }
    );
  }
}

// Update a moodboard
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check for access token
    const accessToken = request.nextUrl.searchParams.get('access_token');

    // Here you would verify the access token if needed
    // For now, we'll just log it and proceed
    if (accessToken) {
      console.log('Using access token for authentication');
    }

    const id = params.id;
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const moodboard = await updateMoodboard(id, {
      name,
      description,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ moodboard });
  } catch (error: any) {
    console.error('Error updating moodboard:', error.message);
    return NextResponse.json(
      { error: 'Failed to update moodboard' },
      { status: 500 }
    );
  }
}

// Delete a moodboard
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check for access token
    const accessToken = request.nextUrl.searchParams.get('access_token');

    // Here you would verify the access token if needed
    // For now, we'll just log it and proceed
    if (accessToken) {
      console.log('Using access token for authentication');
    }

    const id = params.id;
    await deleteMoodboard(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting moodboard:', error.message);
    return NextResponse.json(
      { error: 'Failed to delete moodboard' },
      { status: 500 }
    );
  }
}
