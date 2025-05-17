import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { parse } from 'cookie';

interface Board {
  id: string;
  name: string;
}

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

async function getAllBoards(accessToken: string) {
  const response = await axios.get('https://api.pinterest.com/v5/boards', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    params: {
      page_size: 100,
    },
  });
  return response.data.items as Board[];
}

async function getPinsForBoard(accessToken: string, boardId: string) {
  const response = await axios.get(`https://api.pinterest.com/v5/boards/${boardId}/pins`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    params: {
      page_size: 100,
    },
  });
  return response.data.items;
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

  console.log('the access token', accessToken)

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Pinterest access token not found in cookies' },
      {
        status: 401,
        headers: getCorsHeaders(request)
      }
    );
  }

  try {
    const boards = await getAllBoards(accessToken);

    const pinsPromises = boards.map((board: Board) =>
      getPinsForBoard(accessToken, board.id)
    );
    const pinsResults = await Promise.all(pinsPromises);

    const allPins = pinsResults.flat();

    // Return response with CORS headers
    return NextResponse.json(
      {
        total_pins: allPins.length,
        pins: allPins,
      },
      {
        headers: getCorsHeaders(request)
      }
    );
  } catch (error: any) {
    console.error('Error fetching pins:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to fetch pins' },
      {
        status: 500,
        headers: getCorsHeaders(request)
      }
    );
  }
}
