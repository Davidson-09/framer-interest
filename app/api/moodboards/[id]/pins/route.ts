import { NextRequest, NextResponse } from 'next/server';
import { getMoodboardPins, addPinToMoodboard, removePinFromMoodboard } from '@/lib/supabase';

// Get all pins for a moodboard
export async function GET(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    // Check for access token
    const accessToken = request.nextUrl.searchParams.get('access_token');

    // Here you would verify the access token if needed
    // For now, we'll just log it and proceed
    if (accessToken) {
      console.log('Using access token for authentication');
    }

    const moodboardId = params.id;
    const pins = await getMoodboardPins(moodboardId);

    return NextResponse.json({ pins });
  } catch (error: any) {
    console.error('Error fetching moodboard pins:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch moodboard pins' },
      { status: 500 }
    );
  }
}

// Add a pin to a moodboard
export async function POST(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    // Check for access token
    const accessToken = request.nextUrl.searchParams.get('access_token');

    // Here you would verify the access token if needed
    // For now, we'll just log it and proceed
    if (accessToken) {
      console.log('Using access token for authentication');
    }

    const moodboardId = params.id;
    const body = await request.json();
    const { pin_id, pin_data, position_x, position_y } = body;

    if (!pin_id || !pin_data) {
      return NextResponse.json(
        { error: 'Pin ID and pin data are required' },
        { status: 400 }
      );
    }

    const pin = await addPinToMoodboard({
      moodboard_id: moodboardId,
      pin_id,
      pin_data,
      position_x,
      position_y,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ pin }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding pin to moodboard:', error.message);
    return NextResponse.json(
      { error: 'Failed to add pin to moodboard' },
      { status: 500 }
    );
  }
}

// Delete a pin from a moodboard
export async function DELETE(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    // Check for access token
    const accessToken = request.nextUrl.searchParams.get('access_token');

    // Here you would verify the access token if needed
    // For now, we'll just log it and proceed
    if (accessToken) {
      console.log('Using access token for authentication');
    }

    const moodboardId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const pinId = searchParams.get('pin_id');

    if (!pinId) {
      return NextResponse.json(
        { error: 'Pin ID is required' },
        { status: 400 }
      );
    }

    await removePinFromMoodboard(pinId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing pin from moodboard:', error.message);
    return NextResponse.json(
      { error: 'Failed to remove pin from moodboard' },
      { status: 500 }
    );
  }
}
