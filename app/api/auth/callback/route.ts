import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import qs from 'qs';
import { serialize } from 'cookie';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Parse the state parameter to get the returnTo URL
  let returnTo = '';
  if (state) {
    try {
      const stateObj = JSON.parse(decodeURIComponent(state));
      returnTo = stateObj.returnTo || '';
    } catch (error) {
      console.error('Error parsing state parameter:', error);
    }
  }

  if (!code) {
    return NextResponse.json(
      { error: 'No code provided' },
      { status: 400 }
    );
  }

  const clientId = process.env.PINTEREST_CLIENT_ID;
  const clientSecret = process.env.PINTEREST_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!clientId || !clientSecret || !baseUrl) {
    return NextResponse.json(
      { error: 'Missing environment variables' },
      { status: 500 }
    );
  }

  try {
    const payload = qs.stringify({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${baseUrl}/api/auth/callback`,
    });

    const combo = `${clientId}:${clientSecret}`;
    const encodedCombo = Buffer.from(combo).toString('base64');

    const response = await axios.post(
      'https://api.pinterest.com/v5/oauth/token',
      payload,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${encodedCombo}`,
        },
      }
    );

    const { access_token } = response.data;
    console.log('the access token', access_token)

    // Set token in secure HttpOnly cookie
    const cookie = serialize('pinterest_token', access_token, {
      httpOnly: false, // Allow JavaScript access (required for external sites)
      secure: true, // Must be true when using SameSite=None
      sameSite: 'none', // Enable cross-site cookie sending
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    // Determine where to redirect the user
    // If returnTo is provided and is a valid URL, redirect there
    // Otherwise, use the default redirect URL
    const redirectUrl = returnTo || `https://infam.framer.website/moodboard-1?token=${access_token}`;

    const res = NextResponse.redirect(redirectUrl);
    res.headers.set('Set-Cookie', cookie);
    return res;

  } catch (error) {
    if (error instanceof Error) {
      // AxiosError may have a 'response' property, but not all Errors do
      const axiosError = error as any;
      console.error(
        'Error exchanging code for token:',
        axiosError.response?.data || error.message
      );
    } else {
      console.error('Error exchanging code for token:', error);
    }
    return NextResponse.json(
      { error: 'Failed to exchange code for token' },
      { status: 500 }
    );
  }
}
