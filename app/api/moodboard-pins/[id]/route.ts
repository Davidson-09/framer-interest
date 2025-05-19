import { NextResponse, NextRequest } from 'next/server';
import { getMoodboardByNameAndEmail, getMoodboardPins, createDefaultMoodboards } from '@/lib/supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const email = searchParams.get('email');
    const moodboardName = context.params.id;

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    let moodboard = await getMoodboardByNameAndEmail(moodboardName, email);

    if (!moodboard && moodboardName.match(/^moodboard-[1-5]$/)) {
      try {
        await createDefaultMoodboards(email);
        moodboard = await getMoodboardByNameAndEmail(moodboardName, email);
      } catch (error) {
        console.error('Error creating default moodboards:', error);
      }
    }

    if (!moodboard) {
      return NextResponse.json(
        { error: 'Moodboard not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    const pins = await getMoodboardPins(moodboard.id);

    return NextResponse.json(
      { moodboard, pins },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch moodboard pins', details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: corsHeaders
  });
}
