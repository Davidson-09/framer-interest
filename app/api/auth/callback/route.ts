import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import qs from 'qs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  console.log('the code', code)
  
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

    const combo = `${clientId}:${clientSecret}`
    const encodedCombo = Buffer.from(combo).toString('base64');

    const response = await axios.post(
      'https://api.pinterest.com/v5/oauth/token',
      payload,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${encodedCombo}`
        },
      }
    );

    return NextResponse.json({
      access_token: response.data.access_token,
      token_type: response.data.token_type,
      expires_in: response.data.expires_in,
    });
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return NextResponse.json(
      { error: 'Failed to exchange code for token' },
      { status: 500 }
    );
  }
} 