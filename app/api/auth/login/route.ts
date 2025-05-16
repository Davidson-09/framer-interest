import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.PINTEREST_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!clientId || !baseUrl) {
    return new NextResponse(
      JSON.stringify({ error: 'Missing environment variables' }),
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Get the returnTo parameter from the query string, or use the base URL as default
  const searchParams = request.nextUrl.searchParams;
  const returnTo = searchParams.get('returnTo') || `${baseUrl}/`;

  // Encode the returnTo URL to be passed as state parameter
  const state = encodeURIComponent(JSON.stringify({ returnTo }));

  const redirectUri = `${baseUrl}/api/auth/callback`;
  const scope = 'boards:read,pins:read';

  const authUrl = `https://www.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&state=${state}`;

  return new NextResponse(null, {
    status: 302,
    headers: {
      'Access-Control-Allow-Origin': '*', // Allow requests from any origin (for development)
      'Location': authUrl,
    },
  });
}
