import { NextRequest, NextResponse } from 'next/server';
import { updatePinPosition, removePinFromMoodboard } from '@/lib/supabase';

// Update pin position
export async function PATCH(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    const pinId = params.pinId;
    const body = await request.json();
    const { position_x, position_y } = body;

    if (position_x === undefined || position_y === undefined) {
      return NextResponse.json(
        { error: 'Position X and Y are required' },
        { status: 400 }
      );
    }

    const pin = await updatePinPosition(pinId, position_x, position_y);
    
    return NextResponse.json({ pin });
  } catch (error: any) {
    console.error('Error updating pin position:', error.message);
    return NextResponse.json(
      { error: 'Failed to update pin position' },
      { status: 500 }
    );
  }
}

// Delete a specific pin from a moodboard
export async function DELETE(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    const pinId = params.pinId;
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
