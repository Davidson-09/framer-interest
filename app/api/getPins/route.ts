import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface Board {
  id: string;
  name: string;
}

async function getAllBoards(accessToken: string) {
  const response = await axios.get('https://api.pinterest.com/v5/user_account/boards', {
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
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    // Get all boards
    const boards = await getAllBoards(accessToken);
    
    // Get pins for each board
    const pinsPromises = boards.map((board: Board) => getPinsForBoard(accessToken, board.id));
    const pinsResults = await Promise.all(pinsPromises);
    
    // Flatten the array of pin arrays
    const allPins = pinsResults.flat();
    
    return NextResponse.json({
      total_pins: allPins.length,
      pins: allPins,
    });
  } catch (error) {
    console.error('Error fetching pins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pins' },
      { status: 500 }
    );
  }
} 