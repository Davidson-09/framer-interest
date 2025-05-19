import { NextResponse } from 'next/server';
import { getMoodboardByNameAndEmail, getMoodboardPins, createDefaultMoodboards } from '@/lib/supabase';

// Set CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const email = searchParams.get('email');
    const moodboardName = searchParams.get('name');

    console.log(`API Request: GET /api/moodboard-pins-by-name?name=${moodboardName}&email=${email || 'undefined'}`);

    // Handle OPTIONS request for CORS preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (!email) {
      console.log('Email parameter is missing');
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!moodboardName) {
      console.log('Name parameter is missing');
      return NextResponse.json(
        { error: 'Name parameter is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Fetching moodboard ${moodboardName} for ${email}`);

    // First, get the moodboard ID by name and email
    let moodboard = await getMoodboardByNameAndEmail(moodboardName, email);
    console.log('Moodboard found:', moodboard ? 'Yes' : 'No');

    // If moodboard doesn't exist and it's one of the default moodboards (moodboard-1 through moodboard-5)
    if (!moodboard && moodboardName.match(/^moodboard-[1-5]$/)) {
      console.log(`Moodboard ${moodboardName} not found for ${email}, creating default moodboards`);
      
      try {
        // Create default moodboards for this user
        const defaultMoodboards = await createDefaultMoodboards(email);
        console.log(`Created ${defaultMoodboards.length} default moodboards`);
        
        // Try to get the moodboard again
        moodboard = await getMoodboardByNameAndEmail(moodboardName, email);
        console.log('Moodboard found after creation:', moodboard ? 'Yes' : 'No');
      } catch (error) {
        console.error('Error creating default moodboards:', error);
      }
    }

    if (!moodboard) {
      console.log(`Moodboard ${moodboardName} not found for ${email}`);
      return NextResponse.json(
        { error: 'Moodboard not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    console.log(`Found moodboard with ID: ${moodboard.id}`);

    // Then, get all pins for this moodboard
    const pins = await getMoodboardPins(moodboard.id);
    console.log(`Found ${pins.length} pins for moodboard ${moodboardName}`);

    // Return the pins with CORS headers
    return NextResponse.json({ 
      moodboard,
      pins 
    }, { 
      headers: corsHeaders 
    });
  } catch (error: any) {
    console.error('Error in API route:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch moodboard pins', details: error.message },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { 
    status: 200,
    headers: corsHeaders 
  });
}
