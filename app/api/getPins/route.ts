import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { parse } from 'cookie';

interface Board {
  id: string;
  name: string;
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

export async function GET(request: NextRequest) {
  // Parse cookies
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parse(cookieHeader);
  const accessToken = cookies.pinterest_token;

  console.log('the acess token', accessToken)

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Pinterest access token not found in cookies' },
      { status: 401 }
    );
  }

  try {
    const boards = await getAllBoards(accessToken);

    const pinsPromises = boards.map((board: Board) =>
      getPinsForBoard(accessToken, board.id)
    );
    const pinsResults = await Promise.all(pinsPromises);

    const allPins = pinsResults.flat();

    return NextResponse.json({
      total_pins: allPins.length,
      pins: allPins,
    });
    // return NextResponse.json({
    //   boards: boards,
    // });
  } catch (error: any) {
    console.error('Error fetching pins:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to fetch pins' },
      { status: 500 }
    );
  }
}
