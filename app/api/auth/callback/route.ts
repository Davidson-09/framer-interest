import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const clientId = process.env.PINTEREST_CLIENT_ID;
  const clientSecret = process.env.PINTEREST_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!clientId || !clientSecret || !baseUrl) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }

  try {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', clientId);
    formData.append('client_secret', clientSecret);
    formData.append('code', code);
    formData.append('redirect_uri', `${baseUrl}/api/auth/callback`);

    const response = await axios.post(
      'https://api.pinterest.com/v5/oauth/token',
      formData, // send the URLSearchParams directly, not as string
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return NextResponse.json({
      access_token: response.data.access_token,
      token_type: response.data.token_type,
      expires_in: response.data.expires_in,
    });
  } catch (error: any) {
    console.error('Error exchanging code for token:', error?.response?.data || error);
    return NextResponse.json({ error: 'Failed to exchange code for token' }, { status: 500 });
  }
}
