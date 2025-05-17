import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { parse } from 'cookie';

// Function to get CORS headers based on the request origin
function getCorsHeaders(request: NextRequest) {
  // Get the origin from the request headers
  const origin = request.headers.get('origin') || '';

  return {
    'Access-Control-Allow-Origin': origin, // Use the specific origin
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request),
  });
}

export async function GET(request: NextRequest) {
  // Parse cookies
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parse(cookieHeader);
  const accessToken = cookies.pinterest_token;

  if (!accessToken) {
    return NextResponse.json(
      { 
        isAuthenticated: false,
        error: 'Pinterest access token not found in cookies' 
      },
      {
        status: 401,
        headers: getCorsHeaders(request)
      }
    );
  }

  try {
    // Verify the token by making a simple request to the Pinterest API
    await axios.get('https://api.pinterest.com/v5/user_account', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // If the request succeeds, the token is valid
    return NextResponse.json(
      { 
        isAuthenticated: true,
        message: 'Token is valid' 
      },
      {
        headers: getCorsHeaders(request)
      }
    );
  } catch (error: any) {
    console.error('Error verifying token:', error.response?.data || error.message);
    
    // If the request fails, the token is invalid or expired
    return NextResponse.json(
      { 
        isAuthenticated: false,
        error: 'Invalid or expired token' 
      },
      {
        status: 401,
        headers: getCorsHeaders(request)
      }
    );
  }
}
