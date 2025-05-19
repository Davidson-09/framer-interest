import { NextRequest, NextResponse } from 'next/server';
import { getMoodboardByNameAndEmail, createDefaultMoodboards } from '@/lib/supabase';

// Get a moodboard by name and email
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const email = searchParams.get('email');

    // Check for access token
    const accessToken = searchParams.get('access_token');

    // Here you would verify the access token if needed
    if (accessToken) {
      console.log('Using access token for authentication');
    }

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email parameters are required' },
        { status: 400 }
      );
    }

    // Try to get the moodboard
    console.log(`Attempting to get moodboard ${name} for ${email}`);
    let moodboard = await getMoodboardByNameAndEmail(name, email);
    console.log('Moodboard found:', moodboard ? 'Yes' : 'No');

    // If moodboard doesn't exist and it's one of the default moodboards (moodboard-1 through moodboard-5)
    if (!moodboard && name.match(/^moodboard-[1-5]$/)) {
      console.log(`Moodboard ${name} not found for ${email}, creating default moodboards`);

      try {
        // Create default moodboards for this user
        const defaultMoodboards = await createDefaultMoodboards(email);
        console.log(`Created ${defaultMoodboards.length} default moodboards`);

        // Try to get the moodboard again
        moodboard = await getMoodboardByNameAndEmail(name, email);
        console.log('Moodboard found after creation:', moodboard ? 'Yes' : 'No');
      } catch (error) {
        console.error('Error creating default moodboards:', error);
      }
    }

    if (!moodboard) {
      return NextResponse.json(
        { error: 'Moodboard not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ moodboard });
  } catch (error: any) {
    console.error('Error fetching moodboard by name:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch moodboard' },
      { status: 500 }
    );
  }
}
